"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Users,
  Target,
  Scale,
  Grid3X3,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

type WheelMode = "simple" | "teams" | "weighted" | "multiple";

interface WheelItem {
  id: string;
  name: string;
  weight?: number;
}

interface WheelConfig {
  mode: WheelMode;
  items: WheelItem[];
  teamCount?: number;
  selectCount?: number;
  removeAfterSpin?: boolean;
}

/**
 * Client-side setup component for configuring wheel options
 * Handles all wheel configuration logic and state management
 */
export default function SetupClient() {
  const router = useRouter();
  const [config, setConfig] = useState<WheelConfig>({
    mode: "simple",
    items: [],
    teamCount: 2,
    selectCount: 1,
  });
  const [newItemName, setNewItemName] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const modeCardsRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load saved config from localStorage
    const savedConfig = localStorage.getItem("wheelit-config");
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error("Failed to load saved config:", error);
      }
    }
    setIsLoaded(true);

    // Animation setup
    const ctx = gsap.context(() => {
      // Set initial state - everything hidden
      gsap.set(containerRef.current, {
        opacity: 0,
        y: 30,
      });

      gsap.set(modeCardsRef.current?.children || [], {
        opacity: 0,
        y: 20,
      });

      // Animation timeline
      const tl = gsap.timeline({ delay: 0.1 });

      // Container animation
      tl.to(containerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      // Mode cards stagger animation
      tl.to(
        modeCardsRef.current?.children || [],
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.7)",
        },
        "-=0.6"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    // Save config to localStorage whenever it changes, but only after initial load
    if (isLoaded) {
      localStorage.setItem("wheelit-config", JSON.stringify(config));
      // Clear selection position whenever config changes - user is setting up fresh
      localStorage.removeItem("wheelit-selection-position");
    }
  }, [config, isLoaded]);

  const modes = [
    {
      id: "simple" as WheelMode,
      title: "Simple Mode",
      description: "Pick one random item from your list",
      icon: Target,
      color: "bg-blue-500",
    },
    {
      id: "teams" as WheelMode,
      title: "Teams Mode",
      description: "Create balanced teams automatically",
      icon: Users,
      color: "bg-green-500",
    },
    {
      id: "weighted" as WheelMode,
      title: "Weighted Mode",
      description: "Set custom percentages for each item (e.g., A=40%, B=30%)",
      icon: Scale,
      color: "bg-purple-500",
    },
    {
      id: "multiple" as WheelMode,
      title: "Multiple Mode",
      description: "Select several items at once",
      icon: Grid3X3,
      color: "bg-orange-500",
    },
  ];

  const addItem = () => {
    if (!newItemName.trim()) return;

    const newItem: WheelItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      weight: config.mode === "weighted" ? 10 : undefined, // Default to 10% for new items
    };

    setConfig((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    setNewItemName("");

    // Animate new item
    gsap.from(itemsRef.current?.lastElementChild || null, {
      opacity: 0,
      x: -20,
      duration: 0.3,
      ease: "back.out(1.7)",
    });
  };

  const removeItem = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const updateItemWeight = (id: string, weight: number) => {
    // Ensure percentage is between 0 and 100
    const clampedWeight = Math.max(0, Math.min(100, weight));

    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, weight: clampedWeight } : item
      ),
    }));
  };

  // Auto-distribute percentages equally among all items
  const distributePercentagesEqually = () => {
    if (config.items.length === 0) return;

    const equalPercentage = Math.round((100 / config.items.length) * 10) / 10; // Round to 1 decimal
    const remainder = 100 - equalPercentage * config.items.length;

    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((item, index) => ({
        ...item,
        weight: index === 0 ? equalPercentage + remainder : equalPercentage, // Add remainder to first item
      })),
    }));
  };

  const updateItemName = (id: string, name: string) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, name } : item
      ),
    }));
  };

  const getValidationStatus = () => {
    if (config.items.length === 0) {
      return {
        isValid: false,
        message: "Add at least one item to continue",
        type: "warning" as const,
      };
    }

    if (config.mode === "teams" && config.items.length < 2) {
      return {
        isValid: false,
        message: "Teams mode requires at least 2 items",
        type: "error" as const,
      };
    }

    if (
      config.mode === "teams" &&
      (config.teamCount || 2) > config.items.length
    ) {
      return {
        isValid: false,
        message: "Cannot create more teams than items",
        type: "error" as const,
      };
    }

    if (
      config.mode === "multiple" &&
      (config.selectCount || 1) > config.items.length
    ) {
      return {
        isValid: false,
        message: "Cannot select more items than available",
        type: "error" as const,
      };
    }

    if (config.mode === "weighted") {
      const totalPercentage = getTotalPercentage();

      if (Math.abs(totalPercentage - 100) > 0.1) {
        return {
          isValid: false,
          message: `Percentages must total 100% (currently ${totalPercentage.toFixed(
            1
          )}%)`,
          type: "error" as const,
        };
      }

      // Check for any items with 0% weight
      const hasZeroWeight = config.items.some(
        (item) => (item.weight || 0) === 0
      );
      if (hasZeroWeight) {
        return {
          isValid: true,
          message: "Some items have 0% chance - they won't be selected",
          type: "warning" as const,
        };
      }
    }

    return {
      isValid: true,
      message: "Ready to spin!",
      type: "success" as const,
    };
  };

  const canProceed = () => {
    return getValidationStatus().isValid;
  };

  const proceedToSpin = () => {
    if (!canProceed()) return;

    const targetPath = config.mode === "teams" ? "/teams" : "/spin";
    router.push(targetPath);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addItem();
    }
  };

  const getTotalPercentage = () => {
    return config.items.reduce((sum, item) => sum + (item.weight || 0), 0);
  };

  const validation = getValidationStatus();

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Back button - Enhanced design */}
          <div className="mb-4 sm:mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-gray-800 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Back to Home</span>
            </Button>
          </div>

          {/* Title and icon - Centered */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
              Setup Your Wheel
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Configure your spinning wheel exactly how you want it
            </p>
          </div>
        </div>

        {/* Mode Selection */}
        <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Choose Mode
            </h2>
            <div
              ref={modeCardsRef}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
              {modes.map((mode) => {
                const Icon = mode.icon;
                const isSelected = config.mode === mode.id;

                return (
                  <Card
                    key={mode.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                      isSelected
                        ? "border-blue-500 shadow-lg"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                    onClick={() =>
                      setConfig((prev) => ({ ...prev, mode: mode.id }))
                    }
                  >
                    <CardContent className="p-4 text-center">
                      <div
                        className={`w-12 h-12 ${mode.color} rounded-full flex items-center justify-center mx-auto mb-3`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        {mode.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {mode.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Options */}
        {(config.mode === "teams" ||
          config.mode === "multiple" ||
          config.mode === "simple") && (
          <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Configuration
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {config.mode === "teams" && (
                  <div>
                    <Label htmlFor="teamCount">Number of Teams</Label>
                    <Input
                      id="teamCount"
                      type="number"
                      min="2"
                      max="10"
                      value={config.teamCount || 2}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          teamCount: parseInt(e.target.value) || 2,
                        }))
                      }
                    />
                  </div>
                )}
                {config.mode === "multiple" && (
                  <div>
                    <Label htmlFor="selectCount">Items to Select</Label>
                    <Input
                      id="selectCount"
                      type="number"
                      min="1"
                      max="20"
                      value={config.selectCount || 1}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          selectCount: parseInt(e.target.value) || 1,
                        }))
                      }
                    />
                  </div>
                )}
                {config.mode === "simple" && (
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="removeAfterSpin"
                        checked={config.removeAfterSpin || false}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            removeAfterSpin: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <Label
                        htmlFor="removeAfterSpin"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Remove items after selection
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                      Items will be removed from the wheel after being selected,
                      allowing you to pick multiple items in order.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Items Management */}
        <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Items ({config.items.length})
              </h3>
              {config.mode === "weighted" && config.items.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Total: {getTotalPercentage().toFixed(1)}%
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={distributePercentagesEqually}
                  >
                    Auto-distribute
                  </Button>
                </div>
              )}
            </div>

            {/* Add Item */}
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="Add new item..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={addItem} disabled={!newItemName.trim()}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            {/* Items List */}
            <div ref={itemsRef} className="space-y-3">
              {config.items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-8">
                    {index + 1}
                  </span>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItemName(item.id, e.target.value)}
                    className="flex-1"
                  />
                  {config.mode === "weighted" && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={item.weight || 0}
                        onChange={(e) =>
                          updateItemWeight(
                            item.id,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-20"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {config.items.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Add items to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Validation Status */}
        {config.items.length > 0 && (
          <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {validation.type === "success" && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {validation.type === "warning" && (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
                {validation.type === "error" && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span
                  className={`text-sm ${
                    validation.type === "success"
                      ? "text-green-700 dark:text-green-300"
                      : validation.type === "warning"
                      ? "text-yellow-700 dark:text-yellow-300"
                      : "text-red-700 dark:text-red-300"
                  }`}
                >
                  {validation.message}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Continue Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={proceedToSpin}
            disabled={!canProceed()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          >
            Start Spinning
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
