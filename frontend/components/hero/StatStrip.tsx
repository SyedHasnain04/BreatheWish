import React from "react";

const stats = [
  { k: "Model", v: "DenseNet-121" },
  { k: "Training set", v: "112,000+ X-rays" },
  { k: "Review", v: "Every case, by a doctor" },
  { k: "Explainability", v: "Grad-CAM heatmaps" },
];

export default function StatStrip() {
  return (
    <section aria-label="Technical summary" className="border-y border-border bg-surface">
      <dl className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
        {stats.map((s) => (
          <div key={s.k} className="py-6 px-4 first:pl-0 lg:px-8 lg:first:pl-0">
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
              {s.k}
            </dt>
            <dd className="mt-1.5 text-sm text-text-primary tabular">{s.v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
