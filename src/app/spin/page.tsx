"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import Confetti from "react-confetti";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  RotateCcw,
  Download,
  Share,
  Trophy,
  Users,
  Sparkles,
  X,
  Medal,
} from "lucide-react";

type WheelMode = "simple" | "teams" | "weighted" | "multiple";

interface WheelItem {
  id: string;
  name: string;
  weight?: number;
  color?: string;
}

interface WheelConfig {
  mode: WheelMode;
  items: WheelItem[];
  teamCount?: number;
  selectCount?: number;
  removeAfterSpin?: boolean;
}

interface SpinResult {
  type: "simple" | "teams" | "weighted" | "multiple";
  selectedItems?: WheelItem[];
  teams?: WheelItem[][];
  timestamp: number;
  position?: number; // Position when removeAfterSpin is enabled
}

/**
 * ResultPopup Component - Shows the selected item with confetti effect
 * Features:
 * - Confetti animation when item is selected
 * - Displays position number if removeAfterSpin is enabled
 * - Closable by clicking or pressing Escape
 * - Responsive design with animations
 */
interface ResultPopupProps {
  isOpen: boolean;
  result: SpinResult | null;
  onClose: () => void;
  isRemoveMode: boolean;
}

const ResultPopup = ({
  isOpen,
  result,
  onClose,
  isRemoveMode,
}: ResultPopupProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  // Handle window resize for confetti
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Show confetti when popup opens
  useEffect(() => {
    if (isOpen && result?.type === "simple") {
      setShowConfetti(true);
      // Stop confetti after 3 seconds
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, result]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Animate popup entrance
  useEffect(() => {
    if (isOpen && popupRef.current) {
      gsap.fromTo(
        popupRef.current,
        {
          scale: 0.8,
          opacity: 0,
          y: 50,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "back.out(1.7)",
        }
      );
    }
  }, [isOpen]);

  if (
    !isOpen ||
    !result ||
    result.type !== "simple" ||
    !result.selectedItems?.[0]
  ) {
    return null;
  }

  const selectedItem = result.selectedItems[0];
  const getOrdinalSuffix = (num: number) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Confetti Effect - positioned above backdrop */}
        {showConfetti && (
          <Confetti
            width={dimensions.width}
            height={dimensions.height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.3}
            colors={[
              "#FF6B6B",
              "#4ECDC4",
              "#45B7D1",
              "#96CEB4",
              "#FFEAA7",
              "#DDA0DD",
            ]}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 60,
              pointerEvents: "none",
            }}
          />
        )}
        {/* Popup Content */}
        <div
          ref={popupRef}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative z-70"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
            aria-label="Close popup"
          >
            <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Content */}
          <div className="p-8 text-center">
            {/* Trophy Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                {isRemoveMode && result.position ? (
                  <Medal className="h-10 w-10 text-white" />
                ) : (
                  <Trophy className="h-10 w-10 text-white" />
                )}
              </div>
            </div>

            {/* Position Badge (if remove mode is enabled) */}
            {isRemoveMode && result.position && (
              <div className="mb-4">
                <Badge
                  variant="secondary"
                  className="text-lg px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-800 dark:text-blue-200 border-0"
                >
                  {result.position}
                  {getOrdinalSuffix(result.position)} Place
                </Badge>
              </div>
            )}

            {/* Selected Item */}
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {selectedItem.name}
            </h2>

            {/* Weight indicator for weighted mode */}
            {selectedItem.weight && (
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Weight: {selectedItem.weight}
              </p>
            )}

            {/* Congratulations message */}
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              {isRemoveMode && result.position
                ? `Selected in ${result.position}${getOrdinalSuffix(
                    result.position
                  )} place!`
                : "🎉 Congratulations! 🎉"}
            </p>

            {/* Close Button */}
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-lg"
            >
              Continue
            </Button>

            {/* Hint text */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Press Escape or click outside to close
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

// Working Wheel Component with accurate pointer detection
const WorkingWheel = ({
  items,
  mode,
  onResult,
}: {
  items: WheelItem[];
  mode: WheelMode;
  onResult: (result: SpinResult) => void;
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);

  const wheelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate colors for each segment
  const colors = useMemo(
    () => [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E9",
      "#F8C471",
      "#82E0AA",
      "#F1948A",
      "#85929E",
      "#D2B4DE",
    ],
    []
  );

  // Calculate segment angle
  const segmentAngle = 360 / items.length;

  // Enhanced wheel drawing function using Canvas for precise control
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw segments
    items.forEach((item, index) => {
      const startAngle = (index * segmentAngle - 90) * (Math.PI / 180); // -90 to start from top
      const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      // Fill with color
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();

      // Draw border
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      const textAngle = startAngle + (endAngle - startAngle) / 2;
      const textX = centerX + Math.cos(textAngle) * (radius * 0.7);
      const textY = centerY + Math.sin(textAngle) * (radius * 0.7);

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Truncate long text
      const displayText =
        item.name.length > 12 ? item.name.substring(0, 12) + "..." : item.name;
      ctx.fillText(displayText, 0, 0);
      ctx.restore();

      // Draw weight indicator for weighted mode
      if (mode === "weighted" && item.weight) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.font = "bold 10px Arial";
        ctx.fillText(`×${item.weight}`, textX, textY + 20);
      }
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = "#2C3E50";
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw center icon
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎯", centerX, centerY);
  }, [items, mode, segmentAngle, colors]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  // FIXED: Accurate algorithm to determine winning segment
  const determineWinningSegment = (finalRotation: number): WheelItem => {
    // Normalize rotation to 0-360 degrees
    const normalizedRotation = ((finalRotation % 360) + 360) % 360;

    // The pointer is at the top (0 degrees), calculate which segment it points to
    // We need to account for the wheel rotating clockwise
    const pointerAngle = (360 - normalizedRotation) % 360;

    // Determine which segment the pointer is in
    const segmentIndex = Math.floor(pointerAngle / segmentAngle) % items.length;

    return items[segmentIndex];
  };

  // Enhanced weighted selection for weighted mode
  const getWeightedWinner = (): WheelItem => {
    const totalWeight = items.reduce(
      (sum, item) => sum + (item.weight || 1),
      0
    );
    let random = Math.random() * totalWeight;

    for (const item of items) {
      random -= item.weight || 1;
      if (random <= 0) {
        return item;
      }
    }

    return items[items.length - 1];
  };

  // Calculate the rotation needed to land on a specific segment
  const getRotationForSegment = (targetSegment: WheelItem): number => {
    const segmentIndex = items.findIndex(
      (item) => item.id === targetSegment.id
    );
    const targetAngle = segmentIndex * segmentAngle + segmentAngle / 2;

    // Calculate rotation to make the pointer land on this segment
    const currentRotation = wheelRotation % 360;
    const rotationNeeded = (360 - targetAngle + currentRotation) % 360;

    // Add multiple full rotations for spinning effect
    const baseRotations = 5 + Math.random() * 5; // 5-10 full rotations
    return wheelRotation + baseRotations * 360 + rotationNeeded;
  };

  // Main spin function
  const performSpin = () => {
    if (isSpinning || items.length === 0) return;

    setIsSpinning(true);

    let winner: WheelItem;
    let finalRotation: number;

    if (mode === "weighted") {
      // For weighted mode, determine winner first, then calculate rotation to land on it
      winner = getWeightedWinner();
      finalRotation = getRotationForSegment(winner);
    } else {
      // For simple mode, random rotation and then determine winner
      const baseRotations = 5 + Math.random() * 5; // 5-10 full rotations
      const randomAngle = Math.random() * 360;
      finalRotation = wheelRotation + baseRotations * 360 + randomAngle;
      winner = determineWinningSegment(finalRotation);
    }

    // Animate the wheel spin
    gsap.to(wheelRef.current, {
      rotation: finalRotation,
      duration: 3 + Math.random() * 2, // 3-5 seconds
      ease: "power3.out",
      onUpdate: () => {
        setWheelRotation(
          gsap.getProperty(wheelRef.current, "rotation") as number
        );
      },
      onComplete: () => {
        setWheelRotation(finalRotation);
        setIsSpinning(false);
        onResult({
          type: mode as "simple" | "teams" | "weighted" | "multiple",
          selectedItems: [winner],
          timestamp: Date.now(),
        });
      },
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="relative">
          {/* Wheel Container */}
          <div className="relative flex items-center justify-center">
            <div
              ref={wheelRef}
              className="relative"
              style={{ transformOrigin: "50% 50%" }}
            >
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="max-w-full h-auto"
              />
            </div>

            {/* Pointer - positioned at top */}
            <div className="absolute -rotate-180 top-0 left-1/2 transform -translate-x-1/2  z-10">
              <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-b-[25px] border-l-transparent border-r-transparent border-b-red-600 drop-shadow-lg"></div>
            </div>
          </div>

          {/* Spin Button */}
          <div className="text-center mt-6">
            <Button
              size="lg"
              onClick={performSpin}
              disabled={isSpinning || items.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
            >
              {isSpinning ? (
                <>
                  <RotateCcw className="mr-2 h-5 w-5 animate-spin" />
                  Spinning...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Spin the Wheel
                </>
              )}
            </Button>
          </div>

          {/* Items List */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">
              Items ({items.length})
            </h3>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {items.map((item, index) => (
                <Badge
                  key={item.id}
                  variant="outline"
                  className="text-sm"
                  style={{
                    borderColor: colors[index % colors.length],
                    color: colors[index % colors.length],
                  }}
                >
                  {item.name}
                  {mode === "weighted" && item.weight && (
                    <span className="ml-1 opacity-70">({item.weight})</span>
                  )}
                </Badge>
              ))}
            </div>
            {items.length === 0 && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No items remaining!</p>
                <p className="text-xs mt-1">
                  Use the reset button to restore all items.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function SpinPage() {
  const router = useRouter();
  const [config, setConfig] = useState<WheelConfig>({
    mode: "simple",
    items: [],
    teamCount: 2,
    selectCount: 1,
  });
  const [originalItems, setOriginalItems] = useState<WheelItem[]>([]); // Store original items for reset
  const [currentItems, setCurrentItems] = useState<WheelItem[]>([]); // Current available items
  const [result, setResult] = useState<SpinResult | null>(null);
  const [spinHistory, setSpinHistory] = useState<SpinResult[]>([]);

  // New state for popup management
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [popupResult, setPopupResult] = useState<SpinResult | null>(null);
  const [selectionPosition, setSelectionPosition] = useState(0); // Track position for removeAfterSpin mode

  const containerRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load config from localStorage
    const savedConfig = localStorage.getItem("wheelit-config");
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        setOriginalItems(parsedConfig.items);
        setCurrentItems(parsedConfig.items);

        // Initialize selection position counter
        if (parsedConfig.removeAfterSpin) {
          const savedPosition = localStorage.getItem(
            "wheelit-selection-position"
          );
          setSelectionPosition(savedPosition ? parseInt(savedPosition) : 0);
        }
      } catch (error) {
        console.error("Failed to load config:", error);
        router.push("/setup");
      }
    } else {
      router.push("/setup");
    }

    // Load spin history
    const savedHistory = localStorage.getItem("wheelit-history");
    if (savedHistory) {
      try {
        setSpinHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Failed to load history:", error);
      }
    }

    // Animation setup
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, [router]);

  // Reset items to original list
  const resetItems = () => {
    setCurrentItems(originalItems);
    setResult(null);
    setSelectionPosition(0);
    localStorage.removeItem("wheelit-selection-position");
  };

  // Close popup and show regular result
  const closeResultPopup = () => {
    setShowResultPopup(false);

    // After popup closes, show the regular result in the sidebar
    if (popupResult) {
      setResult(popupResult);

      // Animate result appearance in sidebar
      setTimeout(() => {
        gsap.from(resultRef.current, {
          opacity: 0,
          scale: 0.8,
          y: 20,
          duration: 0.6,
          ease: "back.out(1.7)",
        });
      }, 100);
    }
  };

  // Create teams from items
  const createTeams = (
    items: WheelItem[],
    teamCount: number
  ): WheelItem[][] => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const teams: WheelItem[][] = Array.from({ length: teamCount }, () => []);

    shuffled.forEach((item, index) => {
      teams[index % teamCount].push(item);
    });

    return teams;
  };

  // Handle result from wheel
  const handleWheelResult = (spinResult: SpinResult) => {
    let result: SpinResult;

    switch (config.mode) {
      case "teams":
        const teams = createTeams(currentItems, config.teamCount || 2);
        result = {
          type: "teams",
          teams,
          timestamp: Date.now(),
        };
        break;

      case "multiple":
        const shuffled = [...currentItems].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, config.selectCount || 1);
        result = {
          type: "multiple",
          selectedItems: selected,
          timestamp: Date.now(),
        };
        break;

      default:
        // For simple and weighted modes, use the result from the wheel
        result = spinResult;

        // Handle position tracking and item removal for simple mode
        if (
          config.mode === "simple" &&
          config.removeAfterSpin &&
          result.selectedItems?.[0]
        ) {
          const selectedItem = result.selectedItems[0];
          const newPosition = selectionPosition + 1;

          // Add position to result
          result.position = newPosition;

          // Update position counter
          setSelectionPosition(newPosition);
          localStorage.setItem(
            "wheelit-selection-position",
            newPosition.toString()
          );

          // Remove item from current items
          setCurrentItems((prev) =>
            prev.filter((item) => item.id !== selectedItem.id)
          );
        }
    }

    // For simple mode, show popup first
    if (config.mode === "simple") {
      setPopupResult(result);
      setShowResultPopup(true);
    } else {
      // For other modes, show result directly
      setResult(result);

      // Animate result appearance
      gsap.from(resultRef.current, {
        opacity: 0,
        scale: 0.8,
        y: 20,
        duration: 0.6,
        ease: "back.out(1.7)",
        delay: 0.3,
      });
    }

    // Save to history
    const newHistory = [result, ...spinHistory].slice(0, 10);
    setSpinHistory(newHistory);
    localStorage.setItem("wheelit-history", JSON.stringify(newHistory));
  };

  // Export and share functions (same as original)
  const exportResults = () => {
    const data = {
      config,
      result,
      history: spinHistory,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wheelit-results-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareResults = async () => {
    if (!result) return;

    const text =
      config.mode === "teams"
        ? `WheelIt Teams Result:\n${result.teams
            ?.map(
              (team, i) =>
                `Team ${i + 1}: ${team.map((item) => item.name).join(", ")}`
            )
            .join("\n")}`
        : `WheelIt Result: ${result.selectedItems
            ?.map((item) => item.name)
            .join(", ")}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "WheelIt Results",
          text,
          url: window.location.origin,
        });
      } catch (error) {
        console.log("Sharing failed:", error);
      }
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div ref={containerRef} className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/setup")}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-gray-800 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Back to Setup</span>
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Spin the Wheel
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {config.mode === "simple" &&
                (config.removeAfterSpin
                  ? "Pick one random item (removes after selection)"
                  : "Pick one random item")}
              {config.mode === "teams" && `Create ${config.teamCount} teams`}
              {config.mode === "weighted" && "Weighted random selection"}
              {config.mode === "multiple" &&
                `Select ${config.selectCount} items`}
            </p>
          </div>

          <div className="flex gap-2">
            <Badge variant="secondary" className="text-sm">
              {config.mode} mode
            </Badge>
            {config.mode === "simple" && config.removeAfterSpin && (
              <Badge variant="outline" className="text-sm">
                {currentItems.length} remaining
              </Badge>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Working Wheel Section */}
          <div className="space-y-4">
            <WorkingWheel
              items={currentItems}
              mode={config.mode}
              onResult={handleWheelResult}
            />

            {/* Reset button for simple mode with removeAfterSpin enabled */}
            {config.mode === "simple" &&
              config.removeAfterSpin &&
              currentItems.length !== originalItems.length && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={resetItems}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset All Items (
                    {originalItems.length - currentItems.length} removed)
                  </Button>
                </div>
              )}
          </div>

          {/* Results Section (same as original) */}
          <div className="space-y-6">
            {result && (
              <Card ref={resultRef}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Result
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.type === "teams" && result.teams ? (
                    <div className="space-y-4">
                      {result.teams.map((team, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Team {index + 1}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {team.map((member) => (
                              <Badge key={member.id} variant="secondary">
                                {member.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {result.selectedItems?.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg"
                        >
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {item.name}
                          </h4>
                          {config.mode === "weighted" && item.weight && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Weight: {item.weight}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={shareResults}>
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportResults}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* History (same as original) */}
            {spinHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {spinHistory.map((historyResult) => (
                      <div
                        key={historyResult.timestamp}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                      >
                        <div className="font-medium">
                          {historyResult.type === "teams" && historyResult.teams
                            ? `Teams: ${historyResult.teams.length} groups`
                            : historyResult.selectedItems
                                ?.map((item) => item.name)
                                .join(", ")}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          {new Date(
                            historyResult.timestamp
                          ).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Result Popup for Simple Mode */}
      <ResultPopup
        isOpen={showResultPopup}
        result={popupResult}
        onClose={closeResultPopup}
        isRemoveMode={config.removeAfterSpin || false}
      />
    </div>
  );
}
