"use client";

import React, { useEffect, useState } from "react";


interface FollowUp {
  id: string;
  scheduled_date: string;
  reason: string | null;
  status: string;
}

interface Props {
  caseId: string;
}

export default function FollowUpCard({ caseId }: Props) {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowUps = async () => {
      try {
        const res = await fetch(`/api/proxy/follow-up/${caseId}`);
        if (res.ok) setFollowUps(await res.json());
      } catch {
        /* silent failure on background fetch */
      }
      setLoading(false);
    };
    fetchFollowUps();
  }, [caseId]);

  if (loading || followUps.length === 0) return null;

  const upcoming = followUps.filter((f) => f.status === "scheduled");
  const past = followUps.filter((f) => f.status !== "scheduled");

  const getDaysRemaining = (dateStr: string) => {
    const target = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff < 0) return `${Math.abs(diff)} days ago`;
    return `in ${diff} days`;
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <section className="bg-patient-surface border border-patient-border rounded-xl overflow-hidden shadow-sm">
      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="bg-patient-accent p-5 flex flex-wrap items-center justify-between gap-4 text-white">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 2v4" />
                <path d="M16 2v4" />
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <path d="M3 10h18" />
              </svg>
            </div>
            <div>
              <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Scheduled Follow-up</p>
              <p className="text-white font-semibold text-lg font-mono tabular">{formatDate(upcoming[0].scheduled_date)}</p>
              {upcoming[0].reason && <p className="text-white/80 text-xs mt-0.5">{upcoming[0].reason}</p>}
            </div>
          </div>
          <div>
            <div className="bg-white/20 text-white text-xs font-medium font-mono tabular px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {getDaysRemaining(upcoming[0].scheduled_date)}
            </div>
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div className="p-5">
          <h4 className="text-xs font-semibold text-text-dark-muted uppercase tracking-wider mb-2.5">
            Past Follow-ups
          </h4>
          <div className="space-y-2">
            {past.map((f) => (
              <div key={f.id} className="flex justify-between items-center text-xs py-1 border-b border-patient-border last:border-0">
                <span className="text-text-dark font-mono tabular">{formatDate(f.scheduled_date)}</span>
                <span className="text-[11px] font-mono bg-patient-bg text-text-dark-muted border border-patient-border px-2 py-0.5 rounded-md capitalize">
                  {f.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
