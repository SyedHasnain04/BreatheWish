"use client";

import React, { useRef } from 'react';
import { useAnimationFrame } from 'framer-motion';

export default function ScanLineAnimation() {
  const lineRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  useAnimationFrame((t) => {
    // 4 seconds = 4000ms loop
    const duration = 4000;
    const progress = (t % duration) / duration;
    
    // Convert to percentage for the scan line (0 to 100)
    const yPos = progress * 100;
    
    if (lineRef.current) {
      lineRef.current.style.top = `${yPos}%`;
    }

    // Thresholds for revealing cards
    if (card1Ref.current) card1Ref.current.style.opacity = yPos > 30 ? '1' : '0';
    if (card2Ref.current) card2Ref.current.style.opacity = yPos > 50 ? '1' : '0';
    if (card3Ref.current) card3Ref.current.style.opacity = yPos > 70 ? '1' : '0';
  });

  return (
    <div className="relative w-full max-w-lg aspect-[3/4] bg-[#0F172A] border border-[#334155] rounded-xl overflow-hidden shadow-2xl mx-auto flex items-center justify-center">
      
      {/* SVG Definitions for filters */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      </svg>

      {/* Background SVG representing X-Ray shapes */}
      <svg className="absolute inset-0 w-full h-full p-8" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Spine */}
        <rect x="48" y="10" width="4" height="80" fill="#1E293B" rx="2" />
        {/* Ribcage Outline */}
        <path d="M 20 20 Q 50 10 80 20 Q 90 50 80 80 Q 50 90 20 80 Q 10 50 20 20 Z" fill="none" stroke="#1E293B" strokeWidth="2" />
        {/* Lungs */}
        <ellipse cx="35" cy="50" rx="12" ry="25" fill="#1E293B" />
        <ellipse cx="65" cy="50" rx="12" ry="25" fill="#1E293B" />
        {/* Heart shadow */}
        <circle cx="55" cy="60" r="10" fill="#0F172A" />
      </svg>

      {/* The animated scan line */}
      <div 
        ref={lineRef}
        className="absolute left-0 w-full z-10"
        style={{ top: "0%" }}
      >
        <svg className="w-full h-6 -translate-y-1/2" preserveAspectRatio="none">
          <rect x="0" y="11" width="100%" height="2" fill="#38BDF8" filter="url(#glow)" />
        </svg>
      </div>

      {/* Data Point Cards */}
      <div className="absolute inset-0 p-6 pointer-events-none">
        
        {/* Card 1: Confidence */}
        <div 
          ref={card1Ref} 
          className="absolute top-[30%] left-4 bg-surface/90 border border-border px-3 py-2 rounded-lg backdrop-blur-sm transition-opacity duration-300 opacity-0"
        >
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Confidence</div>
          <div className="text-sm text-doctor-accent font-bold">98.4%</div>
        </div>

        {/* Card 2: Severity */}
        <div 
          ref={card2Ref} 
          className="absolute top-[50%] right-4 bg-surface/90 border border-border px-3 py-2 rounded-lg backdrop-blur-sm transition-opacity duration-300 opacity-0"
        >
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Severity</div>
          <div className="text-sm text-severe-soft font-bold">Moderate</div>
        </div>

        {/* Card 3: Type */}
        <div 
          ref={card3Ref} 
          className="absolute top-[70%] left-10 bg-surface/90 border border-border px-3 py-2 rounded-lg backdrop-blur-sm transition-opacity duration-300 opacity-0"
        >
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Finding</div>
          <div className="text-sm text-text-primary font-bold">Bilateral Infiltrates</div>
        </div>

      </div>

      {/* AI Badge Bottom Right */}
      <div className="absolute bottom-4 right-4 bg-[#334155] border border-[#334155] px-3 py-1.5 rounded-full flex items-center gap-2 z-20">
        <div className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse-slow"></div>
        <span className="text-[10px] font-medium text-[#F1F5F9] tracking-wide">AI Assisted Detection</span>
      </div>

    </div>
  );
}
