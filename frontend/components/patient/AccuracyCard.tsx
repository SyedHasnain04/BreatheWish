"use client";

import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

type Verdict = "pneumonia" | "no_pneumonia" | "inconclusive";
type Severity = "severe" | "moderate" | "mild" | "none";

interface CaseSummary {
  status?: string;
  doctorVerdict?: Verdict;
  doctor_verdict?: Verdict;
  doctorSeverity?: Severity;
  doctor_severity?: Severity;
}

export default function AccuracyCard({ cases }: { cases: CaseSummary[] }) {
  const verified = cases.filter((c) => c.status === "verified" && getVerdict(c));
  if (verified.length === 0) return null;

  const latest = verified[0];
  const latestVerdict = getVerdict(latest);
  const latestSeverity = getSeverity(latest);
  const counts = {
    pneumonia: verified.filter((c) => getVerdict(c) === "pneumonia").length,
    normal: verified.filter((c) => getVerdict(c) === "no_pneumonia").length,
    inconclusive: verified.filter((c) => getVerdict(c) === "inconclusive").length,
  };

  const severityCounts = [
    { name: "Severe", value: verified.filter((c) => getSeverity(c) === "severe").length, color: "#9B382F" },
    { name: "Moderate", value: verified.filter((c) => getSeverity(c) === "moderate").length, color: "#9E6627" },
    { name: "Mild", value: verified.filter((c) => getSeverity(c) === "mild").length, color: "#3B7A57" },
    { name: "Normal", value: counts.normal, color: "#317269" },
  ].filter((d) => d.value > 0);

  return (
    <section className="bg-patient-surface border border-patient-border rounded-xl p-5 md:p-6 mt-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-text-dark text-base">Health & Case Summary</h3>
        <span className="text-xs text-text-dark-muted font-mono tabular">
          {verified.length} verified {verified.length === 1 ? "case" : "cases"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="space-y-2">
          <p className="text-text-dark-muted text-xs uppercase tracking-wider font-semibold mb-2">
            Overview
          </p>
          {[
            { label: "Verified Cases", value: verified.length },
            { label: "Pneumonia Confirmed", value: counts.pneumonia },
            { label: "Normal Findings", value: counts.normal },
            { label: "Inconclusive", value: counts.inconclusive },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between p-2.5 bg-patient-bg rounded-lg border border-patient-border"
            >
              <span className="text-text-dark-muted text-xs font-medium">{s.label}</span>
              <span className="font-semibold font-mono tabular text-text-dark text-sm">
                {s.value}
              </span>
            </div>
          ))}
        </div>

        <div>
          <p className="text-text-dark-muted text-xs uppercase tracking-wider font-semibold mb-2">
            Findings Distribution
          </p>
          {severityCounts.length > 0 ? (
            <div className="bg-patient-bg border border-patient-border rounded-lg p-3">
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={severityCounts} barSize={22}>
                  <XAxis dataKey="name" tick={{ fill: "#536460", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#536460", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #DDE5E3",
                      borderRadius: "6px",
                      color: "#121A18",
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  />
                  <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                    {severityCounts.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-text-dark-muted text-xs text-center py-8">No distribution data</p>
          )}
        </div>

        <div>
          <p className="text-text-dark-muted text-xs uppercase tracking-wider font-semibold mb-2">
            Latest Physician Verdict
          </p>
          {latestVerdict ? (
            <div
              className={`p-4 rounded-lg border text-xs leading-relaxed ${
                latestVerdict === "pneumonia"
                  ? "bg-severe-bg border-severe/30 text-text-dark"
                  : latestVerdict === "no_pneumonia"
                  ? "bg-verified-bg border-verified/30 text-text-dark"
                  : "bg-moderate-bg border-moderate/30 text-text-dark"
              }`}
            >
              <p className="text-text-dark-muted text-[11px] uppercase tracking-wider font-medium mb-1">
                Latest diagnosis
              </p>
              <p className="font-semibold text-sm">
                {latestVerdict === "pneumonia"
                  ? `Pneumonia confirmed (${latestSeverity || "severity pending"})`
                  : latestVerdict === "no_pneumonia"
                  ? "No pneumonia detected"
                  : "Inconclusive diagnosis"}
              </p>
              <p className="text-text-dark-muted text-[11px] mt-2">
                Always review your full prescription notes and consult with your attending doctor.
              </p>
            </div>
          ) : (
            <p className="text-text-dark-muted text-xs">No reviewed cases available yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function getVerdict(c: CaseSummary) {
  return c.doctorVerdict ?? c.doctor_verdict;
}

function getSeverity(c: CaseSummary) {
  return c.doctorSeverity ?? c.doctor_severity;
}
