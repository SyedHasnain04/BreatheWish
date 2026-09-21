"use client";

import React, { useState, useEffect } from "react";
import type { SecondOpinion } from "@/types";

interface Props {
  caseId: string;
  caseData: unknown;
  currentDoctorId: string;
  primaryDoctorId: string;
  isSecondDoctor?: boolean;
}

const field =
  "w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 transition-colors duration-200 hover:border-text-muted/50 focus:outline-none focus:border-doctor-accent focus:ring-1 focus:ring-doctor-accent";
const label = "block text-sm text-text-muted mb-1.5";
const title = "font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted";

export default function SecondOpinionPanel({
  caseId,
  isSecondDoctor = false,
}: Props) {
  const [so, setSo] = useState<SecondOpinion | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [specialty, setSpecialty] = useState("pulmonology");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [agreesWithPrimary, setAgreesWithPrimary] = useState<boolean | null>(null);
  const [verdictNotes, setVerdictNotes] = useState("");

  useEffect(() => {
    const fetchSO = async () => {
      try {
        const res = await fetch(`/api/proxy/second-opinion/${caseId}`);
        if (res.ok) setSo(await res.json());
      } catch {
        /* no second opinion yet, or the request failed: show the request form */
      }
      setLoading(false);
    };
    fetchSO();
  }, [caseId]);

  const requestSecondOpinion = async () => {
    setError("");
    if (!reason.trim()) {
      setError("Add a short reason for the request.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/proxy/second-opinion/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: caseId,
          requested_by: "doctor",
          reason,
          specialty_requested: specialty,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setSo({ id: data.id, status: "pending", reason });
      setExpanded(false);
    } catch {
      setError("Couldn't send the request. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitVerdict = async () => {
    setError("");
    if (agreesWithPrimary === null || !so) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/proxy/second-opinion/${so.id}/verdict`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verdict: agreesWithPrimary ? "agree" : "disagree",
          verdict_notes: verdictNotes,
          agrees_with_primary: agreesWithPrimary,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSo({ ...so, status: "submitted", agrees_with_primary: agreesWithPrimary });
    } catch {
      setError("Couldn't submit your verdict. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  const errorBox = error && (
    <p role="alert" className="text-sm text-severe-soft bg-severe-bg border border-severe/30 rounded-lg px-3.5 py-2.5">
      {error}
    </p>
  );

  // Second doctor
  if (isSecondDoctor && so) {
    if (so.status === "submitted") {
      return (
        <section className="card-dark">
          <h2 className={`${title} mb-3`}>Second opinion · submitted</h2>
          <p className="text-sm text-text-primary">
            You {so.agrees_with_primary ? "agreed with" : "disagreed with"} the primary doctor.
          </p>
          {so.verdict_notes && <p className="mt-2 text-sm text-text-muted">{so.verdict_notes}</p>}
        </section>
      );
    }

    return (
      <section className="card-dark space-y-5">
        <div>
          <h2 className={`${title} mb-2`}>Second opinion requested</h2>
          <p className="text-sm text-text-muted">Reason: {so.reason}</p>
        </div>

        <fieldset>
          <legend className="text-sm text-text-primary mb-2">Do you agree with the primary doctor?</legend>
          <div className="flex gap-3">
            {[
              { v: true, l: "Agree" },
              { v: false, l: "Disagree" },
            ].map((o) => (
              <button
                key={o.l}
                type="button"
                aria-pressed={agreesWithPrimary === o.v}
                onClick={() => setAgreesWithPrimary(o.v)}
                className={`px-5 py-2 rounded-lg text-sm font-medium border transition-colors duration-200 ${
                  agreesWithPrimary === o.v
                    ? "bg-doctor-accent text-background border-doctor-accent"
                    : "border-border text-text-muted hover:text-text-primary hover:border-text-muted/60"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="so-notes" className={label}>
            Notes (optional)
          </label>
          <textarea
            id="so-notes"
            value={verdictNotes}
            onChange={(e) => setVerdictNotes(e.target.value)}
            className={`${field} h-20 resize-y`}
          />
        </div>
        {errorBox}
        <button
          type="button"
          onClick={submitVerdict}
          disabled={submitting || agreesWithPrimary === null}
          className="btn-primary text-sm !py-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          {submitting ? "Submitting…" : "Submit verdict"}
        </button>
      </section>
    );
  }

  // Primary doctor, request exists
  if (so) {
    return (
      <section className="card-dark">
        <h2 className={`${title} mb-3`}>Second opinion</h2>
        <span
          className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-md border ${
            so.status === "submitted"
              ? so.agrees_with_primary
                ? "bg-mild-bg text-mild-soft border-mild/30"
                : "bg-moderate-bg text-moderate-soft border-moderate/30"
              : "bg-surface-raised text-text-muted border-border"
          }`}
        >
          {so.status === "pending"
            ? "Pending review"
            : so.agrees_with_primary
            ? "Second doctor agrees"
            : "Second doctor differs"}
        </span>
        {so.status === "submitted" && so.verdict_notes && (
          <p className="mt-3 text-sm text-text-muted">{so.verdict_notes}</p>
        )}
      </section>
    );
  }

  // No request yet
  return (
    <section className="card-dark !p-0 overflow-hidden">
      <h2>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls="so-form"
          className="w-full flex justify-between items-center px-6 py-4 text-left text-text-primary font-medium"
        >
          Request a second opinion
          <svg
            className={`w-4 h-4 text-doctor-accent transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </h2>
      {expanded && (
        <div id="so-form" className="px-6 pb-6 border-t border-border space-y-4 pt-5">
          <div>
            <label htmlFor="so-specialty" className={label}>
              Specialty
            </label>
            <select
              id="so-specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className={field}
            >
              {[
                "pulmonology",
                "radiology",
                "cardiology",
                "infectious-disease",
                "general-medicine",
              ].map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s.replace(/-/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="so-reason" className={label}>
              Reason
            </label>
            <textarea
              id="so-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`${field} h-20 resize-y`}
            />
          </div>
          {errorBox}
          <button
            type="button"
            onClick={requestSecondOpinion}
            disabled={submitting}
            className="btn-primary text-sm !py-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting ? "Sending…" : "Send request"}
          </button>
        </div>
      )}
    </section>
  );
}
