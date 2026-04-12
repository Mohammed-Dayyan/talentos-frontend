export type HiringRequest = {
  id: string; title: string; stream: string; band: string
  status: 'open' | 'scoring' | 'shortlisting' | 'interview' | 'offer' | 'closed'
  candidateCount: number; urgency: 'standard' | 'priority' | 'critical'
}
export type Candidate = {
  id: string; name: string; email: string; score: number
  status: 'applied' | 'scoring' | 'shortlisted' | 'interview' | 'offer' | 'hired' | 'rejected'
  isReferred: boolean; referredBy: string | null; hiringRequestId: string
}
export type ChatMessage = {
  id: string; role: 'hr' | 'agent'
  type?: 'text' | 'candidate_table' | 'confirmation' | 'status'
  content: string; data?: Record<string, unknown>
}
export type CompensationBreakdown = {
  annualCTC: number; monthlyGross: number; basic: number; hra: number
  specialAllowance: number; lta: number; employeePF: number; employerPF: number; netMonthly: number
}

export const HIRING_REQUESTS: HiringRequest[] = [
  { id: '1', title: 'Senior Software Engineer', stream: 'Developer', band: 'B7H', status: 'interview', candidateCount: 24, urgency: 'priority' },
  { id: '2', title: 'QA Engineer', stream: 'Quality Assurance', band: 'B7L', status: 'scoring', candidateCount: 18, urgency: 'standard' },
  { id: '3', title: 'Senior Designer', stream: 'UI/UX', band: 'B6', status: 'shortlisting', candidateCount: 11, urgency: 'standard' },
  { id: '4', title: 'AI/ML Engineer', stream: 'AI/ML', band: 'B7H', status: 'offer', candidateCount: 6, urgency: 'critical' },
]

export const CANDIDATES: Candidate[] = [
  { id: '1', name: 'Rahul Sharma', email: 'rahul@gmail.com', score: 87, status: 'shortlisted', isReferred: false, referredBy: null, hiringRequestId: '1' },
  { id: '2', name: 'Priya Nair', email: 'priya@outlook.com', score: 82, status: 'shortlisted', isReferred: true, referredBy: 'john@webknot.in', hiringRequestId: '1' },
  { id: '3', name: 'Arjun Mehta', email: 'arjun@gmail.com', score: 74, status: 'interview', isReferred: false, referredBy: null, hiringRequestId: '1' },
  { id: '4', name: 'Sneha Reddy', email: 'sneha@yahoo.com', score: 68, status: 'scoring', isReferred: true, referredBy: 'priya@webknot.in', hiringRequestId: '1' },
  { id: '5', name: 'Vikram Iyer', email: 'vikram@gmail.com', score: 61, status: 'applied', isReferred: false, referredBy: null, hiringRequestId: '1' },
]

export const CHAT_MESSAGES: ChatMessage[] = [
  { id: '1', role: 'hr', type: 'text', content: 'Show me the top candidates for the Senior Software Engineer role' },
  { id: '2', role: 'agent', type: 'candidate_table', content: 'Here are the top 5 candidates for Senior Software Engineer (Developer B7H), ranked by job-fit score:', data: { candidates: CANDIDATES, hiringRequestId: '1' } },
  { id: '3', role: 'hr', type: 'text', content: 'Shortlist Rahul and Priya' },
  { id: '4', role: 'agent', type: 'confirmation', content: "I've shortlisted 2 candidates for Senior Software Engineer:", data: { names: ['Rahul Sharma', 'Priya Nair'], action: 'confirm_shortlist' } },
]

export const COMPENSATION_18LPA: CompensationBreakdown = {
  annualCTC: 1800000, monthlyGross: 143640, basic: 71820, hra: 17955,
  specialAllowance: 10773, lta: 7182, employeePF: 1800, employerPF: 1800, netMonthly: 139240,
}
