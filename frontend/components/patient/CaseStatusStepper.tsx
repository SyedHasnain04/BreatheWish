"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

type CaseStatus = 
  | "uploaded" | "under_review" | "prescription_draft"
  | "second_opinion_requested" | "second_opinion_received"
  | "verified" | "closed";

interface Props {
  status: CaseStatus;
}

const STATUS_STEP_MAP: Record<CaseStatus, number> = {
  "uploaded": 0,
  "under_review": 1,
  "prescription_draft": 2,
  "second_opinion_requested": 1,
  "second_opinion_received": 1,
  "verified": 3,
  "closed": 3,
};

const STEPS = [
  { label: "Uploaded", description: "X-ray received" },
  { label: "Under Review", description: "Doctor reviewing" },
  { label: "Prescription Ready", description: "Draft prepared" },
  { label: "Verified", description: "Doctor confirmed" },
];

export default function CaseStatusStepper({ status }: Props) {
  const activeStep = STATUS_STEP_MAP[status] ?? 0;

  return (
    <div className="flex items-center justify-between w-full px-2">
      {STEPS.map((step, idx) => {
        const completed = idx < activeStep;
        const active = idx === activeStep;

        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center flex-shrink-0">
              {completed ? (
                <div className="w-9 h-9 rounded-full bg-patient-accent flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              ) : active ? (
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-9 h-9 rounded-full bg-patient-accent border-4 border-white shadow-lg shadow-patient-accent/40"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-200 border-2 border-gray-300" />
              )}
              <p className={`text-xs font-semibold mt-2 text-center max-w-[70px] leading-tight ${
                completed || active ? "text-patient-accent" : "text-gray-400"
              }`}>{step.label}</p>
              <p className="text-[10px] text-gray-400 text-center max-w-[70px] leading-tight">{step.description}</p>
            </div>

            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-1 mx-1 rounded-full transition-colors ${
                idx < activeStep ? "bg-patient-accent" : "bg-gray-200"
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
