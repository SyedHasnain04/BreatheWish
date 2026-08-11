"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/login");
    } else if ((session.user as any)?.role === "doctor") {
      router.replace("/doctor/dashboard");
    } else {
      router.replace("/patient/dashboard");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-doctor-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
