export type Severity = "severe" | "moderate" | "mild" | "none";
export type CaseStatus = "pending" | "completed" | "second_opinion" | "in_review";
export type Role = "patient" | "doctor" | "admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  specializations?: string[];
}

export interface Case {
  id: string;
  patient_id: string;
  doctor_id: string;
  image_url: string;
  status: CaseStatus;
  severity: Severity;
  confidence_score: number;
  heat_map_url?: string;
  findings?: string;
  created_at: string;
  updated_at: string;
}
