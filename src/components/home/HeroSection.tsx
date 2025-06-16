/**
 * HeroSection Component - Main hero section for the home page
 * Features:
 * - Animated title and subtitle with GSAP
 * - Interactive CTA button with hover effects
 * - Responsive design with gradient text
 * - Enhanced accessibility
 */

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const HeroSection = () => {
  const router = useRouter();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const ctaButtonRef = useRef<HTMLButtonElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);

  // Enhanced button hover interactions
  const handleButtonHover = () => {
    gsap.to(ctaButtonRef.current, {
      scale: 1.05,
      duration: 0.3,
      ease: "back.out(1.7)",
    });
    gsap.to(arrowRef.current, {
      x: 5,
      rotation: 5,
      duration: 0.3,
      ease: "back.out(1.7)",
    });
  };

  const handleButtonLeave = () => {
    gsap.to(ctaButtonRef.current, {
      scale: 1.7,
      duration: 0.3,
      ease: "power2.out",
    });
    gsap.to(arrowRef.current, {
      x: 0,
      rotation: 0,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleButtonClick = () => {
    gsap.to(ctaButtonRef.current, {
      scale: 0.95,
      duration: 0.1,
      ease: "power2.out",
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        router.push("/setup");
      },
    });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial state - everything hidden
      gsap.set([titleRef.current, subtitleRef.current, buttonsRef.current], {
        opacity: 0,
        y: 30,
      });

      // Animation timeline
      const tl = gsap.timeline({ delay: 0.2 });

      // Title animation
      tl.to(
        titleRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.5"
      );

      // Subtitle animation
      tl.to(
        subtitleRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.6"
      );

      // Buttons animation
      tl.to(
        buttonsRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.4"
      );

      // Enhanced CTA button animations
      // Subtle pulse effect
      gsap.to(ctaButtonRef.current, {
        scale: 1.02,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Glow effect animation
      gsap.to(ctaButtonRef.current, {
        boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
        duration: 1.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="max-w-4xl mx-auto text-center">
      {/* Main Title */}
      <h1
        ref={titleRef}
        className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent leading-tight"
      >
        WheelIt
      </h1>

      {/* Subtitle */}
      <p
        ref={subtitleRef}
        className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
      >
        Make decisions effortlessly with our interactive spinning wheel. Perfect
        for teams, games, and life choices.
      </p>

      {/* Action Buttons */}
      <div
        ref={buttonsRef}
        className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
      >
        <Button
          ref={ctaButtonRef}
          size="lg"
          className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-300 group relative overflow-hidden"
          onMouseEnter={handleButtonHover}
          onMouseLeave={handleButtonLeave}
          onClick={handleButtonClick}
        >
          Start Spinning
          <ArrowRight
            ref={arrowRef}
            className="ml-2 h-5 w-5 transition-transform"
          />
        </Button>
      </div>
    </div>
  );
};

export default HeroSection;
