"use client";

import type { SessionUser } from "../../types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Bar } from "../../components/shared/Skeleton";

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/login");
    } else if ((session.user as SessionUser)?.role === "doctor") {
      router.replace("/doctor/dashboard");
    } else {
      router.replace("/patient/dashboard");
    }
  }, [session, status, router]);

  // Same frame as the destination dashboards, so the redirect doesn't flash
  return (
    <div
      className="min-h-[100dvh] bg-background"
      role="status"
      aria-label="Loading your dashboard"
    >
      <div className="h-16 border-b border-border bg-surface" />
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-4">
        <Bar className="h-9 w-72" />
        {[0, 1, 2, 3].map((i) => (
          <Bar key={i} className="h-16 w-full !rounded-xl" />
        ))}
      </div>
    </div>
  );
}
