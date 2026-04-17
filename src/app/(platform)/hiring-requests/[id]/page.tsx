'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface HiringRequest {
  id: string;
  title: string;
  stream: string;
  band: string;
  designation?: string;
  status: string;
  urgency: string;
  application_count?: number;
  candidate_count?: number;
  careers_portal_link?: string;
  jd_draft?: string;
  jd_text?: string;
  created_at?: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  score?: number;
  status: string;
  is_referred?: boolean;
  referred_by?: string;
  source?: string;
}

interface AuditEvent {
  id: string;
  event_type: string;
  actor_email: string;
  summary: string;
  created_at: string;
}

interface Assignment {
  id: string;
  interviewer_email: string;
  slot_status: string;
  outcome_submitted: boolean;
  recommendation?: string;
}

interface Round {
  id: string;
  round_number: number;
  round_label: string;
  round_type: string;
  status: string;
  scheduled_at?: string;
  duration_minutes: number;
  assignments?: Assignment[];
  meetmind_result?: { ai_feedback_summary: string };
}

const urgencyConfig: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  priority: 'bg-amber-100 text-amber-700',
  standard: 'bg-gray-100 text-gray-600',
};

const stageConfig: Record<string, string> = {
  open: 'bg-slate-100 text-slate-700',
  scoring: 'bg-blue-100 text-blue-700',
  shortlisting: 'bg-indigo-100 text-indigo-700',
  interview: 'bg-purple-100 text-purple-700',
  offer: 'bg-amber-100 text-amber-700',
  closed: 'bg-green-100 text-green-700',
  application_ingestion: 'bg-slate-100 text-slate-700',
};

const PIPELINE_STAGES = [
  { label: 'Applied', status: 'applied', color: 'bg-slate-400' },
  { label: 'Scoring', status: 'scoring', color: 'bg-blue-400' },
  { label: 'Shortlisted', status: 'shortlisted', color: 'bg-indigo-500' },
  { label: 'Interview', status: 'interview', color: 'bg-purple-500' },
  { label: 'Offer', status: 'offer', color: 'bg-amber-500' },
  { label: 'Hired', status: 'hired', color: 'bg-green-500' },
];

const STATUS_BADGE: Record<string, string> = {
  applied: 'bg-slate-100 text-slate-700',
  scoring: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-indigo-100 text-indigo-700',
  interview: 'bg-purple-100 text-purple-700',
  offer: 'bg-amber-100 text-amber-700',
  hired: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const ROUND_STATUS_BADGE: Record<string, string> = {
  awaiting_slots: 'bg-yellow-100 text-yellow-800',
  slots_submitted: 'bg-blue-100 text-blue-800',
  scheduled: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

type Tab = 'overview' | 'participants' | 'interviews' | 'jd' | 'activity';

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

function ScoreBadge({ score }: { score?: number }) {
  if (score == null) return <span className="text-xs text-muted-foreground">—</span>;
  const color = score >= 80 ? 'bg-green-100 text-green-700' : score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{score}</span>;
}

export default function HiringRequestDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [request, setRequest] = useState<HiringRequest | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [expandedRounds, setExpandedRounds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [hrRes, candidatesRes, auditRes] = await Promise.all([
        fetch(`${API}/api/hiring-requests/${id}`, { credentials: 'include' }),
        fetch(`${API}/api/hiring-requests/${id}/applications`, { credentials: 'include' }),
        fetch(`${API}/api/audit?entity_type=hiring_request&entity_id=${id}&per_page=20`, { credentials: 'include' }),
      ]);

      if (hrRes.ok) setRequest(await hrRes.json());
      if (candidatesRes.ok) {
        const data = await candidatesRes.json();
        setCandidates(Array.isArray(data) ? data : data.items ?? []);
      }
      if (auditRes.ok) {
        const data = await auditRes.json();
        setAuditEvents(Array.isArray(data) ? data : data.items ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load interview rounds lazily when tab is clicked
  const loadRounds = useCallback(async () => {
    // Interview rounds are per-candidate, so we load a summary view from hiring request
    const r = await fetch(`${API}/api/hiring-requests/${id}/interview-rounds`, { credentials: 'include' });
    if (r.ok) {
      const data = await r.json();
      setRounds(Array.isArray(data) ? data : data.items ?? []);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (activeTab === 'interviews' && rounds.length === 0) loadRounds();
  }, [activeTab, loadRounds, rounds.length]);

  const toggleRound = (roundId: string) => {
    setExpandedRounds(prev => {
      const next = new Set(prev);
      next.has(roundId) ? next.delete(roundId) : next.add(roundId);
      return next;
    });
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-4 bg-muted rounded w-32 mb-4" />
          <div className="bg-white border border-border rounded-lg p-5 mb-4">
            <div className="h-6 bg-muted rounded w-64 mb-2" />
            <div className="h-4 bg-muted rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p className="text-sm">Hiring request not found.</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'participants', label: `Participants (${candidates.length})` },
    { id: 'interviews', label: 'Interviews' },
    { id: 'jd', label: 'JD' },
    { id: 'activity', label: 'Activity' },
  ];

  const totalCandidates = request.application_count ?? request.candidate_count ?? candidates.length;
  const jdContent = request.jd_draft ?? request.jd_text ?? '';

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 pb-0 max-w-4xl mx-auto">
        <Link
          href="/hiring-requests"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Hiring Requests
        </Link>

        {/* Header card */}
        <div className="bg-white border border-border rounded-lg p-5 mb-4">
          <h1 className="text-xl font-bold text-foreground">{request.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {request.stream}{request.band ? ` · ${request.band}` : ''}{request.designation ? ` · ${request.designation}` : ''}
          </p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${stageConfig[request.status] ?? stageConfig.open}`}>
              {request.status.replace(/_/g, ' ')}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${urgencyConfig[request.urgency] ?? 'bg-gray-100 text-gray-600'}`}>
              {request.urgency}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users size={12} /> {totalCandidates} total
            </span>
            {request.careers_portal_link && (
              <a
                href={request.careers_portal_link}
                target="_blank"
                rel="noreferrer"
                className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                Careers Link
              </a>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 pt-5 max-w-4xl mx-auto">
        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {request.careers_portal_link && (
              <div className="bg-white border border-border rounded-lg p-5">
                <h2 className="text-sm font-semibold mb-2 text-foreground">Career Portal</h2>
                <a
                  href={request.careers_portal_link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-indigo-700 hover:underline break-all"
                >
                  {request.careers_portal_link}
                </a>
              </div>
            )}
            <div className="bg-white border border-border rounded-lg p-5">
              <h2 className="text-sm font-semibold mb-4 text-foreground">Pipeline Summary</h2>
              <div className="grid grid-cols-3 gap-3">
                {PIPELINE_STAGES.map(stage => {
                  const count = candidates.filter(c => c.status === stage.status).length;
                  return (
                    <div key={stage.status} className="border border-border rounded-lg p-3 text-center">
                      <div className={`w-2 h-2 rounded-full ${stage.color} mx-auto mb-2`} />
                      <p className="text-xl font-bold text-foreground">{count}</p>
                      <p className="text-xs text-muted-foreground">{stage.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 text-sm text-indigo-700">
              💬 To take action on this request, start a conversation with TalentOS in Chat.
            </div>
          </div>
        )}

        {/* Participants tab */}
        {activeTab === 'participants' && (
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            {candidates.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">No candidates yet for this role.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Referral</th>
                  </tr>
                </thead>
                <tbody>
                  {[...candidates]
                    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
                    .map((c, i) => (
                      <tr key={c.id} className="border-t border-border hover:bg-indigo-50/30 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground text-sm">{i + 1}</td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/hiring-requests/${id}/participants/${c.id}`}
                            className="font-medium text-foreground hover:text-indigo-700 transition-colors"
                          >
                            {c.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                        <td className="px-4 py-3"><ScoreBadge score={c.score} /></td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_BADGE[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {c.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {c.is_referred ? (
                            <span className="text-xs text-indigo-600 font-medium">
                              Referred{c.referred_by ? ` by ${c.referred_by}` : ''}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">{c.source ?? '—'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Interviews tab */}
        {activeTab === 'interviews' && (
          <div className="space-y-3">
            {rounds.length === 0 ? (
              <div className="bg-white border border-border rounded-lg py-12 text-center text-muted-foreground text-sm">
                No interview rounds scheduled for this request.
              </div>
            ) : rounds.map(round => {
              const isExpanded = expandedRounds.has(round.id);
              return (
                <div key={round.id} className="bg-white border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        Round {round.round_number}: {round.round_label}
                        <span className="text-xs text-muted-foreground font-normal ml-1.5 capitalize">({round.round_type})</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{round.duration_minutes} min</p>
                      {round.scheduled_at && (
                        <p className="text-xs text-foreground mt-1">📅 {new Date(round.scheduled_at).toLocaleString('en-IN')}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${ROUND_STATUS_BADGE[round.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {round.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {round.assignments && round.assignments.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {round.assignments.map(a => (
                        <div key={a.id} className="flex gap-3 text-xs text-muted-foreground border-t border-border pt-1.5">
                          <span className="text-foreground font-medium">{a.interviewer_email}</span>
                          <span className={`px-1.5 rounded capitalize ${ROUND_STATUS_BADGE[a.slot_status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {a.slot_status.replace(/_/g, ' ')}
                          </span>
                          {a.outcome_submitted && (
                            <span className={`px-1.5 rounded capitalize ${a.recommendation === 'advance' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {a.recommendation}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {round.meetmind_result?.ai_feedback_summary && (
                    <div className="mt-2">
                      <button
                        onClick={() => toggleRound(round.id)}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        {isExpanded ? '▲ Hide' : '▼ Show'} AI Feedback
                      </button>
                      {isExpanded && (
                        <p className="mt-1 text-sm bg-slate-50 border border-border rounded p-2 text-foreground">
                          {round.meetmind_result.ai_feedback_summary}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* JD tab */}
        {activeTab === 'jd' && (
          <div className="bg-white border border-border rounded-lg p-6">
            {jdContent ? (
              <div className="prose prose-sm max-w-none">
                {jdContent.split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={i} className="font-bold text-foreground mt-4 mb-1">{line.replace(/\*\*/g, '')}</p>;
                  }
                  if (line.startsWith('- ')) {
                    return (
                      <p key={i} className="text-sm text-foreground ml-4 flex gap-2 mb-0.5">
                        <span>•</span><span>{line.slice(2)}</span>
                      </p>
                    );
                  }
                  if (line.trim() === '') return <div key={i} className="h-2" />;
                  return <p key={i} className="text-sm text-foreground">{line}</p>;
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No JD available for this request.</p>
            )}
          </div>
        )}

        {/* Activity tab */}
        {activeTab === 'activity' && (
          <div className="bg-white border border-border rounded-lg p-5">
            <h2 className="text-sm font-semibold mb-4">Audit Trail</h2>
            {auditEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No activity recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {auditEvents.map(event => (
                  <div key={event.id} className="flex gap-3 text-xs border-l-2 border-border pl-3">
                    <span className="text-muted-foreground w-44 shrink-0" title={new Date(event.created_at).toLocaleString('en-IN')}>
                      {formatTime(event.created_at)}
                    </span>
                    <span className="text-indigo-600 shrink-0 font-medium">{event.actor_email}</span>
                    <span className="text-foreground">{event.summary}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
