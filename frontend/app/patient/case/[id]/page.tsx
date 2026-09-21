"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { CaseDetail, SecondOpinion, SessionUser } from "@/types";
import CaseStatusStepper, { type CaseStatus } from "@/components/patient/CaseStatusStepper";
import PrescriptionCard, { type PrescriptionData } from "@/components/patient/PrescriptionCard";
import ConsultationThread from "@/components/patient/ConsultationThread";
import PortalHeader from "@/components/shared/PortalHeader";
import { Bar, InlineError } from "@/components/shared/Skeleton";

const field =
  "w-full bg-white border border-patient-border rounded-lg px-3.5 py-2.5 text-sm text-text-dark placeholder:text-text-dark-muted/60 transition-colors duration-200 hover:border-text-dark-muted/50 focus:outline-none focus:border-patient-accent focus:ring-1 focus:ring-patient-accent";

export default function PatientCasePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [prescription, setPrescription] = useState<PrescriptionData | null>(null);
  const [secondOpinion, setSecondOpinion] = useState<SecondOpinion | null>(null);
  const [soReason, setSoReason] = useState("");
  const [soExpanded, setSoExpanded] = useState(false);
  const [submittingSo, setSubmittingSo] = useState(false);
  const [soSubmitted, setSoSubmitted] = useState(false);
  const [soError, setSoError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"none" | "notfound" | "failed">("none");

  const currentUser = session?.user as SessionUser | undefined;

  const load = useCallback(async () => {
    setLoading(true);
    setError("none");
    try {
      const caseRes = await fetch(`/api/proxy/cases/${id}`);
      if (caseRes.status === 404 || caseRes.status === 403) {
        setError("notfound");
        return;
      }
      if (!caseRes.ok) throw new Error(String(caseRes.status));
      const data = await caseRes.json();
      setCaseData(data);

      if (data.status === "verified" || data.status === "closed") {
        const rxRes = await fetch(`/api/proxy/prescriptions/${id}`);
        if (rxRes.ok) setPrescription(await rxRes.json());
      }

      const soRes = await fetch(`/api/proxy/second-opinion/${id}`);
      if (soRes.ok) {
        const soData = await soRes.json();
        setSecondOpinion(soData);
        if (soData) setSoSubmitted(true);
      }
    } catch {
      setError("failed");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const submitSecondOpinion = async () => {
    setSoError("");
    if (!soReason.trim()) {
      setSoError("Tell us briefly why you'd like a second opinion.");
      return;
    }
    setSubmittingSo(true);
    try {
      const res = await fetch(`/api/proxy/second-opinion/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: id,
          requested_by: "patient",
          reason: soReason,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSoSubmitted(true);
      setSoExpanded(false);
    } catch {
      setSoError("We couldn't send your request. Please try again.");
    } finally {
      setSubmittingSo(false);
    }
  };

  const shortId = id.split("-")[0].toUpperCase();
  const isVerified =
    caseData && (caseData.status === "verified" || caseData.status === "closed");
  const canRequestSo = isVerified && !soSubmitted;

  return (
    <div className="min-h-[100dvh] bg-patient-bg text-text-dark" data-theme="patient">
      <PortalHeader
        portal="patient"
        current={`Case #${shortId}`}
        backHref="/patient/dashboard"
        backLabel="My cases"
      />

      <main id="main" className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {loading ? (
          <div aria-busy="true" className="space-y-6">
            <Bar light className="h-8 w-56" />
            <Bar light className="h-32 w-full !rounded-2xl" />
            <Bar light className="h-48 w-full !rounded-2xl" />
          </div>
        ) : error === "failed" ? (
          <InlineError light message="Couldn't load this case." onRetry={load} />
        ) : error === "notfound" || !caseData ? (
          <div className="py-16">
            <h1 className="text-2xl font-semibold mb-2">Case not found</h1>
            <p className="text-text-dark-muted mb-6">
              It may have been removed, or it may belong to another account.
            </p>
            <Link href="/patient/dashboard" className="btn-primary">
              Back to my cases
            </Link>
          </div>
        ) : (
          <>
            <div>
              <p className="text-xs text-text-dark-muted font-mono tabular">
                Case #{shortId}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-text-dark mt-1 tabular">
                {new Date(caseData.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h1>
            </div>

            <section className="card-light" aria-label="Case progress">
              <CaseStatusStepper status={caseData.status as CaseStatus} />
            </section>

            {!isVerified && (
              <div
                role="status"
                className="rounded-2xl border border-patient-border bg-patient-surface px-6 py-5"
              >
                <h2 className="font-medium text-text-dark mb-1">
                  A doctor is reviewing your X-ray
                </h2>
                <p className="text-sm text-text-dark-muted max-w-[60ch]">
                  You&apos;ll see your result and any prescription here once the doctor has checked
                  and signed it off. We don&apos;t show automated findings before then.
                </p>
              </div>
            )}

            {prescription && <PrescriptionCard prescription={prescription} />}

            {soSubmitted && secondOpinion && (
              <section
                className={`rounded-2xl border p-5 ${
                  secondOpinion.agrees_with_primary === true
                    ? "bg-mild-soft/10 border-mild/30"
                    : secondOpinion.agrees_with_primary === false
                    ? "bg-moderate-soft/10 border-moderate/30"
                    : "bg-patient-surface border-patient-border"
                }`}
              >
                <h2 className="font-medium text-text-dark mb-1">Second opinion</h2>
                {secondOpinion.status === "pending" && (
                  <p className="text-sm text-text-dark-muted">
                    Requested. Waiting for another doctor to review.
                  </p>
                )}
                {secondOpinion.status === "submitted" &&
                  secondOpinion.agrees_with_primary === true && (
                    <p className="text-sm text-text-dark">
                      The second doctor agrees with the first.
                    </p>
                  )}
                {secondOpinion.status === "submitted" &&
                  secondOpinion.agrees_with_primary === false && (
                    <p className="text-sm text-text-dark">
                      The second doctor&apos;s view differs. Your primary doctor&apos;s assessment
                      has been applied.
                    </p>
                  )}
              </section>
            )}

            {canRequestSo && (
              <section className="card-light !p-0 overflow-hidden">
                <h2>
                  <button
                    onClick={() => setSoExpanded(!soExpanded)}
                    aria-expanded={soExpanded}
                    aria-controls="so-panel"
                    className="w-full flex justify-between items-center px-6 py-4 text-left font-medium text-text-dark"
                  >
                    Request a second opinion
                    <svg
                      className={`w-4 h-4 text-patient-accent transition-transform duration-200 ${
                        soExpanded ? "rotate-180" : ""
                      }`}
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
                {soExpanded && (
                  <div
                    id="so-panel"
                    className="px-6 pb-6 border-t border-patient-border pt-5"
                  >
                    <label
                      htmlFor="so-reason"
                      className="block text-sm text-text-dark-muted mb-2"
                    >
                      Why would you like a second opinion?
                    </label>
                    <textarea
                      id="so-reason"
                      value={soReason}
                      onChange={(e) => setSoReason(e.target.value)}
                      aria-invalid={!!soError}
                      className={`${field} h-24 resize-y`}
                    />
                    {soError && (
                      <p role="alert" className="text-sm text-severe mt-2">
                        {soError}
                      </p>
                    )}
                    <button
                      onClick={submitSecondOpinion}
                      disabled={submittingSo}
                      className="btn-primary text-sm !py-2 mt-4 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {submittingSo ? "Sending…" : "Send request"}
                    </button>
                  </div>
                )}
              </section>
            )}

            {currentUser && (
              <section
                className="card-light !p-0 overflow-hidden"
                aria-labelledby="ask"
              >
                <h2
                  id="ask"
                  className="font-medium text-text-dark px-6 py-4 border-b border-patient-border"
                >
                  Ask your doctor
                </h2>
                <div className="p-4">
                  <ConsultationThread
                    caseId={id}
                    currentUserRole="patient"
                    currentUserId={currentUser.id ?? ""}
                  />
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
