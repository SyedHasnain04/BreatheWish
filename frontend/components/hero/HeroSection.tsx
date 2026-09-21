"use client";

import React from "react";
import { motion } from "framer-motion";
import ScanLineAnimation from "./ScanLineAnimation";
import Link from "next/link";

const ease = [0.22, 1, 0.36, 1] as const;

export default function HeroSection() {
  return (
    <section className="relative grain overflow-hidden bg-background min-h-[100dvh] flex items-center pt-24 pb-20">
      {/* Ambient light, off-centre so the page doesn't read as a flat fill */}
      <div
        aria-hidden="true"
        className="absolute -top-40 right-[-10%] w-[46rem] h-[46rem] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(closest-side, rgba(111,181,172,0.14), rgba(111,181,172,0) 70%)",
        }}
      />

      <div className="relative max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-16 lg:gap-8 items-center">
        <div>
          <motion.p
            className="font-mono text-xs tracking-[0.18em] uppercase text-doctor-accent mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            Pneumonia screening · doctor reviewed
          </motion.p>

          <motion.h1
            className="text-hero text-text-primary mb-7"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease }}
          >
            Every breath
            <br />
            <span className="text-doctor-accent">deserves a wish</span>
          </motion.h1>

          <motion.p
            className="text-hero-sub text-text-muted max-w-[52ch] mb-10"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease }}
          >
            BreatheWish reads a chest X-ray for signs of pneumonia and puts it in front of a
            doctor. Nothing reaches the patient until that doctor has reviewed it.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-x-8 gap-y-4"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease }}
          >
            <Link href="/login" className="btn-primary">
              Upload an X-ray
            </Link>
            <a href="#how-it-works" className="link-quiet text-sm">
              See how it works
            </a>
          </motion.div>
        </div>

        <motion.div
          className="lg:translate-y-8 lg:-mr-4"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease }}
        >
          <ScanLineAnimation />
        </motion.div>
      </div>
    </section>
  );
}
