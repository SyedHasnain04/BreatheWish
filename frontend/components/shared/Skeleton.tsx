import React from "react";

interface BarProps {
  className?: string;
  /** Use light variant for patient (light) surfaces */
  light?: boolean;
}

/** A single shimmer bar. Use multiple to build skeleton layouts. */
export function Bar({ className = "", light = false }: BarProps) {
  const base = light ? "bg-patient-border/70" : "bg-surface-raised";
  return (
    <div
      className={`${base} rounded-md animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}

interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  light?: boolean;
}

/** Inline error state with optional retry button. */
export function InlineError({ message, onRetry, light = false }: InlineErrorProps) {
  return (
    <div
      role="alert"
      className={`rounded-2xl border px-6 py-8 flex flex-col gap-4 max-w-md ${
        light
          ? "bg-patient-surface border-patient-border text-text-dark"
          : "bg-surface border-border text-text-primary"
      }`}
    >
      <p className="text-sm">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={`self-start text-sm underline underline-offset-4 ${
            light ? "text-patient-accent" : "text-doctor-accent"
          }`}
        >
          Try again
        </button>
      )}
    </div>
  );
}
