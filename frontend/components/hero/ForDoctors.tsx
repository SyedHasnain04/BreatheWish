"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const benefits = [
  {
    title: "Severity-sorted queue",
    description:
      "Cases are ranked by AI-detected severity, so the ones most likely to need you are at the top.",
  },
  {
    title: "A pre-read before you open the case",
    description:
      "DenseNet-121 gives a confidence score and a preliminary finding. Treat it as a second reader, not a verdict.",
  },
  {
    title: "Grad-CAM heatmap",
    description:
      "An overlay shows which lung regions drove the result, so you can check it against what you see.",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function ForDoctors() {
  return (
    <section id="doctors" className="py-28 lg:py-36 bg-background scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
        {/* Mirrored to the patient section: list left, copy right */}
        <ul className="lg:col-span-6 divide-y divide-border border-y border-border self-center order-2 lg:order-1">
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

        <motion.div
          className="lg:col-span-5 lg:col-start-8 order-1 lg:order-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-doctor-accent mb-4">
            For doctors
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-text-primary leading-[1.1] mb-5">
            The final call is yours
          </h2>
          <p className="text-text-muted max-w-[44ch] mb-9 leading-relaxed">
            BreatheWish speeds up triage. You confirm, correct or overrule every finding before a
            patient sees it.
          </p>
          <Link href="/login" className="btn-primary">
            Doctor log in
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
