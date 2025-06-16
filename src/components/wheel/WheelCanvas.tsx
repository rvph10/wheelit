/**
 * WheelCanvas Component - Interactive spinning wheel with animations
 * Features:
 * - Canvas-based wheel rendering
 * - GSAP animations for smooth spinning
 * - Dynamic color generation
 * - Responsive design
 * - Multiple wheel modes support
 */

"use client";

import {
  useEffect,
  useRef,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { gsap } from "gsap";
import { WheelItem, WheelMode, SpinResult } from "./types";

interface WheelCanvasProps {
  items: WheelItem[];
  mode: WheelMode;
  onResult: (result: SpinResult) => void;
}

export interface WheelCanvasRef {
  spin: () => void;
}

const WheelCanvas = forwardRef<WheelCanvasRef, WheelCanvasProps>(
  ({ items, mode, onResult }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wheelRef = useRef<HTMLDivElement>(null);
    const isSpinning = useRef(false);

    // Generate colors for wheel segments
    const segmentColors = useMemo(() => {
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
        "#F8C471",
        "#82E0AA",
        "#F1948A",
        "#85C1E9",
        "#D7BDE2",
      ];

      return items.map(
        (item, index) => item.color || colors[index % colors.length]
      );
    }, [items]);

    // Draw the wheel on canvas
    const drawWheel = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas || items.length === 0) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 10;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate segment angles
      const totalWeight = items.reduce(
        (sum, item) => sum + (item.weight || 1),
        0
      );

      let currentAngle = 0;

      items.forEach((item, index) => {
        const weight = item.weight || 1;
        const segmentAngle = (weight / totalWeight) * 2 * Math.PI;

        // Draw segment
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(
          centerX,
          centerY,
          radius,
          currentAngle,
          currentAngle + segmentAngle
        );
        ctx.closePath();
        ctx.fillStyle = segmentColors[index];
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw text
        const textAngle = currentAngle + segmentAngle / 2;
        const textRadius = radius * 0.7;
        const textX = centerX + Math.cos(textAngle) * textRadius;
        const textY = centerY + Math.sin(textAngle) * textRadius;

        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(textAngle + Math.PI / 2);
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px Inter, sans-serif";
        ctx.fontWeight = "600";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Truncate long text
        const maxLength = 12;
        const displayText =
          item.name.length > maxLength
            ? item.name.substring(0, maxLength) + "..."
            : item.name;

        ctx.fillText(displayText, 0, 0);
        ctx.restore();

        currentAngle += segmentAngle;
      });

      // Draw center circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 2;
      ctx.stroke();
    }, [items, segmentColors]);

    // Determine winning segment based on final rotation
    const determineWinningSegment = useCallback(
      (finalRotation: number): WheelItem => {
        const normalizedRotation = ((finalRotation % 360) + 360) % 360;
        const pointerAngle = (360 - normalizedRotation + 90) % 360;

        const totalWeight = items.reduce(
          (sum, item) => sum + (item.weight || 1),
          0
        );
        let currentAngle = 0;

        for (const item of items) {
          const weight = item.weight || 1;
          const segmentAngle = (weight / totalWeight) * 360;

          if (
            pointerAngle >= currentAngle &&
            pointerAngle < currentAngle + segmentAngle
          ) {
            return item;
          }

          currentAngle += segmentAngle;
        }

        return items[0]; // Fallback
      },
      [items]
    );

    // Perform the spin animation
    const performSpin = useCallback(() => {
      if (isSpinning.current || !wheelRef.current || items.length < 2) return;

      isSpinning.current = true;

      // Random rotation between 1440 and 2880 degrees (4-8 full rotations)
      const minRotation = 1440;
      const maxRotation = 2880;
      const finalRotation =
        minRotation + Math.random() * (maxRotation - minRotation);

      gsap.to(wheelRef.current, {
        rotation: `+=${finalRotation}`,
        duration: 3,
        ease: "power3.out",
        onComplete: () => {
          const currentRotation = gsap.getProperty(
            wheelRef.current,
            "rotation"
          ) as number;
          const winner = determineWinningSegment(currentRotation);

          const result: SpinResult = {
            type: "simple",
            selectedItems: [winner],
            timestamp: Date.now(),
          };

          onResult(result);
          isSpinning.current = false;
        },
      });
    }, [items, determineWinningSegment, onResult]);

    // Setup canvas and draw wheel
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const updateCanvasSize = () => {
        const container = canvas.parentElement;
        if (!container) return;

        const size = Math.min(
          container.clientWidth,
          container.clientHeight,
          400
        );
        canvas.width = size;
        canvas.height = size;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;

        drawWheel();
      };

      updateCanvasSize();
      window.addEventListener("resize", updateCanvasSize);

      return () => {
        window.removeEventListener("resize", updateCanvasSize);
      };
    }, [drawWheel]);

    // Redraw when items change
    useEffect(() => {
      drawWheel();
    }, [drawWheel]);

    // Expose spin function via ref
    useImperativeHandle(
      ref,
      () => ({
        spin: performSpin,
      }),
      [performSpin]
    );

    if (items.length === 0) {
      return (
        <div className="flex items-center justify-center h-96 text-gray-500">
          <p>Add items to see the wheel</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center space-y-8">
        {/* Wheel Container */}
        <div className="relative">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500 drop-shadow-lg"></div>
          </div>

          {/* Wheel */}
          <div
            ref={wheelRef}
            className="relative transform-gpu"
            style={{ transformOrigin: "center" }}
          >
            <canvas
              ref={canvasRef}
              className="rounded-full shadow-2xl"
              style={{ filter: "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1))" }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border"
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: segmentColors[index] }}
              />
              <span className="text-sm font-medium truncate">{item.name}</span>
              {mode === "weighted" && item.weight && (
                <span className="text-xs text-gray-500 ml-auto">
                  {item.weight}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

WheelCanvas.displayName = "WheelCanvas";

export default WheelCanvas;
