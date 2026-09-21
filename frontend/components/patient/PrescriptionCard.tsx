"use client";

import React from "react";

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface PrescriptionData {
  id: string;
  case_id?: string;
  is_verified: boolean;
  verified_at?: string | null;
  final_prescription?: unknown;
  doctor_name?: string;
}

interface Props {
  prescription: PrescriptionData | null;
}

export default function PrescriptionCard({ prescription }: Props) {
  if (!prescription || !prescription.is_verified) return null;

  const { final_prescription, verified_at, doctor_name } = prescription;
  // Typecast or extract safe fields
  const safeFinal = (final_prescription || {}) as {
    medications?: Medication[];
    generalAdvice?: string;
    followUpNotes?: string;
    draft?: string;
  };

  const medications = safeFinal?.medications || [];
  const generalAdvice = safeFinal?.generalAdvice || "";
  const followUpNotes = safeFinal?.followUpNotes || "";
  const draft = safeFinal?.draft || "";

  return (
    <section className="bg-patient-surface border border-patient-border rounded-xl shadow-sm overflow-hidden">
      <div className="bg-patient-accent px-5 py-3.5 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <h3 className="font-semibold text-white text-base">Verified Prescription</h3>
        </div>
        <div className="text-right">
          <p className="text-white/95 text-xs font-medium">{doctor_name ? `Dr. ${doctor_name}` : "Attending Physician"}</p>
          {verified_at && (
            <p className="text-white/75 text-[11px] font-mono tabular tracking-tight">
              {new Date(verified_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {medications.length > 0 ? (
          <div>
            <h4 className="text-xs font-semibold text-text-dark uppercase tracking-wider mb-2.5">Prescribed Medications</h4>
            <div className="space-y-2.5">
              {medications.map((med, idx) => (
                <div key={idx} className="bg-patient-bg border border-patient-border rounded-lg p-3.5">
                  <div className="flex flex-wrap justify-between items-baseline gap-2">
                    <span className="font-medium text-text-dark text-sm">{med.name || "—"}</span>
                    <span className="text-xs font-semibold font-mono tabular text-patient-accent">{med.dosage}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-text-dark-muted font-mono tabular">
                    {med.frequency && <span>{med.frequency}</span>}
                    {med.duration && <span>· {med.duration}</span>}
                  </div>
                  {med.notes && <p className="mt-1 text-xs text-text-dark-muted italic">{med.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        ) : draft ? (
          <div>
            <h4 className="text-xs font-semibold text-text-dark uppercase tracking-wider mb-2">Instructions</h4>
            <div className="bg-patient-bg border border-patient-border rounded-lg p-3.5 text-xs whitespace-pre-wrap text-text-dark leading-relaxed">
              {draft}
            </div>
          </div>
        ) : null}

        {generalAdvice && (
          <div>
            <h4 className="text-xs font-semibold text-text-dark uppercase tracking-wider mb-1.5">General Advice</h4>
            <p className="text-xs text-text-dark-muted bg-patient-bg border border-patient-border rounded-lg p-3.5 leading-relaxed">
              {generalAdvice}
            </p>
          </div>
        )}

        {followUpNotes && (
          <div>
            <h4 className="text-xs font-semibold text-text-dark uppercase tracking-wider mb-1.5">Follow-up Notes</h4>
            <p className="text-xs text-text-dark-muted bg-patient-bg border border-patient-border rounded-lg p-3.5 leading-relaxed">
              {followUpNotes}
            </p>
          </div>
        )}

        <p className="text-[11px] text-text-dark-muted text-center border-t border-patient-border pt-4">
          AI assisted — reviewed and verified by your physician. Contact your clinic immediately with any adverse reactions or questions.
        </p>
      </div>
    </section>
  );
}
