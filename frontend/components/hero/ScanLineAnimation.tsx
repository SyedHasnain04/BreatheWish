"use client";

import React, { useRef } from "react";
import { useAnimationFrame } from "framer-motion";
import Image from "next/image";

export default function ScanLineAnimation() {
  const lineRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  useAnimationFrame((t) => {
    const duration = 4000;
    const progress = (t % duration) / duration;
    const yPos = progress * 100;

    if (lineRef.current) {
      // transform, not `top`, so the line stays on the compositor
      lineRef.current.style.transform = `translateY(${progress * 100}cqh)`;
    }

    if (card1Ref.current) card1Ref.current.style.opacity = yPos > 30 ? "1" : "0";
    if (card2Ref.current) card2Ref.current.style.opacity = yPos > 50 ? "1" : "0";
    if (card3Ref.current) card3Ref.current.style.opacity = yPos > 70 ? "1" : "0";
  });

  return (
    <div
      className="relative w-full max-w-md aspect-[3/4] bg-background border border-border rounded-2xl overflow-hidden shadow-card mx-auto"
      style={{ containerType: "size" }}
    >
      <div className="absolute inset-0">
        <Image
          src="/chest-xray.png"
          alt="Chest X-ray being scanned by an animated line"
          fill
          sizes="(min-width: 1024px) 28rem, 90vw"
          className="object-cover opacity-60"
          priority
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(11,17,19,0.35), rgba(11,17,19,0) 30%, rgba(11,17,19,0.55))",
          }}
        />
      </div>

      {/* Scan line */}
      <div
        ref={lineRef}
        aria-hidden="true"
        className="absolute left-0 top-0 w-full h-px bg-doctor-accent z-10 shadow-scan will-change-transform"
      />

      {/* Findings appear as the line passes them */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          ref={card1Ref}
          className="absolute top-[30%] left-4 bg-surface/90 border border-border px-3 py-2 rounded-lg backdrop-blur-sm transition-opacity duration-300 opacity-0"
        >
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Confidence</div>
          <div className="text-sm text-doctor-accent font-mono font-medium tabular">94.7%</div>
        </div>

        <div
          ref={card2Ref}
          className="absolute top-[50%] right-4 bg-surface/90 border border-border px-3 py-2 rounded-lg backdrop-blur-sm transition-opacity duration-300 opacity-0"
        >
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Severity</div>
          <div className="text-sm text-moderate-soft font-medium">Moderate</div>
        </div>

        <div
          ref={card3Ref}
          className="absolute top-[70%] left-10 bg-surface/90 border border-border px-3 py-2 rounded-lg backdrop-blur-sm transition-opacity duration-300 opacity-0"
        >
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Finding</div>
          <div className="text-sm text-text-primary font-medium">Right lower lobe opacity</div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-surface/90 border border-border px-3 py-1.5 rounded-md flex items-center gap-2 z-20 backdrop-blur-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-doctor-accent animate-pulse-slow" />
        <span className="text-[10px] font-medium text-text-primary tracking-wide">
          AI pre-read · pending doctor review
        </span>
      </div>
    </div>
  );
}
