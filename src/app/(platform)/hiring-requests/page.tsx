'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { Suspense } from 'react';

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
}

interface HiringRequestsResponse {
  items: HiringRequest[];
  total: number;
  page: number;
  per_page: number;
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

function SkeletonRow() {
  return (
    <tr className="border-t border-border animate-pulse">
      {[1, 2, 3, 4, 5].map(i => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-4 bg-muted rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

function HiringRequestsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [requests, setRequests] = useState<HiringRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter state from URL params
  const [status, setStatus] = useState(searchParams.get('status') ?? '');
  const [stream, setStream] = useState(searchParams.get('stream') ?? '');
  const [urgency, setUrgency] = useState(searchParams.get('urgency') ?? '');

  const fetchRequests = useCallback(async (s: string, st: string, u: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: '1', per_page: '20' });
      if (s) params.set('status', s);
      if (st) params.set('stream', st);
      if (u) params.set('urgency', u);
      const r = await fetch(`${API}/api/hiring-requests?${params}`, { credentials: 'include' });
      if (r.ok) {
        const data: HiringRequestsResponse = await r.json();
        setRequests(data.items ?? []);
        setTotal(data.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(status, stream, urgency);
  }, [fetchRequests, status, stream, urgency]);

  const applyFilters = (newStatus: string, newStream: string, newUrgency: string) => {
    const params = new URLSearchParams();
    if (newStatus) params.set('status', newStatus);
    if (newStream) params.set('stream', newStream);
    if (newUrgency) params.set('urgency', newUrgency);
    router.replace(`/hiring-requests?${params}`);
  };

  const handleStatusChange = (v: string) => { setStatus(v); applyFilters(v, stream, urgency); };
  const handleStreamChange = (v: string) => { setStream(v); applyFilters(status, v, urgency); };
  const handleUrgencyChange = (v: string) => { setUrgency(v); applyFilters(status, stream, v); };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Hiring Requests</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? 'Loading…' : `${total} active request${total !== 1 ? 's' : ''}`}
            {' '}· Read-only view — start a chat to make changes
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <select
            value={status}
            onChange={e => handleStatusChange(e.target.value)}
            className="border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-foreground"
          >
            <option value="">All stages</option>
            <option value="open">Open</option>
            <option value="scoring">Scoring</option>
            <option value="shortlisting">Shortlisting</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="closed">Closed</option>
          </select>

          <input
            type="text"
            value={stream}
            onChange={e => handleStreamChange(e.target.value)}
            placeholder="Filter by stream…"
            className="border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <select
            value={urgency}
            onChange={e => handleUrgencyChange(e.target.value)}
            className="border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-foreground"
          >
            <option value="">All urgencies</option>
            <option value="standard">Standard</option>
            <option value="priority">Priority</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Position</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stream · Band</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Urgency</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Candidates</th>
              </tr>
            </thead>
            <tbody>
              {loading && [1, 2, 3].map(i => <SkeletonRow key={i} />)}
              {!loading && requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No hiring requests found.
                  </td>
                </tr>
              )}
              {!loading && requests.map((req) => (
                <tr
                  key={req.id}
                  className="border-t border-border hover:bg-indigo-50/40 transition-colors group cursor-pointer"
                >
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/hiring-requests/${req.id}`}
                      className="text-sm font-semibold text-foreground group-hover:text-indigo-700 transition-colors"
                    >
                      {req.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground">
                    {req.stream}{req.band ? ` · ${req.band}` : ''}{req.designation ? ` · ${req.designation}` : ''}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${stageConfig[req.status] ?? stageConfig.open}`}>
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${urgencyConfig[req.urgency] ?? 'bg-gray-100 text-gray-600'}`}>
                      {req.urgency}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users size={13} />
                      {req.application_count ?? req.candidate_count ?? 0}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function HiringRequestsPage() {
  return (
    <Suspense>
      <HiringRequestsContent />
    </Suspense>
  );
}
