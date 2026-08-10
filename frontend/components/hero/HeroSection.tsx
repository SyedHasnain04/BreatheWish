"use client";

import React from "react";
import { motion } from "framer-motion";
import ScanLineAnimation from "./ScanLineAnimation";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="min-h-screen bg-background flex items-center pt-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-doctor-accent font-mono text-sm tracking-wider uppercase mb-4 block">
              AI-Powered Pneumonia Detection
            </span>
            <h1 className="text-hero text-text-primary font-bold mb-6">
              Every breath<br />
              <span className="text-doctor-accent">deserves a wish</span>
            </h1>
            <p className="text-hero-sub text-text-muted max-w-lg mb-8">
              BreatheWish uses advanced deep learning to detect pneumonia from chest X-rays — 
              always verified by a real doctor before reaching you.
            </p>
            <div className="flex gap-4">
              <Link href="/login" className="btn-primary">
                Get Started
              </Link>
              <a href="#how-it-works" className="btn-outline-light">
                Learn More
              </a>
            </div>
          </motion.div>
        </div>

        {/* Right: Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <ScanLineAnimation />
        </motion.div>
      </div>
    </section>
  );
}
