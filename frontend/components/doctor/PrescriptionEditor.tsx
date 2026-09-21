"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}

interface Props {
  caseId: string;
  prescriptionId?: string;
  llmDraft: { draft: string };
  isVerified: boolean;
  /** Called after the backend confirms verification, so the page can update */
  onVerified?: () => void;
}

const field =
  "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 transition-colors duration-200 hover:border-text-muted/50 focus:outline-none focus:border-doctor-accent focus:ring-1 focus:ring-doctor-accent";
const sectionLabel = "font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted";
const blank = (id: string): Medication => ({
  id,
  name: "",
  dosage: "",
  frequency: "1x daily",
  duration: "",
  notes: "",
});

export default function PrescriptionEditor({ prescriptionId, llmDraft, isVerified, onVerified }: Props) {
  const [medications, setMedications] = useState<Medication[]>([blank("1")]);
  const [generalAdvice, setGeneralAdvice] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  // Seed the form from the AI draft once
  useEffect(() => {
    if (llmDraft?.draft && !isVerified) {
      const draft = llmDraft.draft;
      const adviceMatch = draft.match(/General Advice:\s*([\s\S]*?)(?=Follow-up:|$)/i);
      if (adviceMatch) setGeneralAdvice(adviceMatch[1].trim().replace(/-/g, "").trim());

      const followUpMatch = draft.match(/Follow-up:\s*([\s\S]*?)$/i);
      if (followUpMatch) setFollowUpNotes(followUpMatch[1].trim().replace(/-/g, "").trim());

      const medsMatch = draft.match(/Medications:\s*([\s\S]*?)(?=General Advice:|$)/i);
      if (medsMatch) {
        const parsed = medsMatch[1]
          .split("\n")
          .filter((l) => l.trim().length > 0)
          .map((line, idx) => ({
            ...blank(`${Date.now()}${idx}`),
            name: line.replace(/^-/, "").trim(),
            frequency: "As directed",
          }));
        if (parsed.length > 0) setMedications(parsed);
      }
    }
  }, [llmDraft, isVerified]);

  const updateMed = (id: string, key: keyof Medication, value: string) =>
    setMedications(medications.map((m) => (m.id === id ? { ...m, [key]: value } : m)));

  /** Returns true only if the backend accepted the save. */
  const saveDraft = async (): Promise<boolean> => {
    if (!prescriptionId) return false;
    setError("");
    setIsSaving(true);
    try {
      const res = await fetch(`/api/proxy/prescriptions/${prescriptionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ final_prescription: { medications, generalAdvice, followUpNotes } }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setLastSaved(new Date());
      return true;
    } catch {
      setError("Couldn't save the draft. Nothing was sent to the patient.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const verifyAndSend = async () => {
    if (!prescriptionId) return;
    // Never verify something that failed to save: the patient would see the old text.
    if (!(await saveDraft())) {
      setConfirming(false);
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/proxy/prescriptions/${prescriptionId}/verify`, { method: "POST" });
      if (!res.ok) throw new Error(String(res.status));
      toast.success("Prescription verified and sent to the patient");
      setConfirming(false);
      onVerified?.();
    } catch {
      setError("Couldn't verify the prescription. It has not been sent.");
      setConfirming(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (isVerified) {
    return (
      <section className="card-dark">
        <p className="verified-badge mb-3">Verified and sent</p>
        <p className="text-text-muted text-sm">This prescription is final and visible to the patient.</p>
      </section>
    );
  }

  return (
    <section
      className="bg-surface border border-border rounded-2xl shadow-card overflow-hidden"
      aria-labelledby="rx-title"
    >
      <div className="px-6 py-4 border-b border-border flex justify-between items-center">
        <h2 id="rx-title" className={sectionLabel}>
          Prescription
        </h2>
        {lastSaved && (
          <span className="text-xs text-text-muted tabular" aria-live="polite">
            Saved {lastSaved.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      <div className="p-6 space-y-7">
        <div className="bg-background p-4 rounded-lg text-sm text-text-muted whitespace-pre-wrap border border-border">
          <span className="text-doctor-accent font-medium block mb-2">
            AI draft. Check every line before sending.
          </span>
          {llmDraft?.draft}
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className={sectionLabel}>Medications</h3>
            <button
              type="button"
              onClick={() => setMedications([...medications, blank(String(Date.now()))])}
              className="text-sm text-doctor-accent hover:underline underline-offset-4"
            >
              Add medication
            </button>
          </div>

          <div className="space-y-3">
            {medications.map((med, idx) => (
              <fieldset
                key={med.id}
                className="grid grid-cols-12 gap-3 bg-surface-raised/50 p-3 rounded-lg border border-border"
              >
                <legend className="sr-only">Medication {idx + 1}</legend>
                <div className="col-span-12 md:col-span-4">
                  <input
                    aria-label={`Medication ${idx + 1} name`}
                    type="text"
                    placeholder="Drug name"
                    value={med.name}
                    onChange={(e) => updateMed(med.id, "name", e.target.value)}
                    className={field}
                  />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <input
                    aria-label={`Medication ${idx + 1} dosage`}
                    type="text"
                    placeholder="Dosage"
                    value={med.dosage}
                    onChange={(e) => updateMed(med.id, "dosage", e.target.value)}
                    className={`${field} tabular`}
                  />
                </div>
                <div className="col-span-6 md:col-span-3">
                  <select
                    aria-label={`Medication ${idx + 1} frequency`}
                    value={med.frequency}
                    onChange={(e) => updateMed(med.id, "frequency", e.target.value)}
                    className={field}
                  >
                    {["1x daily", "2x daily", "3x daily", "As needed", "As directed"].map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-8 md:col-span-2">
                  <input
                    aria-label={`Medication ${idx + 1} duration`}
                    type="text"
                    placeholder="Duration"
                    value={med.duration}
                    onChange={(e) => updateMed(med.id, "duration", e.target.value)}
                    className={`${field} tabular`}
                  />
                </div>
                <div className="col-span-4 md:col-span-1 flex justify-end items-center">
                  <button
                    type="button"
                    onClick={() =>
                      medications.length > 1 &&
                      setMedications(medications.filter((m) => m.id !== med.id))
                    }
                    disabled={medications.length === 1}
                    aria-label={`Remove medication ${idx + 1}`}
                    className="text-sm text-severe-soft hover:underline underline-offset-4 disabled:opacity-30 disabled:no-underline"
                  >
                    Remove
                  </button>
                </div>
                <div className="col-span-12">
                  <input
                    aria-label={`Medication ${idx + 1} instructions`}
                    type="text"
                    placeholder="Extra instructions"
                    value={med.notes}
                    onChange={(e) => updateMed(med.id, "notes", e.target.value)}
                    className={field}
                  />
                </div>
              </fieldset>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="rx-advice" className={`${sectionLabel} block mb-2`}>
            General advice
          </label>
          <textarea
            id="rx-advice"
            value={generalAdvice}
            onChange={(e) => setGeneralAdvice(e.target.value)}
            className={`${field} h-24 resize-y`}
          />
        </div>

        <div>
          <label htmlFor="rx-follow" className={`${sectionLabel} block mb-2`}>
            Follow-up notes
          </label>
          <textarea
            id="rx-follow"
            value={followUpNotes}
            onChange={(e) => setFollowUpNotes(e.target.value)}
            className={`${field} h-16 resize-y`}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="text-sm text-severe-soft bg-severe-bg border border-severe/30 rounded-lg px-3.5 py-2.5"
          >
            {error}
          </p>
        )}
      </div>

      <div className="px-6 py-4 border-t border-border flex flex-wrap justify-between items-center gap-3">
        <button
          type="button"
          onClick={() => saveDraft()}
          disabled={isSaving}
          className="btn-outline-light text-sm !py-2 disabled:opacity-40"
        >
          Save draft
        </button>

        {confirming ? (
          <div className="flex items-center gap-3" role="group" aria-label="Confirm sending">
            <span className="text-sm text-text-muted">The patient will see this.</span>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={isSaving}
              className="text-sm text-text-muted hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={verifyAndSend}
              disabled={isSaving}
              className="btn-primary text-sm !py-2 disabled:opacity-50"
            >
              {isSaving ? "Sending…" : "Confirm and send"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={isSaving}
            className="btn-primary text-sm !py-2 disabled:opacity-50"
          >
            Verify and send to patient
          </button>
        )}
      </div>
    </section>
  );
}
