import React from "react";

const stats = [
  "DenseNet-121",
  "112,000+ X-rays",
  "Human verified",
  "Grad-CAM explainability",
];

export default function StatStrip() {
  return (
    <section className="py-6 bg-surface border-y border-border">
      <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {stats.map((stat, i) => (
          <span key={i} className="flex items-center gap-6">
            <span className="text-sm font-mono text-text-muted tracking-wide">{stat}</span>
            {i < stats.length - 1 && (
              <span className="w-1 h-1 rounded-full bg-text-muted"></span>
            )}
          </span>
        ))}
      </div>
    </section>
  );
}
