import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="min-h-[100dvh] bg-background flex items-center px-6">
      <div className="max-w-xl mx-auto w-full">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-doctor-accent mb-4">404</p>
        <h1 className="text-4xl font-semibold tracking-tight text-text-primary mb-4">
          That page doesn&apos;t exist
        </h1>
        <p className="text-text-muted mb-8">
          The link may be old, or the case may have been removed.
        </p>
        <Link href="/" className="btn-primary">
          Back to home
        </Link>
      </div>
    </main>
  );
}
