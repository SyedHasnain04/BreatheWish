import React from "react";
import { Severity } from "../../types";

interface Props {
  severity: Severity;
}

export default function SeverityBadge({ severity }: Props) {
  if (severity === "none") {
    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Normal</span>;
  }
const severityClasses = {
    severe: "severity-badge-severe",
    moderate: "severity-badge-moderate",
    mild: "severity-badge-mild",
  };

  return <span className={`${severityClasses[severity]} capitalize`}>{severity}</span>;
}
