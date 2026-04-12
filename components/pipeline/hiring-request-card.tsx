import { Users } from 'lucide-react'
import type { HiringRequest } from '@/lib/dummy-data'
import { cn } from '@/lib/utils'

const urgencyConfig = {
  critical: 'bg-red-100 text-red-700',
  priority: 'bg-amber-100 text-amber-700',
  standard: 'bg-gray-100 text-gray-600',
}
const stageConfig: Record<string, string> = {
  open: 'bg-slate-100 text-slate-700',
  scoring: 'bg-blue-100 text-blue-700',
  shortlisting: 'bg-indigo-100 text-indigo-700',
  interview: 'bg-purple-100 text-purple-700',
  offer: 'bg-amber-100 text-amber-700',
  closed: 'bg-green-100 text-green-700',
}

export function HiringRequestCard({ request }: { request: HiringRequest }) {
  return (
    <div className="p-3 rounded-lg border border-border bg-white hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-foreground leading-snug">{request.title}</p>
        <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium shrink-0', urgencyConfig[request.urgency])}>
          {request.urgency}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">{request.stream} · {request.band}</span>
        <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', stageConfig[request.status] ?? stageConfig.open)}>
          {request.status}
        </span>
      </div>
      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
        <Users size={11} />
        <span>{request.candidateCount} candidates</span>
      </div>
    </div>
  )
}
