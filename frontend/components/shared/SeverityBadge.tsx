import React from "react";
import { Severity } from "../../types";

interface Props {
  severity: Severity;
}

export default function SeverityBadge({ severity }: Props) {
  if (severity === "none") {
    return (
      <span className="px-2.5 py-0.5 rounded-md text-xs font-medium tracking-wide bg-surface-raised text-text-muted border border-border">
        Normal
      </span>
    );
  }

  const severityClasses = {
    severe: "severity-badge-severe",
    moderate: "severity-badge-moderate",
    mild: "severity-badge-mild",
  };

  return <span className={`${severityClasses[severity]} capitalize`}>{severity}</span>;
}
