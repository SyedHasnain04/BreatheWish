import React from "react";
import Link from "next/link";
import { LogoMark } from "@/components/hero/LandingNav";

interface Props {
  title: string;
  updated: string;
  children: React.ReactNode;
}

/**
 * Shared wrapper for Terms and Privacy pages.
 * Provides consistent typography and navigation.
 */
export default function LegalPage({ title, updated, children }: Props) {
  return (
    <div className="min-h-[100dvh] bg-background text-text-primary">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-text-primary">
            <span className="text-doctor-accent">
              <LogoMark className="w-5 h-5" />
            </span>
            <span className="font-medium text-sm tracking-tight">BreatheWish</span>
          </Link>
        </div>
      </header>

      <main id="main" className="max-w-3xl mx-auto px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-doctor-accent mb-3">
          Legal
        </p>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">{title}</h1>
        <p className="text-sm text-text-muted mb-12 tabular">Last updated {updated}</p>

        <div className="prose prose-invert max-w-none space-y-10 text-text-muted [&_h2]:text-text-primary [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_li]:text-sm [&_p]:text-sm">
          {children}
        </div>

        <div className="mt-16 pt-8 border-t border-border flex gap-6">
          <Link href="/" className="link-quiet text-sm">Home</Link>
          <Link href="/terms" className="link-quiet text-sm">Terms</Link>
          <Link href="/privacy" className="link-quiet text-sm">Privacy</Link>
        </div>
      </main>
    </div>
  );
}
