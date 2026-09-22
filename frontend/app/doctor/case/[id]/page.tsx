"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import XRayViewer from "@/components/doctor/XRayViewer";
import ConfidenceChart from "@/components/doctor/ConfidenceChart";
import PrescriptionEditor from "@/components/doctor/PrescriptionEditor";
import SecondOpinionPanel from "@/components/doctor/SecondOpinionPanel";
import ConsultationThread from "@/components/patient/ConsultationThread";
import PortalHeader from "@/components/shared/PortalHeader";
import { Bar, InlineError } from "@/components/shared/Skeleton";
import Link from "next/link";
import type { CaseDetail, Prescription, SessionUser } from "@/types";

const field =
  "w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 transition-colors duration-200 hover:border-text-muted/50 focus:outline-none focus:border-doctor-accent focus:ring-1 focus:ring-doctor-accent";
const label = "block text-sm text-text-muted mb-1.5";
const sectionTitle = "font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted";

const VERDICTS = [
  { value: "pneumonia", label: "Pneumonia" },
  { value: "no_pneumonia", label: "No pneumonia" },
  { value: "inconclusive", label: "Inconclusive" },
];

function CaseSkeleton() {
  return (
    <div
      className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6"
      aria-busy="true"
    >
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <Bar className="h-3 w-28" />
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <Bar key={i} className="h-14" />
            ))}
          </div>
        </div>
        <Bar className="aspect-square w-full !rounded-2xl" />
      </div>
      <div className="lg:col-span-7 space-y-6">
        <Bar className="h-56 w-full !rounded-2xl" />
        <Bar className="h-64 w-full !rounded-2xl" />
      </div>
    </div>
  );
}

export default function DoctorCasePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"none" | "notfound" | "failed">("none");

  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpReason, setFollowUpReason] = useState("");
  const [suggestedDate, setSuggestedDate] = useState("");
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  const [verdict, setVerdict] = useState("");
  const [verdictSeverity, setVerdictSeverity] = useState("");
  const [verdictType, setVerdictType] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [savingVerdict, setSavingVerdict] = useState(false);
  const [verdictError, setVerdictError] = useState("");

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

      const days = data.ai_severity === "severe" ? 3 : 7;
      const suggested = new Date();
      suggested.setDate(suggested.getDate() + days);
      const iso = suggested.toISOString().split("T")[0];
      setSuggestedDate(iso);
      setFollowUpDate(iso);

      if (data.doctor_verdict) setVerdict(data.doctor_verdict);
      if (data.doctor_notes) setDoctorNotes(data.doctor_notes);

      const rxRes = await fetch(`/api/proxy/prescriptions/${id}`);
      if (rxRes.ok) setPrescription(await rxRes.json());
    } catch {
      setError("failed");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const saveVerdict = async () => {
    setVerdictError("");
    if (verdict === "pneumonia" && (!verdictSeverity || !verdictType)) {
      setVerdictError("Choose a severity and a type for a pneumonia verdict.");
      return;
    }
    setSavingVerdict(true);
    try {
      const payload: Record<string, string> = { doctor_verdict: verdict };
      if (verdictSeverity) payload.doctor_severity = verdictSeverity;
      if (verdictType) payload.doctor_type = verdictType;
      if (doctorNotes) payload.doctor_notes = doctorNotes;
      const res = await fetch(`/api/proxy/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success("Verdict saved");
        setCaseData((prev) => prev ? {
          ...prev,
          doctor_verdict: verdict,
          doctor_severity: verdictSeverity,
          doctor_type: verdictType,
          doctor_notes: doctorNotes,
          status: "verified"
        } : prev);
      } else {
        setVerdictError("Couldn't save the verdict. Try again.");
      }
    } catch {
      setVerdictError("Network error. Try again.");
    } finally {
      setSavingVerdict(false);
    }
  };

  const saveFollowUp = async () => {
    setSavingFollowUp(true);
    try {
      const res = await fetch(`/api/proxy/follow-up/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: id,
          scheduled_date: followUpDate,
          reason: followUpReason || null,
        }),
      });
      if (res.ok) toast.success("Follow-up scheduled");
      else toast.error("Couldn't schedule the follow-up");
    } catch {
      toast.error("Network error");
    } finally {
      setSavingFollowUp(false);
    }
  };

  const shortId = id.split("-")[0].toUpperCase();

  return (
    <div className="min-h-[100dvh] bg-background" data-theme="doctor">
      <PortalHeader
        portal="doctor"
        current={`Case #${shortId}`}
        backHref="/doctor/dashboard"
        backLabel="All cases"
      />

      {loading ? (
        <CaseSkeleton />
      ) : error === "failed" ? (
        <div className="max-w-2xl mx-auto px-6 py-16">
          <InlineError message="Couldn't load this case." onRetry={load} />
        </div>
      ) : error === "notfound" || !caseData ? (
        <div className="max-w-2xl mx-auto px-6 py-24">
          <h1 className="text-2xl font-semibold text-text-primary mb-2">Case not found</h1>
          <p className="text-text-muted mb-6">
            It may have been removed, or you may not have access to it.
          </p>
          <Link href="/doctor/dashboard" className="btn-outline-light">
            Back to cases
          </Link>
        </div>
      ) : (
        <main id="main" className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-baseline gap-4 mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary font-mono tabular">
              #{shortId}
            </h1>
            <span className="text-sm text-text-muted capitalize">
              {caseData.status?.replace(/_/g, " ")}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-6">
              <section className="card-dark" aria-labelledby="overview">
                <h2 id="overview" className={`${sectionTitle} mb-4`}>
                  Patient
                </h2>
                <dl className="grid grid-cols-3 gap-3 text-sm">
                  {[
                    ["Age", caseData.symptoms?.age || "Not given"],
                    ["Sex", caseData.symptoms?.sex || "Not given"],
                    ["Blood group", caseData.symptoms?.blood_group || "Not given"],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-background rounded-lg p-3">
                      <dt className="text-text-muted text-xs mb-1">{k}</dt>
                      <dd className="text-text-primary font-medium capitalize tabular">{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="card-dark" aria-labelledby="symptoms">
                <h2 id="symptoms" className={`${sectionTitle} mb-4`}>
                  Reported symptoms
                </h2>
                <dl className="grid grid-cols-2 gap-y-4 text-sm">
                  {[
                    [
                      "Fever",
                      caseData.symptoms?.fever
                        ? `Yes, ${caseData.symptoms.fever_days} days`
                        : "No",
                    ],
                    ["Cough", caseData.symptoms?.cough_type || "None"],
                    [
                      "Breathing difficulty",
                      `${caseData.symptoms?.breathing_difficulty || 1} of 5`,
                    ],
                    ["Chest pain", caseData.symptoms?.chest_pain ? "Yes" : "No"],
                    [
                      "Duration",
                      `${caseData.symptoms?.symptom_duration_days || "Unknown"} days`,
                    ],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-text-muted text-xs">{k}</dt>
                      <dd className="text-text-primary mt-0.5 tabular">{v}</dd>
                    </div>
                  ))}
                </dl>
                {(caseData.symptoms?.existing_conditions?.length ?? 0) > 0 && (
                  <div className="mt-5 pt-4 border-t border-border">
                    <p className="text-text-muted text-xs mb-1">Existing conditions</p>
                    <p className="text-text-primary text-sm">
                      {caseData.symptoms?.existing_conditions?.join(", ")}
                    </p>
                  </div>
                )}
              </section>

              <XRayViewer
                originalUrl={caseData.xray_url}
                gradcamUrl={caseData.gradcam_url ?? null}
              />

              {currentUser && (
                <ConsultationThread
                  caseId={id}
                  currentUserRole="doctor"
                  currentUserId={currentUser.id ?? ""}
                />
              )}
            </div>

            <div className="lg:col-span-7 space-y-6">
              <ConfidenceChart
                confidence={caseData.ai_confidence || 0}
                severity={caseData.ai_severity || "none"}
                type={caseData.ai_type || "none"}
                rawOutput={caseData.ai_raw_output}
              />

              <section className="card-dark" aria-labelledby="verdict">
                <h2 id="verdict" className={`${sectionTitle} mb-5`}>
                  Your verdict
                </h2>
                <fieldset className="mb-5">
                  <legend className="sr-only">Verdict</legend>
                  <div className="flex flex-wrap gap-x-6 gap-y-3">
                    {VERDICTS.map((v) => (
                      <label
                        key={v.value}
                        className="flex items-center gap-2.5 cursor-pointer text-sm text-text-primary"
                      >
                        <input
                          type="radio"
                          name="verdict"
                          value={v.value}
                          checked={verdict === v.value}
                          onChange={(e) => setVerdict(e.target.value)}
                          className="accent-[#6FB5AC] w-4 h-4"
                        />
                        {v.label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                {verdict === "pneumonia" && (
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div>
                      <label htmlFor="v-sev" className={label}>
                        Severity
                      </label>
                      <select
                        id="v-sev"
                        value={verdictSeverity}
                        onChange={(e) => setVerdictSeverity(e.target.value)}
                        className={field}
                      >
                        <option value="">Select</option>
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="v-type" className={label}>
                        Type
                      </label>
                      <select
                        id="v-type"
                        value={verdictType}
                        onChange={(e) => setVerdictType(e.target.value)}
                        className={field}
                      >
                        <option value="">Select</option>
                        <option value="bacterial">Bacterial</option>
                        <option value="viral">Viral</option>
                      </select>
                    </div>
                  </div>
                )}

                <label htmlFor="v-notes" className={label}>
                  Clinical notes
                </label>
                <textarea
                  id="v-notes"
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  className={`${field} h-24 mb-4 resize-y`}
                />

                {verdictError && (
                  <p
                    role="alert"
                    className="text-sm text-severe-soft bg-severe-bg border border-severe/30 rounded-lg px-3.5 py-2.5 mb-4"
                  >
                    {verdictError}
                  </p>
                )}
                <button
                  onClick={saveVerdict}
                  disabled={savingVerdict || !verdict}
                  className="btn-primary text-sm !py-2 disabled:opacity-40 disabled:pointer-events-none"
                >
                  {savingVerdict ? "Saving…" : "Save verdict"}
                </button>
              </section>

              {prescription && (
                <PrescriptionEditor
                  caseId={id}
                  prescriptionId={prescription.id}
                  llmDraft={prescription.llm_draft}
                  isVerified={prescription.is_verified}
                  onVerified={() =>
                    setPrescription({ ...prescription, is_verified: true })
                  }
                />
              )}

              {currentUser && (
                <SecondOpinionPanel
                  caseId={id}
                  caseData={caseData}
                  currentDoctorId={currentUser.id ?? ""}
                  primaryDoctorId={caseData.primary_doctor_id ?? ""}
                  isSecondDoctor={false}
                />
              )}

              <section className="card-dark" aria-labelledby="followup">
                <h2 id="followup" className={`${sectionTitle} mb-3`}>
                  Schedule follow-up
                </h2>
                <p className="text-xs text-text-muted mb-5 tabular">
                  Suggested{" "}
                  <span className="text-doctor-accent">
                    {suggestedDate &&
                      new Date(suggestedDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                  </span>
                  , based on the AI severity.
                </p>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="fu-date" className={label}>
                      Date
                    </label>
                    <input
                      id="fu-date"
                      type="date"
                      value={followUpDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className={`${field} [color-scheme:dark]`}
                    />
                  </div>
                  <div>
                    <label htmlFor="fu-reason" className={label}>
                      Reason (optional)
                    </label>
                    <textarea
                      id="fu-reason"
                      value={followUpReason}
                      onChange={(e) => setFollowUpReason(e.target.value)}
                      className={`${field} h-16 resize-y`}
                    />
                  </div>
                  <button
                    onClick={saveFollowUp}
                    disabled={savingFollowUp || !followUpDate}
                    className="btn-primary text-sm !py-2 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {savingFollowUp ? "Saving…" : "Save follow-up"}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
