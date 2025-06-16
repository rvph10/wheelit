/**
 * AnimatedBackground Component - Animated background with floating orbs
 * Features:
 * - Gradient background with animated orbs
 * - Fade-in animation on mount
 * - Responsive design
 * - Dark mode support
 */

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const AnimatedBackground = () => {
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(backgroundRef.current, {
        opacity: 0,
      });

      // Background fade in
      gsap.to(backgroundRef.current, {
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        delay: 0.2,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={backgroundRef}
      className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    >
      {/* Floating orbs for visual interest */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 blur-xl animate-pulse" />
      <div
        className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 blur-xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-100 dark:bg-cyan-900 rounded-full opacity-10 blur-2xl" />
    </div>
  );
};

export default AnimatedBackground;
