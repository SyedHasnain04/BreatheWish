import React from "react";

interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const norm = (status || "").toLowerCase().replace("-", "_");

  const getBadgeClass = () => {
    switch (norm) {
      case "verified":
      case "completed":
      case "closed":
        return "bg-verified-bg text-verified border-verified/30";
      case "second_opinion":
      case "second_opinion_requested":
      case "second_opinion_received":
        return "bg-surface-raised text-doctor-accent border-border";
      case "in_review":
      case "under_review":
      case "pending":
      case "prescription_draft":
        return "bg-moderate-bg text-moderate-soft border-moderate/30";
      default:
        return "bg-surface-raised text-text-muted border-border";
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-mono tabular font-medium border ${getBadgeClass()} capitalize`}>
      {norm.replace(/_/g, " ")}
    </span>
  );
}
