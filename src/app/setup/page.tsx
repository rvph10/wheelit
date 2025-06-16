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

export default function SetupPage() {
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
        weight: index === 0 ? equalPercentage + remainder : equalPercentage, // Give remainder to first item
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

  const canProceed = () => {
    if (config.items.length < 2) return false;
    if (
      config.mode === "teams" &&
      config.items.length < (config.teamCount || 2)
    )
      return false;

    // For weighted mode, check if percentages add up to approximately 100%
    if (config.mode === "weighted") {
      const totalPercentage = config.items.reduce(
        (sum, item) => sum + (item.weight || 0),
        0
      );
      // Allow some tolerance (95% to 105%)
      return totalPercentage >= 95 && totalPercentage <= 105;
    }

    return true;
  };

  const proceedToSpin = () => {
    if (!canProceed()) return;
    router.push("/spin");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addItem();
    }
  };

  // Calculate total percentage for weighted mode validation
  const getTotalPercentage = () => {
    if (config.mode !== "weighted") return 0;
    return config.items.reduce((sum, item) => sum + (item.weight || 0), 0);
  };

  const totalPercentage = getTotalPercentage();
  const isPercentageValid = totalPercentage >= 95 && totalPercentage <= 105;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div ref={containerRef} className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-gray-800 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Back to Home</span>
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Setup Your Wheel
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Choose your mode and add items to get started
            </p>
          </div>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>

        {/* Mode Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            1. Choose Your Mode
          </h2>
          <div
            ref={modeCardsRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = config.mode === mode.id;

              return (
                <Card
                  key={mode.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isSelected
                      ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "hover:shadow-md"
                  }`}
                  onClick={() =>
                    setConfig((prev) => ({ ...prev, mode: mode.id }))
                  }
                >
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-12 h-12 ${mode.color} rounded-full flex items-center justify-center mx-auto mb-3`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                      {mode.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {mode.description}
                    </p>
                    {isSelected && (
                      <Badge className="mt-3 bg-blue-500">Selected</Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Mode-specific configuration */}
        {config.mode === "simple" && (
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <input
                id="removeAfterSpin"
                type="checkbox"
                checked={config.removeAfterSpin || false}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    removeAfterSpin: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="removeAfterSpin" className="text-sm font-medium">
                Remove items after selection (eliminates repeats)
              </Label>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              When enabled, selected items are removed from the wheel to prevent
              them from being picked again
            </p>
          </div>
        )}

        {config.mode === "teams" && (
          <div className="mb-6">
            <Label htmlFor="teamCount" className="text-sm font-medium">
              Number of teams
            </Label>
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
              className="w-32 mt-1"
            />
          </div>
        )}

        {config.mode === "multiple" && (
          <div className="mb-6">
            <Label htmlFor="selectCount" className="text-sm font-medium">
              Number of items to select
            </Label>
            <Input
              id="selectCount"
              type="number"
              min="1"
              max={config.items.length || 1}
              value={config.selectCount || 1}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  selectCount: parseInt(e.target.value) || 1,
                }))
              }
              className="w-32 mt-1"
            />
          </div>
        )}

        {config.mode === "weighted" && config.items.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Percentage Distribution
              </h3>
              <Badge
                variant={isPercentageValid ? "default" : "destructive"}
                className="text-xs"
              >
                Total: {totalPercentage.toFixed(1)}%
              </Badge>
            </div>

            {/* Visual percentage bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
              {config.items.map((item, index) => {
                const percentage = item.weight || 0;
                const colors = [
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
                ];

                return percentage > 0 ? (
                  <div
                    key={item.id}
                    className="h-full float-left"
                    style={{
                      width: `${Math.max(percentage, 0)}%`,
                      backgroundColor: colors[index % colors.length],
                    }}
                    title={`${item.name}: ${percentage}%`}
                  />
                ) : null;
              })}
            </div>

            {!isPercentageValid && (
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                ⚠️ Percentages should add up to approximately 100% (currently{" "}
                {totalPercentage.toFixed(1)}%)
              </p>
            )}

            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Each item's percentage represents its chance of being selected
            </p>

            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={distributePercentagesEqually}
                className="text-xs"
              >
                Distribute Equally
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setConfig((prev) => ({
                    ...prev,
                    items: prev.items.map((item) => ({ ...item, weight: 0 })),
                  }));
                }}
                className="text-xs"
              >
                Reset All
              </Button>
            </div>
          </div>
        )}

        {/* Items Configuration */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            2. Add Your Items
          </h2>

          {/* Add item input */}
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter item name..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={addItem} disabled={!newItemName.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Items list */}
          <div ref={itemsRef} className="space-y-3">
            {config.items.map((item, index) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      value={item.name}
                      onChange={(e) => updateItemName(item.id, e.target.value)}
                      className="font-medium"
                    />
                  </div>

                  {config.mode === "weighted" && (
                    <div className="flex items-center gap-2">
                      <Label className="text-sm whitespace-nowrap">
                        Percentage:
                      </Label>
                      <div className="flex items-center gap-1">
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
                          className="w-20 text-center"
                        />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          %
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {config.items.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Add at least 2 items to get started</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {config.items.length} item{config.items.length !== 1 ? "s" : ""}{" "}
            added
            {config.mode === "teams" && config.teamCount && (
              <span> • {config.teamCount} teams</span>
            )}
            {config.mode === "multiple" && config.selectCount && (
              <span> • Select {config.selectCount}</span>
            )}
            {config.mode === "weighted" && (
              <span
                className={
                  !isPercentageValid ? "text-amber-600 dark:text-amber-400" : ""
                }
              >
                • Total: {totalPercentage.toFixed(1)}%
              </span>
            )}
          </div>

          <Button
            size="lg"
            onClick={proceedToSpin}
            disabled={!canProceed()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Create Wheel
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
