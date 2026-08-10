"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const benefits = [
  {
    emoji: "📱",
    title: "Upload from anywhere",
    description: "Securely upload your chest X-ray from your phone or computer. No hospital visit needed for the initial scan.",
  },
  {
    emoji: "🌿",
    title: "Calm, clear results",
    description: "No confusing medical jargon. Your results are presented in simple, easy-to-understand language.",
  },
  {
    emoji: "✅",
    title: "Doctor verified, always",
    description: "Every AI finding is reviewed and verified by a qualified doctor before you see it. Your safety comes first.",
  },
];

export default function ForPatients() {
  return (
    <section className="py-24 bg-patient-bg">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-patient-accent font-semibold text-sm uppercase tracking-wider">For Patients</span>
          <h2 className="text-3xl font-bold text-text-dark mt-3">Your health, simplified</h2>
          <p className="text-text-dark-muted mt-3 max-w-lg mx-auto">
            BreatheWish makes pneumonia screening accessible, understandable, and always backed by real doctors.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              className="card-light text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <div className="text-3xl mb-4">{b.emoji}</div>
              <h3 className="text-lg font-semibold text-text-dark mb-2">{b.title}</h3>
              <p className="text-sm text-text-dark-muted leading-relaxed">{b.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/login" className="inline-block bg-patient-accent hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200">
            Register as Patient
          </Link>
        </div>
      </div>
    </section>
  );
}
