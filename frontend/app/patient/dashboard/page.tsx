"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import CaseStatusStepper from "@/components/patient/CaseStatusStepper";
import PrescriptionCard from "@/components/patient/PrescriptionCard";
import FollowUpCard from "@/components/patient/FollowUpCard";
import PortalHeader from "@/components/shared/PortalHeader";
import { Bar, InlineError } from "@/components/shared/Skeleton";
import type { CaseSymptoms, Prescription, SessionUser } from "@/types";
import type { CaseStatus } from "@/components/patient/CaseStatusStepper";

interface Case {
  id: string;
  status: string;
  created_at: string;
  xray_url: string;
  symptoms: CaseSymptoms | null;
}

function CaseSkeleton() {
  return (
    <div
      className="bg-patient-surface border border-patient-border rounded-2xl overflow-hidden"
      aria-hidden="true"
    >
      <div className="px-6 py-4 border-b border-patient-border flex justify-between">
        <div className="space-y-2">
          <Bar light className="h-3 w-24" />
          <Bar light className="h-3 w-32" />
        </div>
        <Bar light className="h-4 w-20" />
      </div>
      <div className="px-6 py-6 flex justify-between">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Bar light className="w-9 h-9 !rounded-full" />
            <Bar light className="h-2 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const { data: session } = useSession();
  const [cases, setCases] = useState<Case[]>([]);
  const [prescriptions, setPrescriptions] = useState<Record<string, Prescription>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const userId = (session?.user as SessionUser | undefined)?.id;

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/proxy/cases/patient/${userId}`);
      if (!res.ok) throw new Error(String(res.status));
      const data: Case[] = await res.json();
      setCases(data);

      const rxMap: Record<string, Prescription> = {};
      await Promise.all(
        data
          .filter((c) => c.status === "verified" || c.status === "closed")
          .map(async (c) => {
            try {
              const rxRes = await fetch(`/api/proxy/prescriptions/${c.id}`);
              if (rxRes.ok) rxMap[c.id] = await rxRes.json();
            } catch {
              /* a missing prescription shouldn't fail the whole page */
            }
          })
      );
      setPrescriptions(rxMap);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-[100dvh] bg-patient-bg text-text-dark" data-theme="patient">
      <PortalHeader portal="patient" newCaseHref="/patient/new-case" />

      <main id="main" className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-text-dark mb-8">
          My cases
        </h1>

        <div className="space-y-6" aria-busy={loading}>
          {error ? (
            <InlineError light message="Couldn't load your cases." onRetry={load} />
          ) : loading ? (
            [0, 1].map((i) => <CaseSkeleton key={i} />)
          ) : cases.length === 0 ? (
            <div className="bg-patient-surface border border-patient-border rounded-2xl px-8 py-16 max-w-xl shadow-card-light">
              <h2 className="text-lg font-medium text-text-dark mb-2">No cases yet</h2>
              <p className="text-text-dark-muted mb-7 max-w-[44ch]">
                Upload a chest X-ray and a doctor will review it. You&apos;ll be notified here when
                the result is ready.
              </p>
              <Link href="/patient/new-case" className="btn-primary">
                Upload an X-ray
              </Link>
            </div>
          ) : (
            cases.map((c) => (
              <article
                key={c.id}
                className="bg-patient-surface border border-patient-border rounded-2xl shadow-card-light overflow-hidden"
              >
                <div className="px-6 py-4 flex justify-between items-center border-b border-patient-border">
                  <div>
                    <p className="text-xs text-text-dark-muted font-mono tabular">
                      Case #{c.id.split("-")[0].toUpperCase()}
                    </p>
                    <p className="text-sm text-text-dark-muted mt-0.5 tabular">
                      {new Date(c.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Link
                    href={`/patient/case/${c.id}`}
                    className="text-sm text-patient-accent font-medium hover:underline underline-offset-4"
                  >
                    View details
                  </Link>
                </div>

                <div className="px-6 py-6">
                  <CaseStatusStepper status={c.status as CaseStatus} />
                </div>

                <div className="px-6 pb-3">
                  <FollowUpCard caseId={c.id} />
                </div>

                {prescriptions[c.id] && (
                  <div className="px-6 pb-6">
                    <PrescriptionCard prescription={prescriptions[c.id]} />
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
