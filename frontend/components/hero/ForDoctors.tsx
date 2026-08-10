"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const benefits = [
  {
    icon: "📋",
    title: "Severity-sorted queue",
    description: "Cases automatically ranked by AI-detected severity. Attend to the most critical patients first.",
  },
  {
    icon: "🧠",
    title: "AI pre-analysis",
    description: "DenseNet-121 provides confidence scores and preliminary findings before you even open the case.",
  },
  {
    icon: "🔥",
    title: "Grad-CAM heatmap",
    description: "Visual overlay showing exactly which lung regions triggered the AI's detection. Transparent and explainable.",
  },
];

export default function ForDoctors() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-doctor-accent font-semibold text-sm uppercase tracking-wider">For Doctors</span>
          <h2 className="text-3xl font-bold text-text-primary mt-3">AI-powered, doctor-controlled</h2>
          <p className="text-text-muted mt-3 max-w-lg mx-auto">
            BreatheWish enhances your diagnostic workflow — you always have the final say.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              className="card-dark text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <div className="text-3xl mb-4">{b.icon}</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">{b.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{b.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/login" className="btn-primary inline-block">
            Doctor Login
          </Link>
        </div>
      </div>
    </section>
  );
}
