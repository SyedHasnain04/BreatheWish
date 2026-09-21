"use client";

import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    title: "Upload the X-ray",
    description:
      "A patient or a doctor uploads a chest X-ray from a phone or a computer. Files are stored privately.",
  },
  {
    title: "The model reads it",
    description:
      "DenseNet-121 returns a confidence score and a Grad-CAM heatmap showing which regions drove the result.",
  },
  {
    title: "A doctor reviews it",
    description:
      "A qualified doctor checks the AI read against the image, then signs off or overrides it and writes the prescription.",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 lg:py-36 bg-background scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
        <motion.div
          className="lg:col-span-4 lg:sticky lg:top-28 self-start"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-doctor-accent mb-4">
            How it works
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-text-primary leading-[1.1]">
            Three steps, one of them human
          </h2>
        </motion.div>

        <ol className="lg:col-span-7 lg:col-start-6 divide-y divide-border border-y border-border">
          {steps.map((step, i) => (
            <motion.li
              key={step.title}
              className="grid grid-cols-[3.5rem_1fr] gap-4 py-9"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease }}
            >
              <span className="font-mono text-sm text-text-muted tabular pt-1">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xl font-medium text-text-primary mb-2">{step.title}</h3>
                <p className="text-text-muted leading-relaxed max-w-[56ch]">{step.description}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
