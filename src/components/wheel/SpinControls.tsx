/**
 * SpinControls Component - Control buttons for wheel operations
 * Features:
 * - Spin button with loading state
 * - Reset functionality
 * - Export and share capabilities
 * - Responsive design with animations
 */

"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Download, Share, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface SpinControlsProps {
  onSpin: () => void;
  onReset: () => void;
  onExport: () => void;
  onShare: () => void;
  isSpinning: boolean;
  canSpin: boolean;
  itemCount: number;
}

const SpinControls = ({
  onSpin,
  onReset,
  onExport,
  onShare,
  isSpinning,
  canSpin,
  itemCount,
}: SpinControlsProps) => {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Main Action Button */}
      <div className="text-center">
        <Button
          onClick={onSpin}
          disabled={!canSpin || isSpinning}
          size="lg"
          className="text-xl px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 shadow-lg transition-all duration-300 group relative overflow-hidden"
        >
          {isSpinning ? (
            <>
              <div className="animate-spin mr-3">
                <Sparkles className="h-6 w-6" />
              </div>
              Spinning...
            </>
          ) : (
            <>
              <Sparkles className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
              Spin the Wheel!
            </>
          )}
        </Button>

        {!canSpin && (
          <p className="text-sm text-gray-500 mt-2">
            Add at least 2 items to spin the wheel
          </p>
        )}
      </div>

      {/* Secondary Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Button>

        {itemCount > 0 && (
          <Button variant="outline" onClick={onReset} className="group">
            <RotateCcw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
            Reset Items
          </Button>
        )}

        <Button variant="outline" onClick={onExport} className="group">
          <Download className="h-4 w-4 mr-2 group-hover:translate-y-0.5 transition-transform" />
          Export
        </Button>

        <Button variant="outline" onClick={onShare} className="group">
          <Share className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
          Share
        </Button>
      </div>
    </div>
  );
};

export default SpinControls;
