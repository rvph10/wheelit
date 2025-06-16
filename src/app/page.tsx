"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  HeroSection,
  FeatureCards,
  AnimatedBackground,
} from "@/components/home";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial animation setup
      gsap.from(heroRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power3.out",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <HeroSection />
        <FeatureCards />
      </div>
    </div>
  );
}
