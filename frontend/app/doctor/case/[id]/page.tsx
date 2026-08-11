"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import XRayViewer from "@/components/doctor/XRayViewer";
import ConfidenceChart from "@/components/doctor/ConfidenceChart";
import PrescriptionEditor from "@/components/doctor/PrescriptionEditor";
import SecondOpinionPanel from "@/components/doctor/SecondOpinionPanel";
import ConsultationThread from "@/components/patient/ConsultationThread";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

export default function DoctorCasePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();
  const [caseData, setCaseData] = useState<any>(null);
  const [prescription, setPrescription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpReason, setFollowUpReason] = useState("");
  const [suggestedDate, setSuggestedDate] = useState("");
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  const [verdict, setVerdict] = useState("");
  const [verdictSeverity, setVerdictSeverity] = useState("");
  const [verdictType, setVerdictType] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [savingVerdict, setSavingVerdict] = useState(false);

  const currentUser = session?.user as any;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const caseRes = await fetch(`/api/proxy/cases/${id}`);
        if (caseRes.ok) {
          const data = await caseRes.json();
          setCaseData(data);

          const days = data.ai_severity === "severe" ? 3 : 7;
          const suggested = new Date();
          suggested.setDate(suggested.getDate() + days);
          setSuggestedDate(suggested.toISOString().split("T")[0]);
          setFollowUpDate(suggested.toISOString().split("T")[0]);

          if (data.doctor_verdict) setVerdict(data.doctor_verdict);
          if (data.doctor_notes) setDoctorNotes(data.doctor_notes);
        }

        const rxRes = await fetch(`/api/proxy/prescriptions/${id}`);
        if (rxRes.ok) setPrescription(await rxRes.json());
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const saveVerdict = async () => {
    setSavingVerdict(true);
    try {
      const res = await fetch(`/api/proxy/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctor_verdict: verdict, doctor_severity: verdictSeverity, doctor_type: verdictType, doctor_notes: doctorNotes })
      });
      if (res.ok) toast.success("Verdict saved");
      else toast.error("Failed to save verdict");
    } catch {
      toast.error("Network error");
    }
    setSavingVerdict(false);
  };

  const saveFollowUp = async () => {
    if (!followUpDate) return;
    setSavingFollowUp(true);
    try {
      const res = await fetch(`/api/proxy/follow-up/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_id: id, scheduled_date: followUpDate, reason: followUpReason || null })
      });
      if (res.ok) toast.success("Follow-up scheduled");
      else toast.error("Failed to schedule follow-up");
    } catch {
      toast.error("Network error");
    }
    setSavingFollowUp(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 pt-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="lg:col-span-6 h-48 bg-surface border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-background pt-24 text-center">
        <p className="text-text-muted">Case not found or you don't have permission to view it.</p>
        <Link href="/doctor/dashboard" className="text-doctor-accent mt-4 inline-block hover:underline">← Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-theme="doctor">
      <div className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
          <Link href="/doctor/dashboard" className="text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-base font-bold text-text-primary">Case #{id.split("-")[0].toUpperCase()}</h1>
            <p className="text-xs text-text-muted capitalize">{caseData.status?.replace(/_/g, " ")}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
              <h2 className="font-bold text-text-primary mb-3">Patient Overview</h2>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {[
                  ["Age", caseData.symptoms?.age || "N/A"],
                  ["Sex", caseData.symptoms?.sex || "N/A"],
                  ["Blood", caseData.symptoms?.blood_group || "N/A"],
                ].map(([label, val]) => (
                  <div key={label} className="bg-[#1E293B] rounded-lg p-3">
                    <p className="text-text-muted text-xs mb-1">{label}</p>
                    <p className="text-text-primary font-semibold capitalize">{val}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Reported Symptoms</h3>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                {[
                  ["Fever", caseData.symptoms?.fever ? `Yes (${caseData.symptoms.fever_days}d)` : "No"],
                  ["Cough", caseData.symptoms?.cough_type || "None"],
                  ["Breathing", `${caseData.symptoms?.breathing_difficulty || 1}/5`],
                  ["Chest Pain", caseData.symptoms?.chest_pain ? "Yes" : "No"],
                  ["Duration", `${caseData.symptoms?.symptom_duration_days || "?"} days`],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-text-muted text-xs">{label}</p>
                    <p className="text-text-primary mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
              {caseData.symptoms?.existing_conditions?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-text-muted text-xs mb-1">Existing Conditions</p>
                  <p className="text-text-primary text-sm">{caseData.symptoms.existing_conditions.join(", ")}</p>
                </div>
              )}
            </div>

            <XRayViewer originalUrl={caseData.xray_url} gradcamUrl={caseData.gradcam_url} />

            {currentUser && (
              <ConsultationThread
                caseId={id}
                currentUserRole="doctor"
                currentUserId={currentUser.id}
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

            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-text-primary mb-4">Doctor Verdict</h3>
              <div className="flex flex-wrap gap-3 mb-4">
                {["Pneumonia", "No Pneumonia", "Inconclusive"].map((v) => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="verdict"
                      value={v.toLowerCase().replace(/ /g, "_")}
                      checked={verdict === v.toLowerCase().replace(/ /g, "_")}
                      onChange={(e) => setVerdict(e.target.value)}
                      className="accent-doctor-accent"
                    />
                    <span className="text-sm text-text-secondary">{v}</span>
                  </label>
                ))}
              </div>
              {verdict === "pneumonia" && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <select value={verdictSeverity} onChange={(e) => setVerdictSeverity(e.target.value)} className="bg-[#1E293B] border border-border rounded-lg px-3 py-2 text-sm">
                    <option value="">Severity...</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                  <select value={verdictType} onChange={(e) => setVerdictType(e.target.value)} className="bg-[#1E293B] border border-border rounded-lg px-3 py-2 text-sm">
                    <option value="">Type...</option>
                    <option value="bacterial">Bacterial</option>
                    <option value="viral">Viral</option>
                  </select>
                </div>
              )}
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Clinical notes..."
                className="w-full h-20 bg-[#1E293B] border border-border rounded-lg p-3 text-sm mb-3"
              />
              <button
                onClick={saveVerdict}
                disabled={savingVerdict || !verdict}
                className="px-5 py-2 bg-[#1E293B] border border-border text-text-primary rounded-lg text-sm font-semibold hover:bg-black transition-colors disabled:opacity-40"
              >
                {savingVerdict ? "Saving..." : "Save Verdict"}
              </button>
            </div>

            {prescription && (
              <PrescriptionEditor
                caseId={id}
                prescriptionId={prescription.id}
                llmDraft={prescription.llm_draft}
                isVerified={prescription.is_verified}
              />
            )}

            {currentUser && (
              <SecondOpinionPanel
                caseId={id}
                caseData={caseData}
                currentDoctorId={currentUser.id}
                primaryDoctorId={caseData.primary_doctor_id}
                isSecondDoctor={false}
              />
            )}

            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-doctor-accent" />
                <h3 className="font-semibold text-text-primary">Schedule Follow-up</h3>
              </div>
              <p className="text-xs text-text-muted mb-3">
                System suggestion: <span className="text-doctor-accent font-medium">{new Date(suggestedDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span> based on severity
              </p>
              <div className="space-y-3">
                <input
                  type="date"
                  value={followUpDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full bg-[#1E293B] border border-border rounded-lg px-3 py-2 text-sm"
                />
                <textarea
                  value={followUpReason}
                  onChange={(e) => setFollowUpReason(e.target.value)}
                  placeholder="Reason (optional)..."
                  className="w-full h-16 bg-[#1E293B] border border-border rounded-lg p-3 text-sm"
                />
                <button
                  onClick={saveFollowUp}
                  disabled={savingFollowUp || !followUpDate}
                  className="bg-doctor-accent text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-sky-500 transition-colors disabled:opacity-40"
                >
                  {savingFollowUp ? "Saving..." : "Save Follow-up"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
