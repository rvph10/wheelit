"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWheelShare } from "@/lib/useWheelShare";
import {
  X,
  Download,
  Share2,
  Copy,
  FileText,
  Image,
  FileJson,
  FileSpreadsheet,
  CheckCircle,
  Users,
  Trophy,
  Calendar,
  Clock,
  UserMinus,
  QrCode,
  Smartphone,
  MessageCircle,
  Twitter,
  Facebook,
  Send,
} from "lucide-react";

type WheelMode = "simple" | "teams" | "weighted" | "multiple";

interface WheelItem {
  id: string;
  name: string;
  weight?: number;
  color?: string;
  locked?: boolean; // Add locked property for weight mode
}

// Add team constraint interface
interface TeamConstraint {
  id: string;
  item1Id: string;
  item2Id: string;
  type: "avoid" | "separate";
}

interface WheelConfig {
  mode: WheelMode;
  items: WheelItem[];
  teamCount?: number;
  selectCount?: number;
  removeAfterSpin?: boolean;
  teamConstraints?: TeamConstraint[]; // Add constraints support
}

interface SpinResult {
  type: "simple" | "teams" | "weighted" | "multiple";
  selectedItems?: WheelItem[];
  teams?: WheelItem[][];
  timestamp: number;
  position?: number;
}

interface ShareExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WheelConfig;
  result: SpinResult | null;
  spinHistory: SpinResult[];
}

/**
 * Enhanced Share & Export Modal Component
 * Provides comprehensive sharing and exporting options including:
 * - Multiple export formats (JSON, CSV, TXT, Image)
 * - Social media sharing
 * - Copy to clipboard
 * - Custom sharing messages
 */
export default function ShareExportModal({
  isOpen,
  onClose,
  config,
  result,
  spinHistory,
}: ShareExportModalProps) {
  const [activeTab, setActiveTab] = useState<"share" | "export">("share");
  const [customMessage, setCustomMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [nativeSharing, setNativeSharing] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const resultCardRef = useRef<HTMLDivElement>(null);

  // Use the wheel share hook
  const wheelShare = useWheelShare();

  // Generate QR code
  const generateQRCode = useCallback((url: string) => {
    try {
      // Dynamic import to avoid SSR issues
      import("qrcode-generator").then((QRCode) => {
        const qr = QRCode.default(0, "M");
        qr.addData(url);
        qr.make();

        // Create canvas for QR code
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const moduleCount = qr.getModuleCount();
        const cellSize = 8;
        const margin = 4;
        const size = moduleCount * cellSize + margin * 2;

        canvas.width = size;
        canvas.height = size;

        // Fill background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);

        // Draw QR code
        ctx.fillStyle = "#000000";
        for (let row = 0; row < moduleCount; row++) {
          for (let col = 0; col < moduleCount; col++) {
            if (qr.isDark(row, col)) {
              ctx.fillRect(
                col * cellSize + margin,
                row * cellSize + margin,
                cellSize,
                cellSize
              );
            }
          }
        }

        setQrCodeDataUrl(canvas.toDataURL());
      });
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    }
  }, []);

  // Generate shareable URL with configuration
  const generateShareUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    return wheelShare.generateShareUrl(config);
  }, [config, wheelShare]);

  // Initialize share URL when modal opens
  useEffect(() => {
    if (isOpen) {
      const url = generateShareUrl();
      setShareUrl(url);
      // Generate QR code when modal opens
      if (url) {
        generateQRCode(url);
      }
    }
  }, [isOpen, generateShareUrl, generateQRCode]);

  // Handle native sharing
  const handleNativeShare = async () => {
    setNativeSharing(true);
    const shareText = formatResultText();
    const success = await wheelShare.handleNativeShare(
      "WheelIt Results",
      shareText,
      shareUrl
    );
    if (!success) {
      // Fallback to copying text
      await copyToClipboard(shareText);
    }
    setNativeSharing(false);
  };

  // Handle social media sharing
  const handleSocialShare = (platform: string) => {
    const shareText = formatResultText();
    const socialUrl = wheelShare.getSocialShareUrl(
      platform,
      shareUrl,
      shareText
    );
    if (socialUrl) {
      window.open(socialUrl, "_blank", "width=600,height=400");
    }
  };

  if (!isOpen) return null;

  const formatResultText = (): string => {
    if (!result) return "";

    const baseText = customMessage || "Check out my WheelIt results! 🎯";

    if (result.type === "teams" && result.teams) {
      const teamsText = result.teams
        .map(
          (team, i) => `Team ${i + 1}: ${team.map((m) => m.name).join(", ")}`
        )
        .join("\n");

      // Add constraint information if any
      let constraintText = "";
      if (config.teamConstraints && config.teamConstraints.length > 0) {
        const getItemName = (id: string) =>
          config.items.find((item) => item.id === id)?.name || "Unknown";
        constraintText = `\n\nConstraints applied:\n${config.teamConstraints
          .map(
            (c) =>
              `• ${getItemName(c.item1Id)} & ${getItemName(
                c.item2Id
              )} kept separate`
          )
          .join("\n")}`;
      }

      return `${baseText}\n\n${teamsText}${constraintText}\n\nTry it yourself: ${shareUrl}`;
    } else if (result.selectedItems) {
      const itemsText = result.selectedItems
        .map((item) =>
          config.mode === "weighted" && item.weight
            ? `${item.name} (${item.weight}%)`
            : item.name
        )
        .join(", ");
      return `${baseText}\n\nResult: ${itemsText}\n\nTry it yourself: ${shareUrl}`;
    }

    return `${baseText}\n\nTry it yourself: ${shareUrl}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const exportToJSON = () => {
    const data = {
      timestamp: new Date().toISOString(),
      config,
      result,
      history: spinHistory,
      metadata: {
        appName: "WheelIt",
        version: "1.0.0",
        exportType: "complete",
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    downloadFile(blob, `wheelit-export-${Date.now()}.json`);
  };

  const exportToCSV = () => {
    if (!result) return;

    let csvContent = "";

    if (result.type === "teams" && result.teams) {
      csvContent = "Team,Members\n";
      result.teams.forEach((team, index) => {
        csvContent += `Team ${index + 1},"${team
          .map((m) => m.name)
          .join(", ")}"\n`;
      });
    } else if (result.selectedItems) {
      csvContent = "Item,Weight,Timestamp\n";
      result.selectedItems.forEach((item) => {
        csvContent += `"${item.name}",${item.weight || "N/A"},${new Date(
          result.timestamp
        ).toLocaleString()}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    downloadFile(blob, `wheelit-results-${Date.now()}.csv`);
  };

  const exportToText = () => {
    const content = formatResultText();
    const blob = new Blob([content], { type: "text/plain" });
    downloadFile(blob, `wheelit-results-${Date.now()}.txt`);
  };

  const generateImage = async () => {
    if (!result || !resultCardRef.current) return;

    setIsGeneratingImage(true);

    try {
      // Import html2canvas dynamically to avoid SSR issues
      const html2canvas = (await import("html2canvas")).default;

      const canvas = await html2canvas(resultCardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          downloadFile(blob, `wheelit-result-${Date.now()}.png`);
        }
      }, "image/png");
    } catch (error) {
      console.error("Failed to generate image:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">
            Share & Export Results
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("share")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "share"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Share2 className="h-4 w-4 inline mr-2" />
              Share
            </button>
            <button
              onClick={() => setActiveTab("export")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "export"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Download className="h-4 w-4 inline mr-2" />
              Export
            </button>
          </div>

          {/* Share Tab */}
          {activeTab === "share" && (
            <div className="space-y-6">
              {/* Result Preview */}
              {result && (
                <div
                  ref={resultCardRef}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-semibold">WheelIt Result</h3>
                    <Badge variant="secondary" className="text-xs">
                      {new Date(result.timestamp).toLocaleDateString()}
                    </Badge>
                  </div>

                  {result.type === "teams" && result.teams ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        {result.teams.map((team, index) => (
                          <div
                            key={`team-${index}-${team
                              .map((m) => m.id)
                              .join("-")}`}
                            className="flex items-center gap-2"
                          >
                            <Users className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">
                              Team {index + 1}:
                            </span>
                            <span>{team.map((m) => m.name).join(", ")}</span>
                          </div>
                        ))}
                      </div>

                      {/* Show constraints information */}
                      {config.teamConstraints &&
                        config.teamConstraints.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-2 mb-2">
                              <UserMinus className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Constraints Applied (
                                {config.teamConstraints.length})
                              </span>
                            </div>
                            <div className="space-y-1">
                              {config.teamConstraints.map((constraint) => {
                                const getItemName = (id: string) =>
                                  config.items.find((item) => item.id === id)
                                    ?.name || "Unknown";
                                return (
                                  <div
                                    key={constraint.id}
                                    className="text-xs text-gray-500 dark:text-gray-400"
                                  >
                                    • {getItemName(constraint.item1Id)} &{" "}
                                    {getItemName(constraint.item2Id)} kept
                                    separate
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {result.selectedItems?.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold">{item.name}</span>
                          {config.mode === "weighted" && item.weight && (
                            <Badge variant="outline" className="text-xs">
                              {item.weight}%
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Custom Message */}
              <div>
                <Label htmlFor="custom-message">
                  Custom Message (Optional)
                </Label>
                <Input
                  id="custom-message"
                  placeholder="Add your own message..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Share URL */}
              <div>
                <Label>Share Your Wheel Configuration</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={shareUrl} readOnly className="flex-1" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(shareUrl)}
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Social Media Sharing */}
              <div>
                <Label>Share on Social Media</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSocialShare("twitter")}
                    className="flex items-center gap-2"
                  >
                    <Twitter className="h-4 w-4 text-blue-400" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSocialShare("facebook")}
                    className="flex items-center gap-2"
                  >
                    <Facebook className="h-4 w-4 text-blue-600" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSocialShare("whatsapp")}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSocialShare("telegram")}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4 text-blue-500" />
                    Telegram
                  </Button>
                </div>
              </div>

              {/* Native Share & QR Code */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleNativeShare}
                  disabled={nativeSharing}
                  className="flex-1 flex items-center gap-2"
                >
                  <Smartphone className="h-4 w-4" />
                  {nativeSharing ? "Sharing..." : "Native Share"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowQR(!showQR)}
                  className="flex items-center gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  QR Code
                </Button>
              </div>

              {/* QR Code Display */}
              {showQR && qrCodeDataUrl && (
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Label className="text-sm font-medium mb-2 block">
                    Scan to open wheel configuration
                  </Label>
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code for wheel configuration"
                    className="mx-auto border rounded"
                    style={{ imageRendering: "pixelated" }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Scan with your phone camera to share this wheel
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Export Tab */}
          {activeTab === "export" && (
            <div className="space-y-6">
              {/* Export Formats */}
              <div>
                <Label>Export Formats</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Button
                    variant="outline"
                    onClick={exportToJSON}
                    className="flex items-center gap-2 p-4 h-auto flex-col"
                  >
                    <FileJson className="h-6 w-6 text-blue-500" />
                    <div className="text-center">
                      <div className="font-medium">JSON</div>
                      <div className="text-xs text-gray-500">Complete data</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={exportToCSV}
                    className="flex items-center gap-2 p-4 h-auto flex-col"
                  >
                    <FileSpreadsheet className="h-6 w-6 text-green-500" />
                    <div className="text-center">
                      <div className="font-medium">CSV</div>
                      <div className="text-xs text-gray-500">Spreadsheet</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={exportToText}
                    className="flex items-center gap-2 p-4 h-auto flex-col"
                  >
                    <FileText className="h-6 w-6 text-gray-500" />
                    <div className="text-center">
                      <div className="font-medium">TXT</div>
                      <div className="text-xs text-gray-500">Plain text</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={generateImage}
                    disabled={isGeneratingImage}
                    className="flex items-center gap-2 p-4 h-auto flex-col"
                  >
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <Image className="h-6 w-6 text-purple-500" />
                    <div className="text-center">
                      <div className="font-medium">
                        {isGeneratingImage ? "Generating..." : "PNG"}
                      </div>
                      <div className="text-xs text-gray-500">Image</div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Export Statistics */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium mb-2">Export Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>Date: {new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span>Time: {new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span>Results: {spinHistory.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span>Items: {config.items.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
