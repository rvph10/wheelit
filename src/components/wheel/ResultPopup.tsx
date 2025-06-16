/**
 * ResultPopup Component - Shows the selected item with confetti effect
 * Features:
 * - Confetti animation when item is selected
 * - Displays position number if removeAfterSpin is enabled
 * - Closable by clicking or pressing Escape
 * - Responsive design with animations
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import Confetti from "react-confetti";
import { X, Medal } from "lucide-react";
import { SpinResult } from "./types";

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
            {/* Winner Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <Medal className="h-10 w-10 text-white" />
              </div>
            </div>

            {/* Position Number (if removeAfterSpin mode) */}
            {isRemoveMode && result.position && (
              <div className="mb-4">
                <span className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {result.position}
                  <span className="text-2xl">
                    {getOrdinalSuffix(result.position)}
                  </span>
                </span>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Place Selected
                </p>
              </div>
            )}

            {/* Winner Text */}
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🎉 Winner!
            </h2>

            {/* Selected Item */}
            <div className="mb-6">
              <div
                className="text-2xl font-semibold px-6 py-3 rounded-xl text-white shadow-lg"
                style={{
                  backgroundColor: selectedItem.color || "#3B82F6",
                }}
              >
                {selectedItem.name}
              </div>
            </div>

            {/* Celebration Message */}
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {isRemoveMode
                ? `${selectedItem.name} has been selected and removed from the wheel!`
                : `Congratulations! ${selectedItem.name} is the winner!`}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResultPopup;
