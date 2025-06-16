"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Custom 404 Not Found page component
 * Minimalist design with gradient backgrounds, animations, and consistent styling
 */
export default function NotFound() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const errorCodeRef = useRef<HTMLDivElement>(null);

  const handleGoBack = () => {
    router.back();
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial state - everything hidden
      gsap.set(
        [
          titleRef.current,
          subtitleRef.current,
          descriptionRef.current,
          buttonsRef.current,
        ],
        {
          opacity: 0,
          y: 30,
        }
      );

      gsap.set(errorCodeRef.current, {
        opacity: 0,
        scale: 0.8,
        rotation: -5,
      });

      gsap.set(backgroundRef.current, {
        opacity: 0,
      });

      // Animation timeline
      const tl = gsap.timeline({ delay: 0.2 });

      // Background fade in
      tl.to(backgroundRef.current, {
        opacity: 1,
        duration: 1,
        ease: "power2.out",
      });

      // Error code animation
      tl.to(
        errorCodeRef.current,
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
        },
        "-=0.7"
      );

      // Title animation
      tl.to(
        titleRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.4"
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

      // Description animation
      tl.to(
        descriptionRef.current,
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

      // Floating animation for error code
      gsap.to(errorCodeRef.current, {
        y: -10,
        rotation: 2,
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
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

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Large 404 Error Code */}
          <div
            ref={errorCodeRef}
            className="text-9xl md:text-[12rem] lg:text-[14rem] font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-500 to-cyan-500 dark:from-blue-400 dark:via-purple-300 dark:to-cyan-300 bg-clip-text text-transparent leading-none select-none"
          >
            404
          </div>

          {/* Main Title */}
          <h1
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent leading-tight"
          >
            Page Not Found
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4 font-medium"
          >
            Oops! The page you&apos;re looking for doesn&apos;t exist.
          </p>

          {/* Description */}
          <p
            ref={descriptionRef}
            className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto"
          >
            It might have been moved, deleted, or you entered the wrong URL.
            Don&apos;t worry, it happens to the best of us!
          </p>

          {/* Action Buttons */}
          <div
            ref={buttonsRef}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              asChild
            >
              <Link href="/">
                <Home className="w-5 h-5 mr-2" />
                Go Home
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="px-8 py-3 text-lg font-semibold rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              onClick={handleGoBack}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
