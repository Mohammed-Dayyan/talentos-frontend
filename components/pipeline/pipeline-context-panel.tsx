import { HIRING_REQUESTS } from '@/lib/dummy-data'
import { HiringRequestCard } from './hiring-request-card'

export function PipelineContextPanel() {
  return (
    <div className="h-full flex flex-col bg-muted/30 border-l border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-foreground">Active Hiring</h2>
          <span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">{HIRING_REQUESTS.length}</span>
        </div>
        <p className="text-xs text-muted-foreground">4 open · 2 interviews · 1 offer pending</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {HIRING_REQUESTS.map(r => <HiringRequestCard key={r.id} request={r} />)}
      </div>
    </div>
  )
}
