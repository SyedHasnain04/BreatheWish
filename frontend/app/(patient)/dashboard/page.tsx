"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus, Activity, Bell } from "lucide-react";
import CaseStatusStepper from "../../../components/patient/CaseStatusStepper";
import PrescriptionCard from "../../../components/patient/PrescriptionCard";
import FollowUpCard from "../../../components/patient/FollowUpCard";
import NotificationBell from "../../../components/shared/NotificationBell";

interface Case {
  id: string;
  status: string;
  created_at: string;
  xray_url: string;
  symptoms: Record<string, any>;
}

// Skeleton row
function CaseSkeleton() {
  return (
    <div className="bg-patient-surface border border-patient-border rounded-2xl overflow-hidden animate-pulse">
      <div className="px-6 py-4 border-b border-patient-border flex justify-between">
        <div>
          <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-32 bg-gray-200 rounded" />
        </div>
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>
      <div className="px-6 py-6">
        <div className="flex justify-between">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gray-200" />
              <div className="h-2 w-14 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const { data: session } = useSession();
  const [cases, setCases] = useState<Case[]>([]);
  const [prescriptions, setPrescriptions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;

    const fetchCases = async () => {
      try {
        const userId = (session.user as any).id;
        const res = await fetch(`/api/proxy/cases/patient/${userId}`);
        if (res.ok) {
          const data: Case[] = await res.json();
          setCases(data);

          const verifiedCases = data.filter((c) => c.status === "verified" || c.status === "closed");
          const rxMap: Record<string, any> = {};
          await Promise.all(
            verifiedCases.map(async (c) => {
              try {
                const rxRes = await fetch(`/api/proxy/prescriptions/${c.id}`);
                if (rxRes.ok) rxMap[c.id] = await rxRes.json();
              } catch {}
            })
          );
          setPrescriptions(rxMap);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };

    fetchCases();
  }, [session]);

  return (
    <div className="min-h-screen bg-patient-bg" data-theme="patient">
      {/* Header */}
      <div className="border-b border-patient-border bg-patient-surface/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-text-dark">BreatheWish</h1>
            <p className="text-xs text-text-dark-muted">Patient Portal</p>
          </div>
          <div className="flex items-center gap-3 text-text-dark">
            <NotificationBell />
            <Link
              href="/new-case"
              className="flex items-center gap-2 bg-patient-accent text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-patient-accent/20 hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> New Case
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-text-dark mb-6">My Cases</h2>

        <div className="space-y-6">
          {loading ? (
            [1, 2].map((i) => <CaseSkeleton key={i} />)
          ) : cases.length === 0 ? (
            <div className="text-center py-24 bg-patient-surface border border-patient-border rounded-2xl">
              <Activity className="w-16 h-16 text-patient-accent/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-dark mb-2">No cases yet</h3>
              <p className="text-text-dark-muted mb-6">Upload your first X-ray to get started</p>
              <Link
                href="/new-case"
                className="bg-patient-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
              >
                Upload X-Ray
              </Link>
            </div>
          ) : (
            cases.map((c) => (
              <div key={c.id} className="bg-patient-surface border border-patient-border rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="px-6 py-4 flex justify-between items-center border-b border-patient-border">
                  <div>
                    <p className="text-xs text-text-dark-muted font-mono">Case #{c.id.split("-")[0].toUpperCase()}</p>
                    <p className="text-sm text-text-dark-muted mt-0.5">
                      {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <Link href={`/case/${c.id}`} className="text-sm text-patient-accent font-semibold hover:underline">
                    View Details →
                  </Link>
                </div>

                {/* Stepper */}
                <div className="px-6 py-6">
                  <CaseStatusStepper status={c.status as any} />
                </div>

                {/* Follow-up */}
                <div className="px-6 pb-3">
                  <FollowUpCard caseId={c.id} />
                </div>

                {/* Prescription */}
                {prescriptions[c.id] && (
                  <div className="px-6 pb-6">
                    <PrescriptionCard prescription={prescriptions[c.id]} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
