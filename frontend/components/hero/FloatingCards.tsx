"use client";

import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import SeverityBadge from "../shared/SeverityBadge";
import VerifiedBadge from "../shared/VerifiedBadge";

const ease = [0.22, 1, 0.36, 1] as const;

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-120, 120], [4, -4]), { stiffness: 220, damping: 24 });
  const rotateY = useSpring(useTransform(x, [-120, 120], [-4, 4]), { stiffness: 220, damping: 24 });

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
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const cases = [
  { name: "Ravi Kumar", severity: "severe" as const, time: "2 min ago" },
  { name: "Priya Nair", severity: "moderate" as const, time: "15 min ago" },
  { name: "Anil Verma", severity: "mild" as const, time: "1 hr ago" },
];

const cardVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

export default function FloatingCards() {
  return (
    <motion.div
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.14 } } }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl mx-auto px-6"
    >
      {/* Doctor worklist */}
      <motion.div variants={cardVariants} className="md:col-span-5">
        <TiltCard className="card-dark h-full">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted mb-5">
            Doctor · worklist
          </h3>
          <ul>
            {cases.map((c) => (
              <li
                key={c.name}
                className="flex items-center justify-between py-3.5 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-text-primary text-sm font-medium">{c.name}</p>
                  <p className="text-text-muted text-xs mt-0.5">{c.time}</p>
                </div>
                <SeverityBadge severity={c.severity} />
              </li>
            ))}
          </ul>
        </TiltCard>
      </motion.div>

      {/* AI analysis: wider, dropped lower so the row doesn't line up */}
      <motion.div variants={cardVariants} className="md:col-span-7 md:mt-16">
        <TiltCard className="card-dark h-full">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted mb-5">
            AI · pre-read
          </h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-text-muted">Confidence</span>
                <span className="text-doctor-accent font-mono font-medium tabular">94.7%</span>
              </div>
              <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-doctor-accent rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: "94.7%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.5, ease }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-lg p-3.5">
                <p className="text-[10px] text-text-muted uppercase tracking-wider">Severity</p>
                <p className="text-sm text-moderate-soft font-medium mt-1">Moderate</p>
              </div>
              <div className="bg-background rounded-lg p-3.5">
                <p className="text-[10px] text-text-muted uppercase tracking-wider">Region</p>
                <p className="text-sm text-text-primary font-medium mt-1">Right lower lobe</p>
              </div>
            </div>
            <div className="bg-background rounded-lg p-3.5">
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Finding</p>
              <p className="text-sm text-text-primary mt-1">
                Focal opacity in the right lower lobe, consistent with consolidation
              </p>
            </div>
          </div>
        </TiltCard>
      </motion.div>

      {/* Patient prescription: light surface on purpose, it is the patient's view */}
      <motion.div variants={cardVariants} className="md:col-span-6 md:col-start-2 md:-mt-8 relative z-10">
        <TiltCard className="card-light h-full">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-dark-muted mb-5">
            Patient · prescription
          </h3>
          <div className="space-y-4">
            <VerifiedBadge doctorName="Dr. Arun Mehta" />
            <ul className="border-t border-patient-border pt-4 space-y-2.5">
              {[
                "Amoxicillin 500 mg, three times daily for 7 days",
                "Follow-up chest X-ray in 2 weeks",
                "Rest and drink plenty of fluids",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <span className="w-1 h-1 rounded-full bg-patient-accent mt-2 flex-shrink-0" />
                  <p className="text-sm text-text-dark">{line}</p>
                </li>
              ))}
            </ul>
            <p className="text-xs text-text-dark-muted">Prescribed 10 Aug 2026</p>
          </div>
        </TiltCard>
      </motion.div>
    </motion.div>
  );
}
