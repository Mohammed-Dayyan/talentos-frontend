export interface Schedule {
  candidate: { name: string };
  role: { title: string };
  round: { round_label: string; duration_minutes: number };
  interviewer: { email: string };
  expires_at: string;
}

export interface Slot {
  start: string;
  end: string;
  preference_rank: number;
}

export interface OfferTemplate {
  id: string;
  name: string;
  description: string;
  employment_type: string;
  html_content: string;
  required_variables: string[];
  optional_variables: string[];
  is_default: boolean;
  version: number;
  created_at: string;
}

export interface CompensationBreakdown {
  basic: number;
  hra: number;
  special_allowance: number;
  lta: number;
  employee_pf: number;
  employer_pf: number;
  monthly_gross: number;
}

export interface Offer {
  id: string;
  status: string;
  annual_ctc: number;
  compensation_breakdown: CompensationBreakdown;
  document_storage_key?: string;
  dispatched_at?: string;
  candidate_response?: string;
  created_at: string;
}
