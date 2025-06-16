/**
 * FeatureCards Component - Feature showcase cards for the home page
 * Features:
 * - Animated cards with hover effects
 * - Icons and descriptions for each feature
 * - Responsive grid layout
 * - GSAP animations on mount
 */

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Sparkles, Zap } from "lucide-react";

const FeatureCards = () => {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(cardsRef.current?.children || [], {
        opacity: 0,
        y: 50,
        scale: 0.9,
      });

      // Cards stagger animation
      const tl = gsap.timeline({ delay: 1.5 });
      tl.to(cardsRef.current?.children || [], {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)",
      });

      // Simple floating animation for cards
      gsap.to(cardsRef.current?.children || [], {
        y: -5,
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={cardsRef} className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
            Simple & Fast
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Add your options and spin instantly. No complex setup required.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
            Multiple Modes
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Teams, weighted selections, and multiple picks - all in one tool.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <Zap className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
            Smooth Animations
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Beautiful spinning animations that make every decision exciting.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureCards;
