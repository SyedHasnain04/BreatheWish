"use client";

import React from "react";
import { motion } from "framer-motion";
import { Upload, Cpu, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload X-Ray",
    description: "Patient or doctor uploads a chest X-ray image securely to BreatheWish.",
  },
  {
    icon: Cpu,
    title: "AI Scans",
    description: "Our DenseNet-121 model analyzes the image, producing a confidence score and Grad-CAM heatmap.",
  },
  {
    icon: ShieldCheck,
    title: "Doctor Verifies",
    description: "A qualified doctor reviews the AI findings and issues a verified prescription. Always human in the loop.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-5xl mx-auto px-6">
        <motion.h2
          className="text-3xl font-bold text-text-primary text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          How BreatheWish Works
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-doctor-accent/20 to-primary/20 border border-doctor-accent/30 flex items-center justify-center mx-auto mb-5">
                <step.icon className="w-7 h-7 text-doctor-accent" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-doctor-accent/20 text-doctor-accent text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <h3 className="text-lg font-semibold text-text-primary">{step.title}</h3>
              </div>
              <p className="text-text-muted text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
