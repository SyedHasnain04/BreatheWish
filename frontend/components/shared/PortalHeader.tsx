"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogoMark } from "@/components/hero/LandingNav";
import NotificationBell from "@/components/shared/NotificationBell";

interface Props {
  portal: "doctor" | "patient";
  /** Optional override for breadcrumb text shown after the logo (e.g. "Case #ABC") */
  current?: string;
  /** Optional back-link to show an arrow-left link */
  backHref?: string;
  backLabel?: string;
  /** Href for the New Case CTA; omit to hide it */
  newCaseHref?: string;
}

export default function PortalHeader({
  portal,
  current,
  backHref,
  backLabel,
  newCaseHref,
}: Props) {
  const { data: session } = useSession();

  const isDoctor = portal === "doctor";
  const accentText = isDoctor ? "text-doctor-accent" : "text-patient-accent";
  const borderColor = isDoctor ? "border-border" : "border-patient-border";
  const surfaceBg = isDoctor ? "bg-surface/90" : "bg-patient-surface/90";

  return (
    <header
      className={`sticky top-0 z-30 ${surfaceBg} backdrop-blur-sm border-b ${borderColor}`}
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
        {/* Logo / back */}
        {backHref ? (
          <Link
            href={backHref}
            className={`flex items-center gap-1.5 text-sm ${isDoctor ? "text-text-muted hover:text-text-primary" : "text-text-dark-muted hover:text-text-dark"} transition-colors`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            <span>{backLabel ?? "Back"}</span>
          </Link>
        ) : (
          <Link href="/" className={`flex items-center gap-2 ${isDoctor ? "text-text-primary" : "text-text-dark"}`}>
            <span className={accentText}>
              <LogoMark className="w-5 h-5" />
            </span>
            <span className="font-medium text-sm tracking-tight">BreatheWish</span>
          </Link>
        )}

        {/* Breadcrumb current page */}
        {current && (
          <>
            <span className={`${isDoctor ? "text-border" : "text-patient-border"}`}>/</span>
            <span className={`text-sm font-mono ${isDoctor ? "text-text-muted" : "text-text-dark-muted"}`}>
              {current}
            </span>
          </>
        )}

        <div className="ml-auto flex items-center gap-3">
          <NotificationBell />

          {newCaseHref && (
            <Link
              href={newCaseHref}
              className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-colors ${
                isDoctor
                  ? "bg-doctor-accent/10 text-doctor-accent hover:bg-doctor-accent/20"
                  : "bg-patient-accent text-white hover:bg-primary-hover"
              }`}
            >
              New case
            </Link>
          )}

          {session && (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className={`text-xs ${isDoctor ? "text-text-muted hover:text-text-primary" : "text-text-dark-muted hover:text-text-dark"} transition-colors`}
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
