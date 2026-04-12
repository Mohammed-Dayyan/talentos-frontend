'use client'
import { useState } from 'react'
import { ScoreBadge } from '@/components/ui/score-badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { ReferralTag } from '@/components/ui/referral-tag'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Candidate } from '@/lib/dummy-data'

type CardType = 'text' | 'candidate_table' | 'confirmation' | 'status'

interface AgentMessageCardProps {
  type: CardType
  content: string
  data?: { candidates?: Candidate[]; names?: string[]; action?: string; [key: string]: unknown }
}

export function AgentMessageCard({ type, content, data }: AgentMessageCardProps) {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[85%]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-primary-700 flex items-center justify-center text-white text-xs font-bold">A</div>
          <span className="text-xs text-muted-foreground">TalentOS</span>
        </div>
        <div className="bg-white border border-border rounded-2xl rounded-tl-sm shadow-card overflow-hidden">
          <div className="px-4 py-3 text-sm text-foreground">{content}</div>

          {type === 'candidate_table' && data?.candidates && (
            <div className="border-t border-border">
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
                  {(data?.candidates as Candidate[] | undefined ?? []).map((c, i) => (
                    <tr key={c.id} className={cn("border-t border-border/50", i % 2 === 0 ? "bg-white" : "bg-muted/30")}>
                      <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-2 font-medium">{c.name}</td>
                      <td className="px-3 py-2"><ScoreBadge score={c.score} /></td>
                      <td className="px-3 py-2"><StatusBadge status={c.status} /></td>
                      <td className="px-3 py-2"><ReferralTag isReferred={c.isReferred} referredBy={c.referredBy} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-3 py-2 border-t border-border/50">
                <Button variant="ghost" size="sm" className="text-primary text-xs">View All Candidates</Button>
              </div>
            </div>
          )}

          {type === 'confirmation' && data?.names && (
            <div className="border-t border-border px-4 py-3">
              <ul className="text-sm mb-3 space-y-1">
                {(data?.names as string[] | undefined ?? []).map(name => (
                  <li key={name} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {name}
                  </li>
                ))}
              </ul>
              {!confirmed ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setConfirmed(true)}>Confirm</Button>
                  <Button size="sm" variant="outline">Cancel</Button>
                </div>
              ) : (
                <span className="text-xs text-success font-medium">Confirmed</span>
              )}
            </div>
          )}

          {type === 'status' && (
            <div className="border-t border-border px-4 py-2">
              <span className="text-xs text-success font-medium">Done</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
