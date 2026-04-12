export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'hr' | 'employee'
}

export interface HiringRequest {
  id: string
  title: string
  stream: string
  band: string
  designation: string
  status:
    | 'draft'
    | 'active_internal'
    | 'active_external'
    | 'application_ingestion'
    | 'shortlisting'
    | 'interview'
    | 'offer'
    | 'closed'
  urgency_level: 'standard' | 'priority' | 'critical'
  employment_type: 'full_time' | 'internship'
  candidate_count?: number
  created_at: string
}

export interface Candidate {
  id: string
  name: string
  email: string
  phone?: string
  is_referred: boolean
  referred_by_email?: string
}

export interface CandidateApplication {
  id: string
  candidate: Candidate
  hiring_request_id: string
  status: 'applied' | 'scoring' | 'shortlisted' | 'interview' | 'offer' | 'hired' | 'rejected'
  job_fit_score?: number
  is_score_overridden: boolean
  override_score?: number
  submitted_at: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
}

export interface APIErrorResponse {
  error: string
  code: string
  details?: Record<string, unknown>
}
