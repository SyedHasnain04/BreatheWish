"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import CaseStatusStepper from "../../../../components/patient/CaseStatusStepper";
import PrescriptionCard from "../../../../components/patient/PrescriptionCard";
import ConsultationThread from "../../../../components/patient/ConsultationThread";
import { MessageSquare, ChevronDown } from "lucide-react";

export default function PatientCasePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();
  const [caseData, setCaseData] = useState<any>(null);
  const [prescription, setPrescription] = useState<any>(null);
  const [secondOpinion, setSecondOpinion] = useState<any>(null);
  const [soReason, setSoReason] = useState("");
  const [soExpanded, setSoExpanded] = useState(false);
  const [submittingSo, setSubmittingSo] = useState(false);
  const [soSubmitted, setSoSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentUser = session?.user as any;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const caseRes = await fetch(`/api/proxy/cases/${id}`);
        if (caseRes.ok) {
          const data = await caseRes.json();
          setCaseData(data);

          // Try to get prescription
          if (data.status === "verified" || data.status === "closed") {
            const rxRes = await fetch(`/api/proxy/prescriptions/${id}`);
            if (rxRes.ok) setPrescription(await rxRes.json());
          }

          // Try to get second opinion
          const soRes = await fetch(`/api/proxy/second-opinion/${id}`);
          if (soRes.ok) {
            const soData = await soRes.json();
            setSecondOpinion(soData);
            if (soData) setSoSubmitted(true);
          }
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchAll();
  }, [id]);

  const submitSecondOpinion = async () => {
    if (!soReason.trim()) return;
    setSubmittingSo(true);
    try {
      await fetch(`/api/proxy/second-opinion/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_id: id, requested_by: "patient", reason: soReason })
      });
      setSoSubmitted(true);
      setSoExpanded(false);
    } catch (e) {}
    setSubmittingSo(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-patient-bg pt-24 flex items-center justify-center"><div className="w-8 h-8 border-4 border-patient-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!caseData) {
    return <div className="min-h-screen bg-patient-bg pt-24 text-center text-text-dark">Case not found.</div>;
  }

  const isVerified = caseData.status === "verified" || caseData.status === "closed";
  const canRequestSo = isVerified && !soSubmitted;

  return (
    <div className="min-h-screen bg-patient-bg" data-theme="patient">
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-16 space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs text-text-dark-muted font-mono">Case #{id.split("-")[0].toUpperCase()}</p>
          <h1 className="text-2xl font-bold text-text-dark mt-1">
            {new Date(caseData.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </h1>
        </div>

        {/* Status Stepper */}
        <div className="bg-patient-surface border border-patient-border rounded-2xl p-6">
          <CaseStatusStepper status={caseData.status} />
        </div>

        {/* Prescription */}
        {prescription && <PrescriptionCard prescription={prescription} />}

        {/* Second Opinion */}
        {soSubmitted && secondOpinion && (
          <div className={`rounded-xl border p-5 ${
            secondOpinion.agrees_with_primary === true
              ? "bg-emerald-50 border-emerald-200"
              : secondOpinion.agrees_with_primary === false
              ? "bg-amber-50 border-amber-200"
              : "bg-patient-surface border-patient-border"
          }`}>
            <h3 className="font-semibold text-text-dark mb-1">Second Opinion</h3>
            {secondOpinion.status === "pending" && (
              <p className="text-sm text-text-dark-muted">Second opinion requested — awaiting review</p>
            )}
            {secondOpinion.status === "submitted" && secondOpinion.agrees_with_primary === true && (
              <p className="text-sm text-emerald-700 font-medium">Confirmed by second doctor</p>
            )}
            {secondOpinion.status === "submitted" && secondOpinion.agrees_with_primary === false && (
              <p className="text-sm text-amber-700 font-medium">Second opinion differs — primary doctor's assessment has been applied</p>
            )}
          </div>
        )}

        {canRequestSo && (
          <div className="bg-patient-surface border border-patient-border rounded-xl overflow-hidden">
            <button
              onClick={() => setSoExpanded(!soExpanded)}
              className="w-full flex justify-between items-center px-6 py-4 text-left"
            >
              <span className="font-semibold text-text-dark">Request Second Opinion</span>
              <ChevronDown className={`w-5 h-5 text-patient-accent transition-transform ${soExpanded ? "rotate-180" : ""}`} />
            </button>
            {soExpanded && (
              <div className="px-6 pb-6 border-t border-patient-border">
                <p className="text-sm text-text-dark-muted mb-3 pt-4">Tell us why you'd like a second opinion:</p>
                <textarea
                  value={soReason}
                  onChange={(e) => setSoReason(e.target.value)}
                  className="w-full border border-patient-border rounded-lg p-3 text-sm h-24 bg-white"
                  placeholder="e.g. I'd like another doctor's view on the severity..."
                />
                <button
                  onClick={submitSecondOpinion}
                  disabled={submittingSo || !soReason.trim()}
                  className="mt-3 bg-patient-accent text-white px-5 py-2 rounded-lg font-semibold text-sm disabled:opacity-50 hover:bg-teal-700 transition-colors"
                >
                  {submittingSo ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Consultation Thread */}
        {currentUser && (
          <div className="bg-patient-surface border border-patient-border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-patient-border">
              <MessageSquare className="w-5 h-5 text-patient-accent" />
              <h3 className="font-semibold text-text-dark">Ask Your Doctor</h3>
            </div>
            <div className="p-4">
              <ConsultationThread
                caseId={id}
                currentUserRole="patient"
                currentUserId={currentUser.id}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
