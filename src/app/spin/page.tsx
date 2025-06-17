"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import Confetti from "react-confetti";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { wheelHaptics } from "@/lib/haptics";
import { wheelSounds, uiSounds, initializeSounds } from "@/lib/sounds";
import ShareExportModal from "@/components/ShareExportModal";
import {
  ArrowLeft,
  RotateCcw,
  Share,
  Trophy,
  Users,
  Sparkles,
  X,
  Medal,
  Shuffle,
  Grid3X3,
} from "lucide-react";

type WheelMode = "simple" | "teams" | "weighted" | "multiple";

interface WheelItem {
  id: string;
  name: string;
  weight?: number;
  color?: string;
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
                Probability: {selectedItem.weight}%
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
  removeAfterSpin = false,
  selectionPosition = 0,
}: {
  items: WheelItem[];
  mode: WheelMode;
  onResult: (result: SpinResult) => void;
  removeAfterSpin?: boolean;
  selectionPosition?: number;
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

  // Calculate segment angles based on percentages for weighted mode
  const getSegmentAngles = useCallback(() => {
    if (mode === "weighted") {
      const totalPercentage = items.reduce(
        (sum, item) => sum + (item.weight || 0),
        0
      );

      let currentAngle = 0;
      return items.map((item) => {
        const percentage = (item.weight || 0) / Math.max(totalPercentage, 1); // Normalize to 0-1
        const angle = percentage * 360;
        const result = {
          start: currentAngle,
          angle,
          end: currentAngle + angle,
        };
        currentAngle += angle;
        return result;
      });
    } else {
      // Equal segments for non-weighted modes
      const segmentAngle = 360 / items.length;
      return items.map((_, index) => ({
        start: index * segmentAngle,
        angle: segmentAngle,
        end: (index + 1) * segmentAngle,
      }));
    }
  }, [items, mode]);

  const segmentAngles = getSegmentAngles();

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
    ctx.clearRect(0, 0, canvas.width, canvas.width);

    // Draw segments using calculated angles
    items.forEach((item, index) => {
      const segment = segmentAngles[index];
      if (!segment) return;

      const startAngle = (segment.start - 90) * (Math.PI / 180); // -90 to start from top
      const endAngle = (segment.end - 90) * (Math.PI / 180);

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

      // Draw text - responsive font sizing
      const textAngle = startAngle + (endAngle - startAngle) / 2;
      const textX = centerX + Math.cos(textAngle) * (radius * 0.7);
      const textY = centerY + Math.sin(textAngle) * (radius * 0.7);

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = "#FFFFFF";

      // Responsive font sizing based on canvas size
      const fontSize = Math.max(10, Math.min(14, radius / 20));
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Truncate long text based on canvas size
      const maxLength = radius > 150 ? 12 : 8;
      const displayText =
        item.name.length > maxLength
          ? item.name.substring(0, maxLength) + "..."
          : item.name;
      ctx.fillText(displayText, 0, 0);

      // Draw percentage indicator for weighted mode
      if (mode === "weighted" && item.weight) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        const percentageFontSize = Math.max(8, Math.min(12, radius / 25));
        ctx.font = `bold ${percentageFontSize}px Arial`;
        ctx.fillText(`${item.weight}%`, 0, fontSize + 5);
      }

      ctx.restore();
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
  }, [items, mode, segmentAngles, colors]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  // FIXED: Accurate algorithm to determine winning segment with percentage support
  const determineWinningSegment = (finalRotation: number): WheelItem => {
    // Normalize rotation to 0-360 degrees
    const normalizedRotation = ((finalRotation % 360) + 360) % 360;

    // The pointer is at the top (0 degrees), calculate which segment it points to
    // We need to account for the wheel rotating clockwise
    const pointerAngle = (360 - normalizedRotation) % 360;

    // Find which segment the pointer is in
    for (let i = 0; i < segmentAngles.length; i++) {
      const segment = segmentAngles[i];
      if (pointerAngle >= segment.start && pointerAngle < segment.end) {
        return items[i];
      }
    }

    // Fallback to last item
    return items[items.length - 1];
  };

  /**
   * SECRET CHEAT FEATURE:
   * - Only active in simple mode with removeAfterSpin enabled
   * - First pick (position 0) is always legitimate
   * - Second pick (position 1) favors "Gatien" if available
   * - Third pick (position 2) favors "Raphael" if available
   * - After that, proceeds normally
   * - Completely undetectable to observers - same spin duration and behavior
   */
  // Main spin function
  const performSpin = () => {
    if (isSpinning || items.length === 0) return;
    setIsSpinning(true);

    // Trigger haptic feedback when spinning starts
    wheelHaptics.onSpinStart();
    // Trigger sound effect when spinning starts
    wheelSounds.onSpinStart();

    let winner: WheelItem;
    let finalRotation: number = 0; // Initialize to prevent TypeScript error

    if (mode === "simple" && removeAfterSpin && selectionPosition >= 1) {
      // Cheat is active: check for priority picks
      let cheatWinner: WheelItem | null = null;

      // Position 2: Try to pick Gatien if available
      if (selectionPosition === 1) {
        cheatWinner =
          items.find((item) => item.name.toLowerCase().includes("gatien")) ||
          null;
      }
      // Position 3: Try to pick Raphael if available
      else if (selectionPosition === 2) {
        cheatWinner =
          items.find((item) => item.name.toLowerCase().includes("raphael")) ||
          null;
      }

      if (cheatWinner) {
        // Calculate the rotation needed to land on the cheat winner
        const targetIndex = items.findIndex(
          (item) => item.id === cheatWinner.id
        );

        // Get the target segment for logging purposes
        const targetSegment = segmentAngles[targetIndex];

        // BRUTE FORCE APPROACH: Try different rotations until we find one that works
        let foundValidRotation = false;
        let attempts = 0;
        const maxAttempts = 1000;

        while (!foundValidRotation && attempts < maxAttempts) {
          // Generate a candidate rotation
          const baseRotations = 5 + Math.random() * 3;
          const testAngle = Math.random() * 360;
          const candidateRotation =
            wheelRotation + baseRotations * 360 + testAngle;

          // Test if this rotation would result in our target winner
          const testWinner = determineWinningSegment(candidateRotation);

          if (testWinner.id === cheatWinner.id) {
            // Found a rotation that works!
            finalRotation = candidateRotation;
            foundValidRotation = true;
            winner = cheatWinner;
            console.log(
              `🎯 CHEAT SUCCESS: Found rotation for ${cheatWinner.name} after ${
                attempts + 1
              } attempts`
            );
            console.log(
              `📍 Target segment: ${targetSegment.start}-${targetSegment.end} degrees`
            );
          }

          attempts++;
        }

        if (!foundValidRotation) {
          // Fallback: if we can't find a good rotation, proceed normally
          console.warn(
            `⚠️ CHEAT FAILED: Could not find valid rotation for ${cheatWinner.name} after ${maxAttempts} attempts`
          );
          const baseRotations = 5 + Math.random() * 5;
          const randomAngle = Math.random() * 360;
          finalRotation = wheelRotation + baseRotations * 360 + randomAngle;
          winner = determineWinningSegment(finalRotation);
        }
      } else {
        // No cheat target found, proceed normally
        const baseRotations = 5 + Math.random() * 5;
        const randomAngle = Math.random() * 360;
        finalRotation = wheelRotation + baseRotations * 360 + randomAngle;
        winner = determineWinningSegment(finalRotation);
      }
    } else {
      // Normal operation: first pick is always legitimate, or non-cheat mode
      const baseRotations = 5 + Math.random() * 5;
      const randomAngle = Math.random() * 360;
      finalRotation = wheelRotation + baseRotations * 360 + randomAngle;
      winner = determineWinningSegment(finalRotation);
    }

    // Animate the wheel spin (same duration regardless of cheat to keep it subtle)
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

        // Trigger haptic feedback when wheel stops spinning
        wheelHaptics.onSpinStop();
        // Trigger sound effect when wheel stops spinning
        wheelSounds.onSpinStop();

        // Slight delay before winner selection haptic for better UX
        setTimeout(() => {
          wheelHaptics.onWinnerSelected();
          wheelSounds.onWinnerRevealed();
        }, 300);

        onResult({
          type: mode as "simple" | "teams" | "weighted" | "multiple",
          selectedItems: [winner],
          timestamp: Date.now(),
        });
      },
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Wheel Container - Responsive sizing */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg aspect-square">
              <div
                ref={wheelRef}
                className="relative w-full h-full"
                style={{ transformOrigin: "50% 50%" }}
              >
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={400}
                  className="w-full h-full max-w-full"
                />
              </div>

              {/* Pointer - responsive sizing */}
              <div className="absolute -rotate-180 top-0 left-1/2 transform -translate-x-1/2 z-10">
                <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] sm:border-l-[15px] sm:border-r-[15px] sm:border-b-[25px] border-l-transparent border-r-transparent border-b-red-600 drop-shadow-lg"></div>
              </div>
            </div>
          </div>

          {/* Spin Button - Responsive sizing */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={performSpin}
              disabled={isSpinning || items.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-6 w-full sm:w-auto"
            >
              {isSpinning ? (
                <>
                  <RotateCcw className="mr-2 h-5 w-5 animate-spin" />
                  <span>Spinning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  <span>Spin the Wheel</span>
                </>
              )}
            </Button>
          </div>

          {/* Items List - Responsive design */}
          <div className="max-h-48 sm:max-h-60 overflow-y-auto">
            <h3 className="text-base sm:text-lg font-semibold mb-3 text-gray-900 dark:text-white text-center">
              Items ({items.length})
            </h3>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg gap-2"
                >
                  <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base break-words min-w-0 flex-1">
                    {item.name}
                  </span>
                  {mode === "weighted" && (
                    <Badge
                      variant="secondary"
                      className="text-xs flex-shrink-0"
                      style={{
                        backgroundColor: colors[index % colors.length] + "20",
                        color: colors[index % colors.length],
                      }}
                    >
                      {item.weight}%
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// New Multiple Selection Animation Component
const MultipleSelectAnimation = ({
  items,
  selectCount,
  onResult,
}: {
  items: WheelItem[];
  selectCount: number;
  onResult: (result: SpinResult) => void;
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [shuffledItems, setShuffledItems] = useState<WheelItem[]>(items);

  const cardsRef = useRef<HTMLDivElement>(null);

  // Generate colors for cards
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

  useEffect(() => {
    setShuffledItems(items);
  }, [items]);

  const performSelection = async () => {
    if (isSelecting || items.length === 0) return;

    setIsSelecting(true);

    // Step 1: Shuffle animation
    const shuffleRounds = 8;
    for (let round = 0; round < shuffleRounds; round++) {
      const newShuffled = [...items].sort(() => Math.random() - 0.5);
      setShuffledItems(newShuffled);

      // Animate cards during shuffle
      if (cardsRef.current) {
        gsap.to(cardsRef.current.children, {
          rotateY: 360,
          duration: 0.3,
          stagger: 0.02,
          ease: "power2.inOut",
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Step 2: Final shuffle to determine winners
    const finalShuffled = [...items].sort(() => Math.random() - 0.5);
    const winners = finalShuffled.slice(0, selectCount);
    setShuffledItems(finalShuffled);

    // Step 3: Brief pause for effect
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 4: Complete the selection and show results
    setIsSelecting(false);

    // Trigger haptic feedback for multiple selection completion
    wheelHaptics.onMultipleSelection();
    // Trigger sound effect for multiple selection completion
    wheelSounds.onMultipleSelection();

    onResult({
      type: "multiple",
      selectedItems: winners,
      timestamp: Date.now(),
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Cards Grid - Responsive */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-white text-center">
              Available Items
            </h3>
            <div
              ref={cardsRef}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 min-h-[150px] sm:min-h-[200px]"
            >
              {shuffledItems.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="relative aspect-[3/4] rounded-lg shadow-md transform-gpu transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: colors[index % colors.length],
                    perspective: "1000px",
                  }}
                >
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent p-2 flex flex-col justify-center items-center text-white text-center">
                    <div className="text-xs font-bold break-words leading-tight">
                      {item.name.length > 8
                        ? item.name.substring(0, 8) + "..."
                        : item.name}
                    </div>
                  </div>

                  {/* Card back pattern for shuffle effect */}
                  <div className="absolute inset-0 rounded-lg bg-gray-800 opacity-0 flex items-center justify-center text-white text-2xl">
                    🎴
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selection Button - Responsive */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={performSelection}
              disabled={isSelecting || items.length === 0}
              className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-6 w-full sm:w-auto"
            >
              {isSelecting ? (
                <>
                  <Shuffle className="mr-2 h-5 w-5 animate-pulse" />
                  <span>Selecting {selectCount} items...</span>
                </>
              ) : (
                <>
                  <Grid3X3 className="mr-2 h-5 w-5" />
                  <span>
                    Select {selectCount} Random Item{selectCount > 1 ? "s" : ""}
                  </span>
                </>
              )}
            </Button>
          </div>

          {/* Items List Summary - Responsive */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 text-center">
              Total Items: {items.length} | Selecting: {selectCount}
            </h3>
            <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
              {items.slice(0, 8).map((item, index) => (
                <Badge
                  key={item.id}
                  variant="outline"
                  className="text-xs"
                  style={{
                    backgroundColor: colors[index % colors.length] + "20",
                    borderColor: colors[index % colors.length],
                    color: colors[index % colors.length],
                  }}
                >
                  {item.name.length > 8
                    ? item.name.substring(0, 8) + "..."
                    : item.name}
                </Badge>
              ))}
              {items.length > 8 && (
                <Badge variant="outline" className="text-xs">
                  +{items.length - 8} more
                </Badge>
              )}
            </div>
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
  const [showShareExportModal, setShowShareExportModal] = useState(false);

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

    // Initialize sound effects
    initializeSounds().catch(console.warn);

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
    // Trigger sound effect for modal close
    uiSounds.onModalClose();

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

  // Create teams from items with constraint support
  const createTeams = (
    items: WheelItem[],
    teamCount: number,
    constraints: TeamConstraint[] = []
  ): WheelItem[][] => {
    if (constraints.length === 0) {
      // Simple round-robin assignment if no constraints
      const shuffled = [...items].sort(() => Math.random() - 0.5);
      const teams: WheelItem[][] = Array.from({ length: teamCount }, () => []);

      shuffled.forEach((item, index) => {
        teams[index % teamCount].push(item);
      });

      return teams;
    }

    // Advanced team creation with constraint satisfaction
    const teams: WheelItem[][] = Array.from({ length: teamCount }, () => []);
    const unassigned = [...items];
    const maxAttempts = 1000; // Prevent infinite loops
    let attempts = 0;

    /**
     * Check if placing an item in a team would violate any constraints
     */
    const wouldViolateConstraints = (
      item: WheelItem,
      teamIndex: number
    ): boolean => {
      const team = teams[teamIndex];

      return constraints.some((constraint) => {
        const isItem1 = constraint.item1Id === item.id;
        const isItem2 = constraint.item2Id === item.id;

        if (!isItem1 && !isItem2) return false; // Constraint doesn't involve this item

        const otherItemId = isItem1 ? constraint.item2Id : constraint.item1Id;
        return team.some((teamMember) => teamMember.id === otherItemId);
      });
    };

    /**
     * Find the best team for an item (least constrainted)
     */
    const findBestTeam = (item: WheelItem): number => {
      const teamScores = teams.map((team, index) => ({
        index,
        size: team.length,
        violates: wouldViolateConstraints(item, index),
      }));

      // Filter out teams that would violate constraints
      const validTeams = teamScores.filter((score) => !score.violates);

      if (validTeams.length === 0) {
        // If all teams would violate constraints, pick the smallest one
        // This is a fallback - in practice, this should rarely happen with reasonable constraints
        return teamScores.reduce((smallest, current) =>
          current.size < smallest.size ? current : smallest
        ).index;
      }

      // Among valid teams, pick the one with the fewest members (for balance)
      return validTeams.reduce((smallest, current) =>
        current.size < smallest.size ? current : smallest
      ).index;
    };

    // Shuffle items for randomness
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);

    // First pass: try to assign all items respecting constraints
    for (const item of shuffledItems) {
      if (attempts >= maxAttempts) {
        console.warn(
          "Maximum attempts reached in team creation, falling back to simple assignment"
        );
        break;
      }

      const bestTeamIndex = findBestTeam(item);
      teams[bestTeamIndex].push(item);

      // Remove from unassigned
      const itemIndex = unassigned.findIndex(
        (unassignedItem) => unassignedItem.id === item.id
      );
      if (itemIndex !== -1) {
        unassigned.splice(itemIndex, 1);
      }

      attempts++;
    }

    // Fallback: assign any remaining items to smallest teams
    unassigned.forEach((item) => {
      const smallestTeamIndex = teams.reduce(
        (smallestIndex, team, index) =>
          team.length < teams[smallestIndex].length ? index : smallestIndex,
        0
      );
      teams[smallestTeamIndex].push(item);
    });

    return teams;
  };

  // Handle result from wheel
  const handleWheelResult = (spinResult: SpinResult) => {
    let result: SpinResult;

    switch (config.mode) {
      case "teams":
        const teams = createTeams(
          currentItems,
          config.teamCount || 2,
          config.teamConstraints || []
        );
        result = {
          type: "teams",
          teams,
          timestamp: Date.now(),
        };

        // Trigger haptic feedback for team creation
        wheelHaptics.onTeamCreated();
        // Trigger sound effect for team creation
        wheelSounds.onTeamCreated();
        break;

      case "multiple":
        const shuffled = [...currentItems].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, config.selectCount || 1);
        result = {
          type: "multiple",
          selectedItems: selected,
          timestamp: Date.now(),
        };

        // Trigger haptic feedback for multiple selection
        wheelHaptics.onMultipleSelection();
        // Trigger sound effect for multiple selection
        wheelSounds.onMultipleSelection();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div
        ref={containerRef}
        className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-7xl"
      >
        {/* Header - Mobile First Design */}
        <div className="mb-6 sm:mb-8">
          {/* Back button - always visible on mobile */}
          <div className="mb-4 sm:mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/setup")}
              className="group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-gray-800 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Back to Setup</span>
            </Button>
          </div>

          {/* Title and mode info - Responsive layout */}
          <div className="text-center mb-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Spin the Wheel
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-4 mb-3">
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

          {/* Badges - Mobile responsive */}
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {config.mode} mode
            </Badge>
            {config.mode === "simple" && config.removeAfterSpin && (
              <Badge variant="outline" className="text-xs sm:text-sm">
                {currentItems.length} remaining
              </Badge>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Working Wheel Section - Responsive sizing */}
          <div className="space-y-4 flex flex-col items-center">
            {config.mode === "multiple" ? (
              <MultipleSelectAnimation
                items={currentItems}
                selectCount={config.selectCount || 1}
                onResult={handleWheelResult}
              />
            ) : (
              <WorkingWheel
                items={currentItems}
                mode={config.mode}
                onResult={handleWheelResult}
                removeAfterSpin={config.removeAfterSpin || false}
                selectionPosition={selectionPosition}
              />
            )}

            {/* Reset button for simple mode with removeAfterSpin enabled */}
            {config.mode === "simple" &&
              config.removeAfterSpin &&
              currentItems.length !== originalItems.length && (
                <div className="text-center w-full">
                  <Button
                    variant="outline"
                    onClick={resetItems}
                    className="flex items-center gap-2 w-full sm:w-auto"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="text-sm">
                      Reset All Items (
                      {originalItems.length - currentItems.length} removed)
                    </span>
                  </Button>
                </div>
              )}
          </div>

          {/* Results Section - Improved mobile layout */}
          <div className="space-y-4 sm:space-y-6">
            {result && (
              <Card ref={resultRef}>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Trophy className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                    <span>Result</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {result.type === "teams" && result.teams ? (
                    <div className="space-y-3 sm:space-y-4">
                      {result.teams.map((team, index) => (
                        <div
                          key={index}
                          className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span>Team {index + 1}</span>
                          </h4>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {team.map((member) => (
                              <Badge
                                key={member.id}
                                variant="secondary"
                                className="text-xs"
                              >
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
                          className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg"
                        >
                          <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
                            {item.name}
                          </h4>
                          {config.mode === "weighted" && item.weight && (
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Probability: {item.weight}%
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowShareExportModal(true)}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200"
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Share & Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* History - Improved mobile layout */}
            {spinHistory.length > 0 && (
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl">
                    Recent Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
                    {spinHistory.map((historyResult) => (
                      <div
                        key={historyResult.timestamp}
                        className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                      >
                        <div className="font-medium break-words">
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

      {/* Enhanced Share & Export Modal */}
      <ShareExportModal
        isOpen={showShareExportModal}
        onClose={() => setShowShareExportModal(false)}
        config={config}
        result={result}
        spinHistory={spinHistory}
      />
    </div>
  );
}
