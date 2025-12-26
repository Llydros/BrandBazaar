"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Shoe1 from "@/assets/Shoe1.png";
import Shoe2 from "@/assets/Shoe2.png";
import Shoe3 from "@/assets/Shoe3.png";
import Shoe4 from "@/assets/Shoe4.png";
import Shoe5 from "@/assets/Shoe5.png";
import Shoe6 from "@/assets/Shoe6.png";
import Shoe7 from "@/assets/Shoe7.png";
import Shoe8 from "@/assets/Shoe8.png";
import Shoe9 from "@/assets/Shoe9.png";

const shoes = [Shoe1, Shoe2, Shoe3, Shoe4, Shoe5, Shoe6, Shoe7, Shoe8, Shoe9];

export function ShoeRotator() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly trigger a glitch effect
      if (Math.random() > 0.7) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 150);
      }

      setCurrentIndex((prev) => (prev + 1) % shoes.length);
    }, 800); // Change every 800ms for a slightly jerky, industrial feel

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background Graphic Elements - Brutalist style */}
      <div className="absolute inset-0 border-4 border-foreground opacity-10 z-0 pointer-events-none" />
      <div className="absolute top-10 right-10 w-20 h-20 border-t-4 border-r-4 border-foreground opacity-20 z-0" />
      <div className="absolute bottom-10 left-10 w-20 h-20 border-b-4 border-l-4 border-foreground opacity-20 z-0" />

      {/* Main Image */}
      <div
        className={`relative w-full h-full max-h-[600px] aspect-square transition-all duration-100 ${
          isGlitching ? "translate-x-2 opacity-80 grayscale" : ""
        }`}
      >
        <Image
          src={shoes[currentIndex]}
          alt="Featured Shoe"
          fill
          className="object-contain drop-shadow-2xl"
          priority
        />

        {/* Glitch Overlay (only visible when glitching) */}
        {isGlitching && (
          <div className="absolute inset-0 bg-red-500/20 mix-blend-multiply z-10 clip-path-polygon-[0_0,100%_0,100%_40%,0_60%]" />
        )}
      </div>

      {/* Technical readout text */}
      <div className="absolute bottom-4 left-4 font-mono text-sm tracking-widest opacity-50">
        IDX: {currentIndex.toString().padStart(2, "0")} /{" "}
        {shoes.length.toString().padStart(2, "0")}
        <br />
        REF: SH-{Math.floor(Math.random() * 10000)}
      </div>
    </div>
  );
}
