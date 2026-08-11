"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X, CheckCircle2 } from "lucide-react";

interface Props {
  originalUrl: string;
  gradcamUrl: string | null;
}

export default function XRayViewer({ originalUrl, gradcamUrl }: Props) {
  const [viewMode, setViewMode] = useState<"original" | "overlay" | "blend">("original");
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col items-center">
      
      {/* Toggle Group */}
      {gradcamUrl && (
        <div className="flex bg-[#1E293B] rounded-lg p-1 mb-6">
          {(["original", "overlay", "blend"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === mode
                  ? "bg-doctor-accent text-white shadow"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Image Container */}
      <div 
        className="relative w-full max-w-[500px] aspect-square rounded-lg overflow-hidden bg-black cursor-zoom-in group"
        onClick={() => setIsZoomed(true)}
      >
        {/* Original */}
        <img 
          src={originalUrl} 
          alt="Original X-Ray" 
          className="absolute inset-0 w-full h-full object-contain"
        />
        
        {/* GradCAM Overlay */}
        {gradcamUrl && (viewMode === "overlay" || viewMode === "blend") && (
          <img 
            src={gradcamUrl} 
            alt="Grad-CAM Overlay" 
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              viewMode === "blend" ? "mix-blend-overlay opacity-80" : "opacity-100"
            }`}
          />
        )}
        
        {/* Hover zoom icon */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <ZoomIn className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Badge */}
      <div className="mt-6 flex items-center gap-2 bg-[#0F172A] border border-[#1E293B] px-4 py-2 rounded-full shadow-inner">
        <CheckCircle2 className="w-4 h-4 text-doctor-accent" />
        <span className="text-sm text-text-primary font-medium tracking-wide">AI Assisted — Grad-CAM Visualization</span>
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <button className="absolute top-6 right-6 text-white/70 hover:text-white p-2">
              <X className="w-8 h-8" />
            </button>
            <div className="relative w-full max-w-5xl aspect-square max-h-[90vh]">
              <img 
                src={originalUrl} 
                alt="Original X-Ray" 
                className="absolute inset-0 w-full h-full object-contain"
              />
              {gradcamUrl && (viewMode === "overlay" || viewMode === "blend") && (
                <img 
                  src={gradcamUrl} 
                  alt="Grad-CAM Overlay" 
                  className={`absolute inset-0 w-full h-full object-contain ${
                    viewMode === "blend" ? "mix-blend-overlay opacity-80" : "opacity-100"
                  }`}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
