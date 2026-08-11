"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

interface PrescriptionData {
  id: string;
  is_verified: boolean;
  verified_at: string | null;
  final_prescription: {
    medications?: Medication[];
    generalAdvice?: string;
    followUpNotes?: string;
    draft?: string;
  };
  doctor_name?: string;
}

interface Props {
  prescription: PrescriptionData | null;
}

export default function PrescriptionCard({ prescription }: Props) {
  // Hard rule: never render if not verified
  if (!prescription || !prescription.is_verified) return null;

  const { final_prescription, verified_at, doctor_name } = prescription;
  const medications: Medication[] = final_prescription?.medications || [];
  const generalAdvice = final_prescription?.generalAdvice || "";
  const followUpNotes = final_prescription?.followUpNotes || "";
  const draft = final_prescription?.draft || "";

  return (
    <div className="bg-white border border-patient-border rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-patient-accent px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-white" />
          <span className="font-semibold text-white text-lg">Your Prescription</span>
        </div>
        <div className="text-right">
          <p className="text-white/90 text-sm font-medium">{doctor_name ? `Dr. ${doctor_name}` : "Your Doctor"}</p>
          {verified_at && (
            <p className="text-white/70 text-xs">{new Date(verified_at).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Medications */}
        {medications.length > 0 ? (
          <div>
            <h4 className="text-sm font-semibold text-text-dark uppercase tracking-wider mb-3">Medications</h4>
            <div className="space-y-3">
              {medications.map((med, idx) => (
                <div key={idx} className="bg-patient-bg border border-patient-border rounded-lg p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <span className="font-semibold text-text-dark">{med.name || "—"}</span>
                    <span className="text-sm text-patient-accent font-medium">{med.dosage}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-text-dark-muted">
                    {med.frequency && <span>{med.frequency}</span>}
                    {med.duration && <span>· {med.duration}</span>}
                  </div>
                  {med.notes && (
                    <p className="mt-1 text-xs text-gray-500 italic">{med.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : draft ? (
          <div>
            <h4 className="text-sm font-semibold text-text-dark uppercase tracking-wider mb-3">Prescription</h4>
            <div className="bg-patient-bg border border-patient-border rounded-lg p-4 text-sm whitespace-pre-wrap text-text-dark">
              {draft}
            </div>
          </div>
        ) : null}

        {/* General Advice */}
        {generalAdvice && (
          <div>
            <h4 className="text-sm font-semibold text-text-dark uppercase tracking-wider mb-2">General Advice</h4>
            <p className="text-sm text-text-dark-muted bg-patient-bg border border-patient-border rounded-lg p-4">{generalAdvice}</p>
          </div>
        )}

        {/* Follow-up */}
        {followUpNotes && (
          <div>
            <h4 className="text-sm font-semibold text-text-dark uppercase tracking-wider mb-2">Follow-up</h4>
            <p className="text-sm text-text-dark-muted bg-patient-bg border border-patient-border rounded-lg p-4">{followUpNotes}</p>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 text-center border-t border-patient-border pt-4">
          AI assisted — reviewed and verified by your doctor. Do not self-medicate. Contact your doctor with any concerns.
        </p>
      </div>
    </div>
  );
}
