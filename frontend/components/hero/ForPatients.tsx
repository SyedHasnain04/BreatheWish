"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const benefits = [
  {
    title: "Upload from anywhere",
    description:
      "Send your chest X-ray from a phone or a computer. No hospital visit is needed for the first read.",
  },
  {
    title: "Results in plain language",
    description:
      "Your findings are written without the jargon, with clear next steps and a follow-up date.",
  },
  {
    title: "A doctor signs off first",
    description:
      "An AI finding is never sent straight to you. A qualified doctor reviews it and verifies it before you see it.",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function ForPatients() {
  return (
    <section id="patients" className="relative py-28 lg:py-36 bg-surface border-y border-border scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-doctor-accent mb-4">
            For patients
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-text-primary leading-[1.1] mb-5">
            Your scan, explained
          </h2>
          <p className="text-text-muted max-w-[44ch] mb-9 leading-relaxed">
            Pneumonia screening you can start from home, and always backed by a real doctor.
          </p>
          <Link href="/login" className="btn-primary">
            Register as a patient
          </Link>
        </motion.div>

        <ul className="lg:col-span-6 lg:col-start-7 divide-y divide-border border-y border-border self-center">
          {benefits.map((b, i) => (
            <motion.li
              key={b.title}
              className="py-7"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease }}
            >
              <h3 className="text-lg font-medium text-text-primary mb-1.5">{b.title}</h3>
              <p className="text-text-muted leading-relaxed max-w-[52ch]">{b.description}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
