"use client";

import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import SeverityBadge from "../shared/SeverityBadge";
import VerifiedBadge from "../shared/VerifiedBadge";

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-100, 100], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-8, 8]), { stiffness: 300, damping: 30 });

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function FloatingCards() {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const fakeCases = [
    { name: "Ravi Kumar", severity: "severe" as const, time: "2 min ago" },
    { name: "Priya Nair", severity: "moderate" as const, time: "15 min ago" },
    { name: "Anil Verma", severity: "mild" as const, time: "1 hr ago" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-6"
    >
      {/* Card 1: Doctor Worklist */}
      <motion.div variants={cardVariants}>
        <TiltCard className="card-dark h-full">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Doctor Worklist</h3>
          <div className="space-y-3">
            {fakeCases.map((c, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-text-primary text-sm font-medium">{c.name}</p>
                  <p className="text-text-muted text-xs">{c.time}</p>
                </div>
                <SeverityBadge severity={c.severity} />
              </div>
            ))}
          </div>
        </TiltCard>
      </motion.div>

      {/* Card 2: AI Analysis */}
      <motion.div variants={cardVariants}>
        <TiltCard className="card-dark h-full">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">AI Analysis</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-muted">Confidence</span>
                <span className="text-doctor-accent font-bold">96.2%</span>
              </div>
              <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-doctor-accent to-primary rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: "96.2%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-lg p-3">
                <p className="text-[10px] text-text-muted uppercase">Severity</p>
                <p className="text-sm text-severe-soft font-bold">Moderate</p>
              </div>
              <div className="bg-background rounded-lg p-3">
                <p className="text-[10px] text-text-muted uppercase">Region</p>
                <p className="text-sm text-text-primary font-bold">Right Lower</p>
              </div>
            </div>
            <div className="bg-background rounded-lg p-3">
              <p className="text-[10px] text-text-muted uppercase">Finding</p>
              <p className="text-sm text-text-primary">Bilateral infiltrates detected in lower lobes</p>
            </div>
          </div>
        </TiltCard>
      </motion.div>

      {/* Card 3: Patient Prescription */}
      <motion.div variants={cardVariants}>
        <TiltCard className="card-light h-full">
          <h3 className="text-sm font-semibold text-text-dark-muted uppercase tracking-wider mb-4">Your Prescription</h3>
          <div className="space-y-3">
            <VerifiedBadge doctorName="Dr. Arun Mehta" />
            <div className="border-t border-patient-border pt-3 space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-patient-accent mt-1.5 flex-shrink-0"></div>
                <p className="text-sm text-text-dark">Amoxicillin 500mg — 3x daily for 7 days</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-patient-accent mt-1.5 flex-shrink-0"></div>
                <p className="text-sm text-text-dark">Chest X-ray follow-up in 2 weeks</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-patient-accent mt-1.5 flex-shrink-0"></div>
                <p className="text-sm text-text-dark">Rest and increase fluid intake</p>
              </div>
            </div>
            <p className="text-xs text-text-dark-muted italic">Prescribed on Aug 10, 2026</p>
          </div>
        </TiltCard>
      </motion.div>
    </motion.div>
  );
}
