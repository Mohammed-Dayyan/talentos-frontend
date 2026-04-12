'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type CardType = 'text' | 'candidate_table' | 'action_card' | 'status'

type ActionItem = {
  label: string
  variant: 'primary' | 'outline' | 'danger'
}

interface Candidate {
  id: string
  name: string
  score: number
  status: string
  isReferred: boolean
  referredBy?: string | null
}

interface AgentMessageCardProps {
  type: CardType
  content: string
  data?: {
    candidates?: Candidate[]
    names?: string[]
    action?: string
    actions?: ActionItem[]
    [key: string]: unknown
  }
  timestamp?: string
}

function formatTime(iso?: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-green-100 text-green-700' : score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
  const dot = score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold', color)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', dot)} />
      {score}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    applied: 'bg-slate-100 text-slate-700',
    scoring: 'bg-blue-100 text-blue-700',
    shortlisted: 'bg-indigo-100 text-indigo-700',
    interview: 'bg-purple-100 text-purple-700',
    offer: 'bg-amber-100 text-amber-700',
    hired: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }
  const className = config[status] ?? 'bg-gray-100 text-gray-600'
  return <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize', className)}>{status}</span>
}

function ReferralTag({ isReferred, referredBy }: { isReferred: boolean; referredBy?: string | null }) {
  if (!isReferred) return null
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-violet-100 text-violet-700">
      <span>Referred</span>
      {referredBy && <span className="opacity-70">by {referredBy}</span>}
    </span>
  )
}

export function AgentMessageCard({ type, content, data, timestamp }: AgentMessageCardProps) {
  const [chosenAction, setChosenAction] = useState<string | null>(null)

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[85%]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center text-white text-[10px] font-bold">T</div>
          <span className="text-xs text-muted-foreground font-medium">TalentOS</span>
          {timestamp && <span className="text-[10px] text-muted-foreground">{formatTime(timestamp)}</span>}
        </div>
        <div className="bg-white border border-border rounded-2xl rounded-tl-sm shadow-sm overflow-hidden">
          {content && (
            <div className="px-4 py-3 text-sm text-foreground leading-relaxed">{content}</div>
          )}

          {type === 'candidate_table' && data?.candidates && (
            <div className={cn('border-border', content ? 'border-t' : '')}>
              <table className="w-full text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium">#</th>
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium">Name</th>
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium">Score</th>
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium">Status</th>
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium">Tag</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.candidates as Candidate[]).map((c, i) => (
                    <tr key={c.id} className={cn('border-t border-border/50', i % 2 === 0 ? 'bg-white' : 'bg-muted/30')}>
                      <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-2 font-medium">{c.name}</td>
                      <td className="px-3 py-2"><ScoreBadge score={c.score} /></td>
                      <td className="px-3 py-2"><StatusBadge status={c.status} /></td>
                      <td className="px-3 py-2"><ReferralTag isReferred={c.isReferred} referredBy={c.referredBy} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {type === 'action_card' && data?.actions && (
            <div className={cn('px-4 py-3 border-border', content ? 'border-t' : '')}>
              {chosenAction ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-600 font-medium">✓ {chosenAction}</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(data.actions as ActionItem[]).map((action) => (
                    <button
                      key={action.label}
                      onClick={() => setChosenAction(action.label)}
                      className={cn(
                        'text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border',
                        action.variant === 'primary' && 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700',
                        action.variant === 'outline' && 'bg-white text-foreground border-border hover:bg-muted',
                        action.variant === 'danger' && 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
                      )}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-muted-foreground mt-2">Or type your response below</p>
            </div>
          )}

          {type === 'status' && (
            <div className={cn('px-4 py-2 border-border', content ? 'border-t' : '')}>
              <span className="text-xs text-green-600 font-medium">Done ✓</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
