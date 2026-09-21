"use client";

import React from "react";

export type CaseStatus =
  | "uploaded"
  | "under_review"
  | "prescription_draft"
  | "second_opinion_requested"
  | "second_opinion_received"
  | "verified"
  | "closed"
  | "pending"
  | "in_review"
  | "completed";

interface Props {
  status: CaseStatus;
}

const STATUS_STEP_MAP: Record<CaseStatus, number> = {
  uploaded: 0,
  pending: 0,
  under_review: 1,
  in_review: 1,
  prescription_draft: 2,
  second_opinion_requested: 1,
  second_opinion_received: 1,
  verified: 3,
  closed: 3,
  completed: 3,
};

const STEPS = [
  { label: "Uploaded", description: "Image received" },
  { label: "Reviewing", description: "Doctor review" },
  { label: "Prescription", description: "Care plan ready" },
  { label: "Verified", description: "Confirmed" },
];

export default function CaseStatusStepper({ status }: Props) {
  const activeStep = STATUS_STEP_MAP[status] ?? 0;

  return (
    <div className="flex items-center justify-between w-full px-1" role="list" aria-label="Case progress">
      {STEPS.map((step, idx) => {
        const completed = idx < activeStep;
        const active = idx === activeStep;

        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center flex-shrink-0" role="listitem">
              {completed ? (
                <div className="w-7 h-7 rounded-full bg-patient-accent flex items-center justify-center text-white shadow-xs">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
              ) : active ? (
                <div className="w-7 h-7 rounded-full border-2 border-patient-accent bg-patient-surface flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-patient-accent animate-pulse" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-patient-bg border border-patient-border flex items-center justify-center">
                  <span className="text-[10px] font-mono tabular text-text-dark-muted">{idx + 1}</span>
                </div>
              )}
              <p
                className={`text-[11px] font-medium mt-1.5 text-center max-w-[64px] leading-tight ${
                  completed || active ? "text-text-dark font-semibold" : "text-text-dark-muted"
                }`}
              >
                {step.label}
              </p>
              <p className="text-[10px] text-text-dark-muted/80 text-center max-w-[64px] leading-tight hidden sm:block">
                {step.description}
              </p>
            </div>

            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                  idx < activeStep ? "bg-patient-accent" : "bg-patient-border"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
