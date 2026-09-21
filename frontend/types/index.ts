export type Severity = "severe" | "moderate" | "mild" | "none";
export type Role = "patient" | "doctor" | "admin";

export interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: Role;
}

export interface CaseSymptoms {
  age?: number;
  weight?: number;
  sex?: string;
  date_of_birth?: string | null;
  blood_group?: string;
  existing_conditions?: string[];
  current_medications?: string;
  fever?: boolean;
  fever_days?: number | null;
  cough_type?: string;
  breathing_difficulty?: number;
  chest_pain?: boolean;
  symptom_duration_days?: number;
}

export interface CaseDetail {
  id: string;
  patient_id: string;
  primary_doctor_id?: string | null;
  status: string;
  ai_confidence: number | null;
  ai_severity: Severity | null;
  ai_type: string | null;
  ai_raw_output?: unknown;
  xray_url: string;
  gradcam_url?: string | null;
  doctor_verdict?: string;
  doctor_severity?: string;
  doctor_type?: string;
  doctor_notes?: string;
  symptoms?: CaseSymptoms;
  created_at: string;
  updated_at?: string;
}

export interface Prescription {
  id: string;
  case_id: string;
  llm_draft: { draft: string };
  final_prescription?: unknown;
  is_verified: boolean;
  verified_at?: string | null;
}

export interface SecondOpinion {
  id: string;
  status: "pending" | "submitted";
  reason?: string;
  specialty_requested?: string;
  verdict?: string;
  verdict_notes?: string;
  agrees_with_primary?: boolean | null;
}


