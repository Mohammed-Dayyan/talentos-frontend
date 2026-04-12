import { cn } from '@/lib/utils'
type Status = 'applied' | 'scoring' | 'shortlisted' | 'interview' | 'offer' | 'hired' | 'rejected' | 'on_hold'
const statusConfig: Record<Status, { label: string; className: string }> = {
  applied: { label: 'Applied', className: 'bg-slate-100 text-slate-700' },
  scoring: { label: 'Scoring', className: 'bg-blue-100 text-blue-700' },
  shortlisted: { label: 'Shortlisted', className: 'bg-indigo-100 text-indigo-700' },
  interview: { label: 'Interview', className: 'bg-purple-100 text-purple-700' },
  offer: { label: 'Offer', className: 'bg-amber-100 text-amber-700' },
  hired: { label: 'Hired', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
  on_hold: { label: 'On Hold', className: 'bg-gray-100 text-gray-600' },
}
export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] ?? statusConfig.applied
  return <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', config.className)}>{config.label}</span>
}
