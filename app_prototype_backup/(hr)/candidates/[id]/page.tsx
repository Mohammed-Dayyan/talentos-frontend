import { ScoreBadge } from '@/components/ui/score-badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { ReferralTag } from '@/components/ui/referral-tag'

export default function CandidateDetailPage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Rahul Sharma</h1>
            <p className="text-sm text-muted-foreground mt-0.5">rahul@gmail.com · +91 98765 43210</p>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status="shortlisted" />
              <ReferralTag isReferred={false} />
            </div>
          </div>
          <ScoreBadge score={87} />
        </div>

        {/* Score Breakdown */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold mb-4">Job-Fit Score Breakdown</h2>
          <div className="space-y-3">
            {[
              { label: 'Skill Match', score: 36, max: 40, color: 'bg-green-500' },
              { label: 'Experience Relevance', score: 30, max: 35, color: 'bg-blue-500' },
              { label: 'Qualifications', score: 21, max: 25, color: 'bg-indigo-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.score}/{item.max}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.score / item.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Strong React and Node.js skills match the role requirements well. 4 years of relevant experience exceeds the minimum threshold.</p>
        </div>

        {/* Resume */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold mb-3">Resume</h2>
          <div className="h-48 bg-muted/50 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground text-sm">
            Resume Preview (PDF)
          </div>
        </div>

        {/* Interview Rounds */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold mb-3">Interview Rounds</h2>
          <div className="flex items-center justify-between py-2 border border-border rounded-lg px-3">
            <div>
              <p className="text-sm font-medium">Technical Interview</p>
              <p className="text-xs text-muted-foreground">Scheduled Apr 10, 2026 · 2 interviewers</p>
            </div>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Scheduled</span>
          </div>
        </div>

        {/* Audit Trail */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold mb-3">Audit Trail</h2>
          <div className="space-y-3">
            {[
              { time: 'Apr 8, 2026 · 4:12 PM', actor: 'hr@webknot.in', event: 'Candidate shortlisted' },
              { time: 'Apr 8, 2026 · 2:30 PM', actor: 'system', event: 'Job-fit score computed: 87' },
              { time: 'Apr 8, 2026 · 2:28 PM', actor: 'system', event: 'Resume parsed successfully' },
              { time: 'Apr 8, 2026 · 11:00 AM', actor: 'system', event: 'Application ingested from careers portal' },
              { time: 'Apr 8, 2026 · 10:55 AM', actor: 'candidate', event: 'Application submitted' },
            ].map((e, i) => (
              <div key={i} className="flex gap-3 text-xs">
                <span className="text-muted-foreground w-36 shrink-0">{e.time}</span>
                <span className="text-muted-foreground shrink-0">{e.actor}</span>
                <span className="text-foreground">{e.event}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
