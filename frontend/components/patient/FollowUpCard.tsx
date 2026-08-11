"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";

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
      } catch {}
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
    new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="bg-patient-surface border border-patient-border rounded-xl overflow-hidden shadow-sm">
      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="bg-patient-accent p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white/80 text-sm font-medium">Next Follow-up</p>
            <p className="text-white font-bold text-xl">{formatDate(upcoming[0].scheduled_date)}</p>
            {upcoming[0].reason && <p className="text-white/70 text-sm mt-0.5">{upcoming[0].reason}</p>}
          </div>
          <div className="text-right">
            <div className="bg-white/20 text-white text-sm font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {getDaysRemaining(upcoming[0].scheduled_date)}
            </div>
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div className="p-5">
          <h4 className="text-sm font-semibold text-text-dark-muted uppercase tracking-wider mb-3">Past Follow-ups</h4>
          <div className="space-y-2">
            {past.map((f) => (
              <div key={f.id} className="flex justify-between items-center text-sm">
                <span className="text-text-dark">{formatDate(f.scheduled_date)}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{f.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
