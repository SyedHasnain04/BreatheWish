"use client";

import React from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";

interface Props {
  /** Pneumonia probability, 0 to 100 (softmax class 1 from the model) */
  confidence: number;
  severity: string;
  type: string;
  rawOutput?: unknown;
}

const ACCENT = "#6FB5AC";
const TRACK = "#25333A";

export default function ConfidenceChart({ confidence, severity, type }: Props) {
  const pneumoProb = Math.min(100, Math.max(0, confidence));
  const normalProb = 100 - pneumoProb;
  const sev = (severity || "none").toLowerCase();

  return (
    <section className="card-dark" aria-labelledby="ai-title">
      <h2 id="ai-title" className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted mb-5">
        AI pre-read
      </h2>

      <div className="grid sm:grid-cols-[12rem_1fr] gap-8 items-center">
        <div
          className="w-44 h-44 relative mx-auto"
          role="img"
          aria-label={`Pneumonia probability ${pneumoProb.toFixed(1)} percent`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="82%"
              outerRadius="100%"
              barSize={8}
              data={[{ name: "Probability", value: pneumoProb }]}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                background={{ fill: TRACK }}
                dataKey="value"
                cornerRadius={8}
                fill={ACCENT}
                isAnimationActive
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold font-mono tabular text-text-primary">
              {pneumoProb.toFixed(1)}%
            </span>
            <span className="text-[10px] text-text-muted uppercase tracking-[0.14em] mt-1">Pneumonia</span>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap gap-2 mb-6">
            <span className={`severity-badge-${sev === "none" ? "mild" : sev} uppercase`}>
              {sev === "none" ? "Low" : sev}
            </span>
            {type && type !== "none" && (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-medium tracking-wide uppercase bg-surface-raised text-text-primary border border-border">
                {type}
              </span>
            )}
          </div>

          <div className="space-y-4">
            {[
              { name: "Pneumonia", value: pneumoProb, fill: ACCENT },
              { name: "Normal", value: normalProb, fill: "#4A5D63" },
            ].map((row) => (
              <div key={row.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-text-muted">{row.name}</span>
                  <span className="text-text-primary font-mono tabular">{row.value.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-1000 ease-spring"
                    style={{ width: `${row.value}%`, backgroundColor: row.fill }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-text-muted mt-6 pt-4 border-t border-border max-w-[70ch]">
        Severity and type are bands set from this one probability, not separate model outputs. Use them to sort the
        queue, not to grade the case.
      </p>
    </section>
  );
}
