"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="min-h-[100dvh] bg-background flex items-center px-6">
      <div className="max-w-xl mx-auto w-full">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-doctor-accent mb-4">Error</p>
        <h1 className="text-4xl font-semibold tracking-tight text-text-primary mb-4">Something went wrong</h1>
        <p className="text-text-muted mb-8 max-w-[52ch]">
          The page hit an unexpected problem. Your data has not been changed. Try again, or go back to the start.
        </p>
        <div className="flex items-center gap-6">
          <button type="button" onClick={reset} className="btn-primary">Try again</button>
          <Link href="/" className="link-quiet text-sm">Back to home</Link>
        </div>
        {error.digest && <p className="mt-10 text-xs text-text-muted font-mono">Reference {error.digest}</p>}
      </div>
    </main>
  );
}
