"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PortalHeader from "../../../components/shared/PortalHeader";
import SeverityBadge from "../../../components/shared/SeverityBadge";
import { Bar, InlineError } from "../../../components/shared/Skeleton";
import type { CaseSymptoms, SessionUser, Severity } from "../../../types";

type TabType = "pending" | "active" | "closed";

interface Case {
  id: string;
  status: string;
  ai_severity: Severity | null;
  ai_confidence: number | null;
  created_at: string;
  patient_id: string;
  symptoms: CaseSymptoms | null;
}

const SEV_ORDER: Record<string, number> = { severe: 0, moderate: 1, mild: 2, none: 3 };

const TABS: { key: TabType; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "active", label: "Active" },
  { key: "closed", label: "Closed" },
];

const EMPTY: Record<TabType, { title: string; body: string }> = {
  pending: {
    title: "Nothing waiting for review",
    body: "New uploads assigned to you appear here, most severe first.",
  },
  active: {
    title: "No active cases",
    body: "Cases with a draft prescription or an open second opinion show up here.",
  },
  closed: {
    title: "No closed cases yet",
    body: "Cases you have verified will be listed here.",
  },
};

const GRID =
  "grid grid-cols-[minmax(0,2fr)_7rem_9rem_minmax(0,1.4fr)_5rem_5rem] gap-4 px-6";

function RowSkeleton() {
  return (
    <div
      className={`${GRID} py-4 items-center border-b border-border last:border-0`}
    >
      <div className="space-y-2">
        <Bar className="h-3.5 w-24" />
        <Bar className="h-3 w-16" />
      </div>
      <Bar className="h-5 w-16" />
      <Bar className="h-2 w-24" />
      <Bar className="h-3 w-24" />
      <Bar className="h-3 w-10" />
      <Bar className="h-3 w-12 ml-auto" />
    </div>
  );
}

export default function DoctorDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const doctorId = (session?.user as SessionUser | undefined)?.id;

  const load = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(
        `/api/proxy/cases/doctor/${doctorId}?status_group=${activeTab}`
      );
      if (!res.ok) throw new Error(String(res.status));
      const data: Case[] = await res.json();
      setCases(
        [...data].sort(
          (a, b) =>
            (SEV_ORDER[a.ai_severity ?? "none"] ?? 3) -
            (SEV_ORDER[b.ai_severity ?? "none"] ?? 3)
        )
      );
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [doctorId, activeTab]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-[100dvh] bg-background" data-theme="doctor">
      <PortalHeader portal="doctor" newCaseHref="/doctor/new-case" />

      <main id="main" className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between gap-6 mb-8 flex-wrap">
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
            Cases
          </h1>

          <div
            role="tablist"
            aria-label="Case status"
            className="flex gap-6 border-b border-border"
          >
            {TABS.map((tab) => {
              const on = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative pb-3 text-sm font-medium transition-colors duration-200 ${
                    on
                      ? "text-text-primary"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {tab.label}
                  {on && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 bg-doctor-accent rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <InlineError message="Couldn't load your cases." onRetry={load} />
        ) : loading ? (
          <div
            className="bg-surface border border-border rounded-2xl overflow-hidden"
            aria-busy="true"
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <RowSkeleton key={i} />
            ))}
          </div>
        ) : cases.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl px-8 py-16 max-w-xl">
            <h2 className="text-lg font-medium text-text-primary mb-2">
              {EMPTY[activeTab].title}
            </h2>
            <p className="text-text-muted mb-7 max-w-[44ch]">
              {EMPTY[activeTab].body}
            </p>
            <Link
              href="/doctor/new-case"
              className="btn-outline-light text-sm !py-2 !px-4"
            >
              Upload a case
            </Link>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl overflow-x-auto">
            <div className="min-w-[52rem]">
              <div
                className={`${GRID} py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted border-b border-border`}
              >
                <div>Case</div>
                <div>Severity</div>
                <div>Confidence</div>
                <div>Status</div>
                <div>Date</div>
                <div className="text-right">Action</div>
              </div>

              {cases.map((c) => {
                const conf = c.ai_confidence ?? 0;
                return (
                  <div
                    key={c.id}
                    className={`${GRID} py-4 items-center border-b border-border last:border-0 hover:bg-surface-raised/60 transition-colors duration-200`}
                  >
                    <div>
                      <p className="text-sm font-mono text-text-primary tabular">
                        #{c.id.split("-")[0].toUpperCase()}
                      </p>
                      <p className="text-xs text-text-muted tabular mt-0.5">
                        {c.symptoms?.age ? `${c.symptoms.age} y` : "Age not given"}
                        {c.symptoms?.sex ? ` · ${c.symptoms.sex}` : ""}
                      </p>
                    </div>
                    <div>
                      <SeverityBadge
                        severity={(c.ai_severity ?? "none") as Severity}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-16 bg-background rounded-full overflow-hidden">
                        <div
                          className="h-full bg-doctor-accent rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(0, conf))}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono text-text-muted tabular">
                        {conf.toFixed(0)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-text-muted capitalize">
                        {c.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-mono text-text-muted tabular">
                        {new Date(c.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="text-right">
                      <Link
                        href={`/doctor/case/${c.id}`}
                        className="text-sm text-doctor-accent hover:underline underline-offset-4"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
