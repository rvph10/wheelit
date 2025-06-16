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

  /**
   * Enhanced validation with comprehensive checks for all modes
   * Returns an object with validation status and detailed error messages
   */
  const getValidationStatus = () => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation: minimum items required
    if (config.items.length < 2) {
      errors.push("At least 2 items are required");
    }

    // Check for empty item names
    const emptyNames = config.items.filter((item) => !item.name.trim());
    if (emptyNames.length > 0) {
      errors.push("All items must have a name");
    }

    // Check for duplicate item names
    const names = config.items.map((item) => item.name.trim().toLowerCase());
    const duplicates = names.filter(
      (name, index) => names.indexOf(name) !== index
    );
    if (duplicates.length > 0) {
      warnings.push("Some items have duplicate names");
    }

    // Mode-specific validations
    switch (config.mode) {
      case "teams":
        const teamCount = config.teamCount || 2;
        if (config.items.length < teamCount) {
          errors.push(
            `Teams mode requires at least ${teamCount} items (one per team). You have ${config.items.length} items for ${teamCount} teams.`
          );
        }
        if (teamCount < 2) {
          errors.push("Teams mode requires at least 2 teams");
        }
        if (teamCount > 10) {
          warnings.push(
            "Having more than 10 teams might be difficult to manage"
          );
        }
        break;

      case "weighted":
        const totalPercentage = config.items.reduce(
          (sum, item) => sum + (item.weight || 0),
          0
        );
        if (totalPercentage < 95) {
          errors.push(
            `Total percentage is too low (${totalPercentage.toFixed(
              1
            )}%). Should be close to 100%.`
          );
        } else if (totalPercentage > 105) {
          errors.push(
            `Total percentage is too high (${totalPercentage.toFixed(
              1
            )}%). Should be close to 100%.`
          );
        }

        // Check for items with 0% weight
        const zeroWeightItems = config.items.filter(
          (item) => (item.weight || 0) === 0
        );
        if (zeroWeightItems.length > 0) {
          warnings.push(
            `${zeroWeightItems.length} item(s) have 0% weight and will never be selected`
          );
        }
        break;

      case "multiple":
        const selectCount = config.selectCount || 1;
        if (selectCount > config.items.length) {
          errors.push(
            `Cannot select ${selectCount} items when only ${config.items.length} items are available`
          );
        }
        if (selectCount < 1) {
          errors.push("Must select at least 1 item in multiple mode");
        }
        if (selectCount === config.items.length) {
          warnings.push(
            "You're selecting all available items - consider using a different mode"
          );
        }
        break;

      case "simple":
        // Additional check for simple mode with removeAfterSpin
        if (config.removeAfterSpin && config.items.length < 3) {
          warnings.push(
            "With item removal enabled, you might run out of items quickly"
          );
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasIssues: errors.length > 0 || warnings.length > 0,
    };
  };

  const validation = getValidationStatus();

  const canProceed = () => {
    return validation.isValid;
  };

  const proceedToSpin = () => {
    if (!canProceed()) return;

    // Redirect to teams page if in teams mode, otherwise use regular spin page
    if (config.mode === "teams") {
      router.push("/teams");
    } else {
      router.push("/spin");
    }
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
      <div
        ref={containerRef}
        className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-6xl"
      >
        {/* Header - Mobile First Design */}
        <div className="mb-6 sm:mb-8">
          {/* Back button - always visible on mobile */}
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

          {/* Title - Centered and responsive */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Setup Your Wheel
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-4">
              Choose your mode and add items to get started
            </p>
          </div>
        </div>

        {/* Mode Selection - Improved responsive grid */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 px-2">
            1. Choose Your Mode
          </h2>
          <div
            ref={modeCardsRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
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
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 ${mode.color} rounded-full flex items-center justify-center mx-auto mb-3`}
                    >
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2 text-sm sm:text-base text-gray-900 dark:text-white">
                      {mode.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {mode.description}
                    </p>
                    {isSelected && (
                      <Badge className="mt-3 bg-blue-500 text-xs">
                        Selected
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Mode-specific configuration - Improved mobile layout */}
        {config.mode === "simple" && (
          <div className="mb-6 px-2">
            <div className="flex items-start space-x-3">
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
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Label
                  htmlFor="removeAfterSpin"
                  className="text-sm font-medium cursor-pointer"
                >
                  Remove items after selection (eliminates repeats)
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  When enabled, selected items are removed from the wheel to
                  prevent them from being picked again
                </p>
              </div>
            </div>
          </div>
        )}

        {config.mode === "teams" && (
          <div className="mb-6 px-2">
            <Label
              htmlFor="teamCount"
              className="text-sm font-medium block mb-2"
            >
              Number of teams
            </Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Input
                id="teamCount"
                type="number"
                min="2"
                max="10"
                value={config.teamCount || 2}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 2 && value <= 10) {
                    setConfig((prev) => ({
                      ...prev,
                      teamCount: value,
                    }));
                  }
                }}
                className={`w-full sm:w-32 ${
                  config.items.length > 0 &&
                  config.items.length < (config.teamCount || 2)
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
              />
              {config.items.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  (Have {config.items.length} items)
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              You need at least {config.teamCount || 2} items to create{" "}
              {config.teamCount || 2} teams
            </p>
          </div>
        )}

        {config.mode === "multiple" && (
          <div className="mb-6 px-2">
            <Label
              htmlFor="selectCount"
              className="text-sm font-medium block mb-2"
            >
              Number of items to select
            </Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Input
                id="selectCount"
                type="number"
                min="1"
                max={config.items.length || 1}
                value={config.selectCount || 1}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  const maxAllowed = config.items.length || 1;
                  if (!isNaN(value) && value >= 1 && value <= maxAllowed) {
                    setConfig((prev) => ({
                      ...prev,
                      selectCount: value,
                    }));
                  }
                }}
                className={`w-full sm:w-32 ${
                  (config.selectCount || 1) > config.items.length
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
              />
              {config.items.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  (Max: {config.items.length})
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Cannot select more items than available. Add more items to
              increase selection limit.
            </p>
          </div>
        )}

        {config.mode === "weighted" && config.items.length > 0 && (
          <div className="mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mx-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <Scale className="h-4 w-4 flex-shrink-0" />
                <span>Percentage Distribution</span>
              </h3>
              <div className="flex items-center gap-2">
                {isPercentageValid ? (
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                )}
                <Badge
                  variant={isPercentageValid ? "default" : "destructive"}
                  className="text-xs whitespace-nowrap"
                >
                  Total: {totalPercentage.toFixed(1)}%
                </Badge>
              </div>
            </div>

            {/* Enhanced visual percentage bar with legend */}
            <div className="space-y-2 mb-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden border border-gray-300 dark:border-gray-600">
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
                      className="h-full float-left transition-all duration-300"
                      style={{
                        width: `${Math.max(percentage, 0)}%`,
                        backgroundColor: colors[index % colors.length],
                      }}
                      title={`${item.name}: ${percentage}%`}
                    />
                  ) : null;
                })}
              </div>

              {/* Progress indicator */}
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>0%</span>
                <span
                  className={`font-medium ${
                    isPercentageValid ? "text-green-600" : "text-amber-600"
                  }`}
                >
                  {totalPercentage.toFixed(1)}% / 100%
                </span>
                <span>100%</span>
              </div>
            </div>

            {/* Status message */}
            <div className="mb-3">
              {totalPercentage === 100 ? (
                <p className="text-xs text-green-700 dark:text-green-300 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Perfect! Percentages add up to exactly 100%
                </p>
              ) : !isPercentageValid ? (
                <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Percentages should add up to approximately 100% (currently{" "}
                  {totalPercentage.toFixed(1)}%)
                </p>
              ) : (
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Good! Percentages are within acceptable range (
                  {totalPercentage.toFixed(1)}%)
                </p>
              )}
            </div>

            <p className="text-xs text-blue-700 dark:text-blue-300 mb-3 leading-relaxed">
              Each item&apos;s percentage represents its chance of being selected
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={distributePercentagesEqually}
                className="text-xs w-full sm:w-auto"
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
                className="text-xs w-full sm:w-auto"
              >
                Reset All
              </Button>
            </div>
          </div>
        )}

        {/* Validation Status - Improved mobile layout */}
        {validation.hasIssues && (
          <div className="mb-6 space-y-3 mx-2">
            {/* Errors */}
            {validation.errors.length > 0 && (
              <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <h3 className="text-sm font-medium text-red-900 dark:text-red-100">
                    Setup Issues ({validation.errors.length})
                  </h3>
                </div>
                <ul className="space-y-1">
                  {validation.errors.map((error, index) => (
                    <li
                      key={index}
                      className="text-xs text-red-700 dark:text-red-300 flex items-start gap-2"
                    >
                      <span className="text-red-500 mt-0.5 flex-shrink-0">
                        •
                      </span>
                      <span className="break-words">{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {validation.warnings.length > 0 && (
              <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <h3 className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Recommendations ({validation.warnings.length})
                  </h3>
                </div>
                <ul className="space-y-1">
                  {validation.warnings.map((warning, index) => (
                    <li
                      key={index}
                      className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2"
                    >
                      <span className="text-amber-500 mt-0.5 flex-shrink-0">
                        •
                      </span>
                      <span className="break-words">{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Items Configuration - Improved mobile layout */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 px-2">
            2. Add Your Items
          </h2>

          {/* Add item input - Mobile first */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4 px-2">
            <Input
              placeholder="Enter item name..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 min-w-0"
            />
            <Button
              onClick={addItem}
              disabled={!newItemName.trim()}
              className="w-full sm:w-auto whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Items list - Responsive design */}
          <div ref={itemsRef} className="space-y-3 px-2">
            {config.items.map((item) => (
              <Card key={item.id} className="p-3 sm:p-4">
                <div className="flex flex-col gap-3">
                  {/* Item name input - full width on mobile */}
                  <div className="flex-1">
                    <Input
                      value={item.name}
                      onChange={(e) => updateItemName(item.id, e.target.value)}
                      className="font-medium w-full"
                      placeholder="Item name"
                    />
                  </div>

                  {/* Weighted mode controls and delete button */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    {config.mode === "weighted" && (
                      <div className="flex items-center gap-2 flex-1">
                        <Label className="text-sm whitespace-nowrap flex-shrink-0">
                          Percentage:
                        </Label>
                        <div className="flex items-center gap-1 min-w-0">
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
                            className="w-16 sm:w-20 text-center flex-shrink-0"
                          />
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                            %
                          </span>
                        </div>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700 w-full sm:w-auto flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4 mr-2 sm:mr-0" />
                      <span className="sm:hidden">Remove Item</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {config.items.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 px-2">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">
                Add at least 2 items to get started
              </p>
            </div>
          )}
        </div>

        {/* Action buttons - Mobile responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 px-2">
          <div className="text-sm space-y-1 order-2 sm:order-1">
            <div className="text-gray-600 dark:text-gray-400 text-center sm:text-left">
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
                    !isPercentageValid
                      ? "text-amber-600 dark:text-amber-400"
                      : ""
                  }
                >
                  • Total: {totalPercentage.toFixed(1)}%
                </span>
              )}
            </div>

            {/* Validation status indicator */}
            {validation.hasIssues ? (
              <div className="flex items-center justify-center sm:justify-start gap-1 text-xs">
                {validation.errors.length > 0 ? (
                  <>
                    <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                    <span className="text-red-600 dark:text-red-400">
                      {validation.errors.length} issue
                      {validation.errors.length !== 1 ? "s" : ""}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3 text-amber-500 flex-shrink-0" />
                    <span className="text-amber-600 dark:text-amber-400">
                      {validation.warnings.length} recommendation
                      {validation.warnings.length !== 1 ? "s" : ""}
                    </span>
                  </>
                )}
              </div>
            ) : validation.isValid && config.items.length >= 2 ? (
              <div className="flex items-center justify-center sm:justify-start gap-1 text-xs">
                <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                <span className="text-green-600 dark:text-green-400">
                  Ready to proceed
                </span>
              </div>
            ) : null}
          </div>

          <Button
            size="lg"
            onClick={proceedToSpin}
            disabled={!canProceed()}
            className={`${
              canProceed()
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                : "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
            } transition-all duration-200 order-1 sm:order-2 w-full sm:w-auto`}
            title={!canProceed() ? "Fix the issues above to proceed" : ""}
          >
            <span className="flex items-center justify-center">
              {config.mode === "teams" ? "Create Teams" : "Create Wheel"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
