import React from "react";
import { CaseStatus } from "../../types";

interface Props {
  status: CaseStatus;
}

export default function StatusBadge({ status }: Props) {
  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "second_opinion":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "in_review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()} capitalize`}>
      {status.replace("_", " ")}
    </span>
  );
}
