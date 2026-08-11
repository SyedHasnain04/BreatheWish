"use client";

import React, { useState, useEffect } from "react";

interface Props {
  caseId: string;
  caseData: any;
  currentDoctorId: string;
  primaryDoctorId: string;
  isSecondDoctor?: boolean;
}

export default function SecondOpinionPanel({ caseId, caseData, currentDoctorId, primaryDoctorId, isSecondDoctor = false }: Props) {
  const [so, setSo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [specialty, setSpecialty] = useState("cardiology");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // For second doctor verdict
  const [agreesWithPrimary, setAgreesWithPrimary] = useState<boolean | null>(null);
  const [verdictNotes, setVerdictNotes] = useState("");
  const [verdict, setVerdict] = useState("agree");

  useEffect(() => {
    const fetchSO = async () => {
      try {
        const res = await fetch(`/api/proxy/second-opinion/${caseId}`);
        if (res.ok) setSo(await res.json());
      } catch {}
      setLoading(false);
    };
    fetchSO();
  }, [caseId]);

  const requestSecondOpinion = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/proxy/second-opinion/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_id: caseId, requested_by: "doctor", reason, specialty_requested: specialty })
      });
      if (res.ok) {
        const data = await res.json();
        setSo({ id: data.id, status: "pending", reason });
        setExpanded(false);
      }
    } catch {}
    setSubmitting(false);
  };

  const submitVerdict = async () => {
    if (agreesWithPrimary === null || !so) return;
    setSubmitting(true);
    try {
      await fetch(`/api/proxy/second-opinion/${so.id}/verdict`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verdict, verdict_notes: verdictNotes, agrees_with_primary: agreesWithPrimary })
      });
      setSo({ ...so, status: "submitted", agrees_with_primary: agreesWithPrimary });
    } catch {}
    setSubmitting(false);
  };

  if (loading) return null;

  // === Second doctor view ===
  if (isSecondDoctor && so) {
    if (so.status === "submitted") {
      return (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-text-primary mb-2">Second Opinion — Submitted</h3>
          <p className="text-sm text-text-secondary">
            You {so.agrees_with_primary ? "agreed with" : "disagreed with"} the primary doctor.
          </p>
          {so.verdict_notes && <p className="mt-2 text-sm text-text-muted italic">{so.verdict_notes}</p>}
        </div>
      );
    }

    return (
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-text-primary mb-1">Second Opinion Requested</h3>
        <p className="text-sm text-text-muted mb-4">Reason: {so.reason}</p>

        <div className="mb-4">
          <p className="text-sm font-medium text-text-secondary mb-2">Do you agree with the primary doctor?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setAgreesWithPrimary(true)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                agreesWithPrimary === true ? "bg-emerald-500 text-white border-emerald-500" : "border-border text-text-secondary hover:border-emerald-400"
              }`}
            >
              Yes — Agree
            </button>
            <button
              onClick={() => setAgreesWithPrimary(false)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                agreesWithPrimary === false ? "bg-amber-500 text-white border-amber-500" : "border-border text-text-secondary hover:border-amber-400"
              }`}
            >
              No — Differ
            </button>
          </div>
        </div>

        <textarea
          value={verdictNotes}
          onChange={(e) => setVerdictNotes(e.target.value)}
          placeholder="Verdict notes (optional)..."
          className="w-full h-20 bg-[#1E293B] border border-border rounded-lg p-3 text-sm mb-4"
        />

        <button
          onClick={submitVerdict}
          disabled={submitting || agreesWithPrimary === null}
          className="bg-doctor-accent text-white px-6 py-2 rounded-lg font-semibold text-sm disabled:opacity-50 hover:bg-sky-500 transition-colors"
        >
          {submitting ? "Submitting..." : "Submit Verdict"}
        </button>
      </div>
    );
  }

  // === Primary doctor view ===
  if (so) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-text-primary mb-1">Second Opinion</h3>
        <div className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full ${
          so.status === "submitted"
            ? so.agrees_with_primary
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-amber-500/10 text-amber-400"
            : "bg-[#1E293B] text-text-muted"
        }`}>
          {so.status === "pending" ? "Pending review" :
           so.agrees_with_primary ? "Agreed by second doctor" : "Differs — see notes"}
        </div>
        {so.status === "submitted" && so.verdict_notes && (
          <p className="mt-3 text-sm text-text-secondary italic">{so.verdict_notes}</p>
        )}
      </div>
    );
  }

  // No second opinion yet — request form for primary doctor
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex justify-between items-center px-6 py-4 text-left"
      >
        <span className="font-semibold text-text-primary">Request Second Opinion</span>
        <span className="text-text-muted text-xl leading-none">{expanded ? "−" : "+"}</span>
      </button>
      {expanded && (
        <div className="px-6 pb-6 border-t border-border space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Specialty</label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full bg-[#1E293B] border border-border rounded-lg px-3 py-2 text-sm"
            >
              <option value="pulmonology">Pulmonology</option>
              <option value="cardiology">Cardiology</option>
              <option value="radiology">Radiology</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you requesting a second opinion?"
              className="w-full h-20 bg-[#1E293B] border border-border rounded-lg p-3 text-sm"
            />
          </div>
          <button
            onClick={requestSecondOpinion}
            disabled={submitting || !reason.trim()}
            className="bg-doctor-accent text-white px-5 py-2 rounded-lg font-semibold text-sm disabled:opacity-50 hover:bg-sky-500 transition-colors"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      )}
    </div>
  );
}
