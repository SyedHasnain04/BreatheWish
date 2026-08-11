"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import NotificationBell from "../../../components/shared/NotificationBell";
import { AlertTriangle, Clock, CheckCircle2, Plus } from "lucide-react";

type TabType = "pending" | "active" | "closed" | "second_opinions";

interface Case {
  id: string;
  status: string;
  ai_severity: string;
  ai_confidence: number;
  created_at: string;
  patient_id: string;
  symptoms: Record<string, any>;
}

const SEV_ORDER: Record<string, number> = { severe: 0, moderate: 1, mild: 2, none: 3 };

const SeverityBadge = ({ severity }: { severity: string }) => {
  const colors: Record<string, string> = {
    severe: "bg-red-500/20 text-red-400 border border-red-500/30",
    moderate: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    mild: "bg-sky-500/20 text-sky-400 border border-sky-500/30",
    none: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${colors[severity] || colors.none}`}>
      {severity}
    </span>
  );
};

export default function DoctorDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [cases, setCases] = useState<Case[]>([]);
  const [secondOpinionCases, setSecondOpinionCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const doctorId = (session?.user as any)?.id;

  useEffect(() => {
    if (!doctorId) return;
    const fetchCases = async () => {
      setLoading(true);
      try {
        const statusGroup = activeTab === "second_opinions" ? "pending" : activeTab;
        if (activeTab !== "second_opinions") {
          const res = await fetch(`/api/proxy/cases/doctor/${doctorId}?status_group=${statusGroup}`);
          if (res.ok) {
            const data: Case[] = await res.json();
            // Sort by severity
            const sorted = data.sort((a, b) => (SEV_ORDER[a.ai_severity] ?? 3) - (SEV_ORDER[b.ai_severity] ?? 3));
            setCases(sorted);
          }
        } else {
          // Fetch cases where this doctor is second_doctor_id — for now reuse /cases/doctor
          const res = await fetch(`/api/proxy/cases/doctor/${doctorId}?status_group=active`);
          if (res.ok) setSecondOpinionCases(await res.json());
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchCases();
  }, [doctorId, activeTab]);

  const TABS: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: "pending", label: "Pending", icon: <Clock className="w-4 h-4" /> },
    { key: "active", label: "Active", icon: <AlertTriangle className="w-4 h-4" /> },
    { key: "closed", label: "Closed", icon: <CheckCircle2 className="w-4 h-4" /> },
    { key: "second_opinions", label: "Second Opinions", icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  const displayCases = activeTab === "second_opinions" ? secondOpinionCases : cases;

  return (
    <div className="min-h-screen bg-background" data-theme="doctor">
      {/* Header */}
      <div className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-text-primary">BreatheWish</h1>
            <p className="text-xs text-text-muted">Doctor Portal</p>
          </div>
          <div className="flex items-center gap-4 text-text-primary">
            <NotificationBell />
            <Link
              href="/new-case"
              className="flex items-center gap-2 bg-doctor-accent text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-sky-500 transition-colors"
            >
              <Plus className="w-4 h-4" /> New Case
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-[#1E293B] p-1 rounded-xl w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-doctor-accent text-white shadow"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-surface border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : displayCases.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-border rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-text-muted/40 mx-auto mb-3" />
            <p className="text-text-muted">
              {activeTab === "pending"
                ? "No pending cases. You're all caught up."
                : activeTab === "active"
                ? "No active cases."
                : activeTab === "second_opinions"
                ? "No second opinions assigned to you."
                : "No closed cases."}
            </p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border">
              <div className="col-span-3">Patient</div>
              <div className="col-span-2">Severity</div>
              <div className="col-span-2">Confidence</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            {displayCases.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border hover:bg-[#1E293B] transition-colors items-center"
              >
                <div className="col-span-3">
                  <p className="text-sm font-medium text-text-primary font-mono">#{c.id.split("-")[0].toUpperCase()}</p>
                  <p className="text-xs text-text-muted">Age: {c.symptoms?.age || "?"}, {c.symptoms?.sex || "?"}</p>
                </div>
                <div className="col-span-2">
                  <SeverityBadge severity={c.ai_severity || "none"} />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 bg-[#0F172A] rounded-full overflow-hidden">
                      <div className="h-full bg-doctor-accent rounded-full" style={{ width: `${c.ai_confidence || 0}%` }} />
                    </div>
                    <span className="text-xs text-text-muted">{(c.ai_confidence || 0).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-text-secondary capitalize">{c.status?.replace(/_/g, " ")}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-text-muted">
                    {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <div className="col-span-1 text-right">
                  <Link
                    href={`/case/${c.id}`}
                    className="text-xs text-doctor-accent font-semibold hover:underline"
                  >
                    Review →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
