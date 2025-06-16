"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import {
  WheelCanvas,
  ResultPopup,
  SpinControls,
  type WheelConfig,
  type WheelItem,
  type SpinResult,
} from "@/components/wheel";
import type { WheelCanvasRef } from "@/components/wheel/WheelCanvas";

/**
 * SpinPage Component - Main page for wheel spinning functionality
 * Features:
 * - Loads configuration from localStorage
 * - Manages wheel state and results
 * - Handles different wheel modes
 * - Provides export and share functionality
 */
export default function SpinPage() {
  const [config, setConfig] = useState<WheelConfig>({
    mode: "simple",
    items: [],
    teamCount: 2,
    selectCount: 1,
  });
  const [results, setResults] = useState<SpinResult[]>([]);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [currentResult, setCurrentResult] = useState<SpinResult | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState(1);
  const wheelCanvasRef = useRef<WheelCanvasRef>(null);

  // Load configuration and results from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem("wheelit-config");
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error("Failed to load saved config:", error);
      }
    }

    const savedResults = localStorage.getItem("wheelit-results");
    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch (error) {
        console.error("Failed to load saved results:", error);
      }
    }

    const savedPosition = localStorage.getItem("wheelit-selection-position");
    if (savedPosition) {
      setSelectionPosition(parseInt(savedPosition, 10));
    }
  }, []);

  // Save results to localStorage
  useEffect(() => {
    if (results.length > 0) {
      localStorage.setItem("wheelit-results", JSON.stringify(results));
    }
  }, [results]);

  // Reset items to original configuration
  const resetItems = () => {
    const savedConfig = localStorage.getItem("wheelit-config");
    if (savedConfig) {
      try {
        const originalConfig = JSON.parse(savedConfig);
        setConfig(originalConfig);
        setSelectionPosition(1);
        localStorage.removeItem("wheelit-selection-position");
      } catch (error) {
        console.error("Failed to reset to original config:", error);
      }
    }
  };

  // Close result popup
  const closeResultPopup = () => {
    setShowResultPopup(false);
    setCurrentResult(null);
  };

  // Create teams from items
  const createTeams = (
    items: WheelItem[],
    teamCount: number
  ): WheelItem[][] => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const teams: WheelItem[][] = Array(teamCount)
      .fill(null)
      .map(() => []);

    shuffled.forEach((item, index) => {
      teams[index % teamCount].push(item);
    });

    return teams;
  };

  // Handle wheel result
  const handleWheelResult = (spinResult: SpinResult) => {
    let finalResult = spinResult;

    // Handle different modes
    if (config.mode === "teams" && config.teamCount) {
      const teams = createTeams(config.items, config.teamCount);
      finalResult = {
        type: "teams",
        teams,
        timestamp: Date.now(),
      };
    } else if (config.mode === "multiple" && config.selectCount) {
      // For multiple mode, select multiple items
      const shuffled = [...config.items].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, config.selectCount);
      finalResult = {
        type: "multiple",
        selectedItems: selected,
        timestamp: Date.now(),
      };
    } else {
      // Handle remove after spin
      if (config.removeAfterSpin && spinResult.selectedItems?.[0]) {
        finalResult.position = selectionPosition;

        // Remove the selected item from config
        setConfig((prev: WheelConfig) => ({
          ...prev,
          items: prev.items.filter(
            (item: WheelItem) => item.id !== spinResult.selectedItems![0].id
          ),
        }));

        // Update position for next selection
        const newPosition = selectionPosition + 1;
        setSelectionPosition(newPosition);
        localStorage.setItem(
          "wheelit-selection-position",
          newPosition.toString()
        );
      }
    }

    // Add to results history
    setResults((prev) => [finalResult, ...prev]);
    setCurrentResult(finalResult);
    setShowResultPopup(true);
  };

  // Perform spin
  const handleSpin = () => {
    if (config.items.length < 2 || isSpinning) return;

    setIsSpinning(true);

    // Trigger wheel canvas spin
    if (wheelCanvasRef.current?.spin) {
      wheelCanvasRef.current.spin();
    }

    // Reset spinning state after animation
    setTimeout(() => {
      setIsSpinning(false);
    }, 3000);
  };

  // Export results
  const exportResults = () => {
    const data = {
      config,
      results,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wheelit-results-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Share results
  const shareResults = async () => {
    if (results.length === 0) return;

    const latestResult = results[0];
    let shareText = "🎰 WheelIt Results!\n\n";

    if (latestResult.type === "teams" && latestResult.teams) {
      shareText += "Teams created:\n";
      latestResult.teams.forEach((team: WheelItem[], teamIndex: number) => {
        shareText += `Team ${teamIndex + 1}: ${team
          .map((item: WheelItem) => item.name)
          .join(", ")}\n`;
      });
    } else if (latestResult.selectedItems) {
      shareText += `Winner: ${latestResult.selectedItems[0].name}\n`;
    }

    shareText += "\nCreate your own wheel at wheelit.app!";

    if (navigator.share) {
      try {
        await navigator.share({
          title: "WheelIt Results",
          text: shareText,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert("Results copied to clipboard!");
    }
  };

  const canSpin = config.items.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Wheel Area */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold">
                  {config.mode === "simple" && "Simple Wheel"}
                  {config.mode === "teams" &&
                    `Team Generator (${config.teamCount} teams)`}
                  {config.mode === "weighted" && "Weighted Wheel"}
                  {config.mode === "multiple" &&
                    `Multiple Selection (${config.selectCount} items)`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <WheelCanvas
                  ref={wheelCanvasRef}
                  items={config.items}
                  mode={config.mode}
                  onResult={handleWheelResult}
                />

                <SpinControls
                  onSpin={handleSpin}
                  onReset={resetItems}
                  onExport={exportResults}
                  onShare={shareResults}
                  isSpinning={isSpinning}
                  canSpin={canSpin}
                  itemCount={config.items.length}
                />
              </CardContent>
            </Card>
          </div>

          {/* Results Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Results History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No results yet. Spin the wheel to get started!
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {results.slice(0, 10).map((result) => (
                      <div
                        key={result.timestamp}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {result.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        {result.type === "teams" && result.teams ? (
                          <div className="space-y-1">
                            {result.teams.map(
                              (team: WheelItem[], teamIndex: number) => (
                                <div key={teamIndex} className="text-sm">
                                  <span className="font-medium">
                                    Team {teamIndex + 1}:
                                  </span>{" "}
                                  {team
                                    .map((item: WheelItem) => item.name)
                                    .join(", ")}
                                </div>
                              )
                            )}
                          </div>
                        ) : result.selectedItems ? (
                          <div>
                            {result.position && (
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                #{result.position}{" "}
                              </span>
                            )}
                            <span className="font-medium">
                              {result.selectedItems
                                .map((item: WheelItem) => item.name)
                                .join(", ")}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Result Popup */}
      <ResultPopup
        isOpen={showResultPopup}
        result={currentResult}
        onClose={closeResultPopup}
        isRemoveMode={!!config.removeAfterSpin}
      />
    </div>
  );
}
