/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";


interface Props {
  originalUrl: string;
  gradcamUrl: string | null;
}

export default function XRayViewer({ originalUrl, gradcamUrl }: Props) {
  const [viewMode, setViewMode] = useState<"original" | "overlay" | "blend">("original");
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isZoomed) {
        setIsZoomed(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomed]);

  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 shadow-sm flex flex-col items-center">
      {/* Toggle Group */}
      {gradcamUrl && (
        <div 
          className="flex bg-surface-raised border border-border rounded-lg p-1 mb-5"
          role="group"
          aria-label="Radiograph view mode"
        >
          {(["original", "overlay", "blend"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              aria-pressed={viewMode === mode}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-doctor-accent ${
                viewMode === mode
                  ? "bg-doctor-accent text-background font-semibold shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {mode === "original" ? "Original" : mode === "overlay" ? "Grad-CAM" : "Blend"}
            </button>
          ))}
        </div>
      )}

      {/* Image Container */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Click to enlarge chest radiograph"
        className="relative w-full max-w-[480px] aspect-square rounded-lg overflow-hidden bg-black cursor-zoom-in group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-doctor-accent"
        onClick={() => setIsZoomed(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsZoomed(true);
          }
        }}
      >
        {/* Original */}
        <img
          src={originalUrl}
          alt="Original chest radiograph"
          className="absolute inset-0 w-full h-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/chest-xray.png";
          }}
        />

        {/* GradCAM Overlay */}
        {gradcamUrl && (viewMode === "overlay" || viewMode === "blend") && (
          <img
            src={gradcamUrl}
            alt="Grad-CAM activation heatmap"
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-200 ${
              viewMode === "blend" ? "mix-blend-overlay opacity-80" : "opacity-100"
            }`}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}

        {/* Hover zoom icon */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="bg-surface/80 backdrop-blur-sm border border-border p-2.5 rounded-md text-text-primary">
            <svg className="w-5 h-5 text-doctor-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </div>
        </div>
      </div>

      {/* Badge / Footer label */}
      <div className="mt-5 flex items-center gap-2 bg-surface-raised border border-border px-3.5 py-1.5 rounded-md text-xs">
        <svg className="w-3.5 h-3.5 text-doctor-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span className="text-text-muted font-mono text-[11px] tracking-tight">
          {gradcamUrl ? "Grad-CAM AI attention map available" : "Standard diagnostic view"}
        </span>
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Enlarged radiograph view"
          >
            <button
              type="button"
              className="absolute top-5 right-5 text-text-muted hover:text-text-primary p-2 rounded-md hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-doctor-accent"
              onClick={() => setIsZoomed(false)}
              aria-label="Close zoom view"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
            <div
              className="relative w-full max-w-4xl aspect-square max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={originalUrl}
                alt="Enlarged chest radiograph"
                className="absolute inset-0 w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/chest-xray.png";
                }}
              />
              {gradcamUrl && (viewMode === "overlay" || viewMode === "blend") && (
                <img
                  src={gradcamUrl}
                  alt="Enlarged Grad-CAM activation heatmap"
                  className={`absolute inset-0 w-full h-full object-contain ${
                    viewMode === "blend" ? "mix-blend-overlay opacity-80" : "opacity-100"
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
