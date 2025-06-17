"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, Zap, Target } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Client-side interactive home page component with GSAP animations
 * Handles all user interactions and animations for the landing page
 */
export default function HomeClient() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
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
      scale: 1,
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
      // Initial state - everything hidden (GSAP will override CSS)
      gsap.set([titleRef.current, subtitleRef.current, buttonsRef.current], {
        opacity: 0,
        y: 30,
      });

      gsap.set(cardsRef.current?.children || [], {
        opacity: 0,
        y: 50,
        scale: 0.9,
      });

      gsap.set(backgroundRef.current, {
        opacity: 0,
      });

      // Animation timeline - start immediately
      const tl = gsap.timeline({
        onStart: () => setIsLoaded(true),
        delay: 0.1, // Reduced delay
      });

      // Background fade in
      tl.to(backgroundRef.current, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
      });

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

      // Cards stagger animation
      tl.to(
        cardsRef.current?.children || [],
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.7)",
        },
        "-=0.2"
      );

      // Simple floating animation for cards (delayed start)
      tl.call(
        () => {
          gsap.to(cardsRef.current?.children || [], {
            y: -5,
            duration: 3,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        },
        [],
        1
      );

      // Enhanced CTA button animations (delayed start)
      tl.call(
        () => {
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
        },
        [],
        0.5
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div
        ref={backgroundRef}
        className={`absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${
          !isLoaded ? "opacity-0" : ""
        }`}
      >
        {/* Floating orbs for visual interest */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 blur-xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 blur-xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-100 dark:bg-cyan-900 rounded-full opacity-10 blur-2xl" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Title */}
          <h1
            ref={titleRef}
            className={`text-6xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent leading-tight ${
              !isLoaded ? "opacity-0 translate-y-8" : ""
            }`}
          >
            WheelIt
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className={`text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed ${
              !isLoaded ? "opacity-0 translate-y-8" : ""
            }`}
          >
            Make decisions effortlessly with our interactive spinning wheel.
            Perfect for teams, games, and life choices.
          </p>

          {/* Action Buttons */}
          <div
            ref={buttonsRef}
            className={`flex flex-col sm:flex-row gap-4 justify-center mb-20 ${
              !isLoaded ? "opacity-0 translate-y-8" : ""
            }`}
          >
            <Button
              ref={ctaButtonRef}
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-300 group relative overflow-hidden"
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
              onClick={handleButtonClick}
              aria-label="Start using WheelIt spinner tool"
            >
              Start Spinning
              <ArrowRight
                ref={arrowRef}
                className="ml-2 h-5 w-5 transition-transform"
                aria-hidden="true"
              />
            </Button>
          </div>

          {/* Feature Cards */}
          <div
            ref={cardsRef}
            className={`grid gap-6 md:grid-cols-3 max-w-5xl mx-auto ${
              !isLoaded ? "opacity-0" : ""
            }`}
          >
            <Card
              className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer ${
                !isLoaded ? "opacity-0 translate-y-12 scale-90" : ""
              }`}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Target
                    className="h-8 w-8 text-blue-600 dark:text-blue-400"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
                  Simple & Fast
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Add your options and spin instantly. No complex setup
                  required.
                </p>
              </CardContent>
            </Card>

            <Card
              className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer ${
                !isLoaded ? "opacity-0 translate-y-12 scale-90" : ""
              }`}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles
                    className="h-8 w-8 text-purple-600 dark:text-purple-400"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
                  Multiple Modes
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Simple picks, team creation, weighted choices, and more.
                </p>
              </CardContent>
            </Card>

            <Card
              className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer ${
                !isLoaded ? "opacity-0 translate-y-12 scale-90" : ""
              }`}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap
                    className="h-8 w-8 text-cyan-600 dark:text-cyan-400"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
                  No Sign-up
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Start using immediately. Your privacy matters to us.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
