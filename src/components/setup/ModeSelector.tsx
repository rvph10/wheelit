/**
 * ModeSelector Component - Allows users to choose wheel mode
 * Features:
 * - Visual mode cards with icons
 * - Clear descriptions for each mode
 * - Animated selection states
 * - Responsive grid layout
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Scale, Grid3X3 } from "lucide-react";
import { WheelMode } from "../wheel/types";

interface ModeSelectorProps {
  selectedMode: WheelMode;
  onModeChange: (mode: WheelMode) => void;
}

const ModeSelector = ({ selectedMode, onModeChange }: ModeSelectorProps) => {
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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">
        Choose Your Mode
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;

          return (
            <Card
              key={mode.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg group ${
                isSelected
                  ? "ring-2 ring-blue-500 shadow-lg bg-blue-50 dark:bg-blue-950/30"
                  : "hover:shadow-md"
              }`}
              onClick={() => onModeChange(mode.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 ${mode.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                      {mode.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {mode.description}
                    </p>
                  </div>

                  {/* Selection indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                      isSelected
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-full h-full rounded-full bg-white transform scale-50" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ModeSelector;
