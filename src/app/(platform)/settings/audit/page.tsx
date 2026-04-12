'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface AuditEvent {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  actor_email: string;
  summary: string;
  payload?: Record<string, unknown>;
  created_at: string;
}

interface AuditResponse {
  items: AuditEvent[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  created: 'bg-green-100 text-green-700',
  updated: 'bg-blue-100 text-blue-700',
  deleted: 'bg-red-100 text-red-700',
  status_changed: 'bg-purple-100 text-purple-700',
  completed: 'bg-indigo-100 text-indigo-700',
  dispatched: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  reopened: 'bg-slate-100 text-slate-700',
};

const ENTITY_DETAIL_ROUTES: Record<string, (id: string) => string> = {
  hiring_request: id => `/hiring-requests/${id}`,
  candidate_application: id => `/hiring-requests/-/participants/${id}`,
};

function relativeTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

function absoluteTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AuditPage() {
  const router = useRouter();

  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Filters
  const [eventType, setEventType] = useState('');
  const [entityType, setEntityType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [actorSearch, setActorSearch] = useState('');

  const fetchAudit = useCallback(async (currentPage: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(currentPage), per_page: '20' });
      if (eventType) params.set('event_type', eventType);
      if (entityType) params.set('entity_type', entityType);
      if (fromDate) params.set('from_date', fromDate);
      if (toDate) params.set('to_date', toDate);
      if (actorSearch) params.set('actor', actorSearch);

      const r = await fetch(`${API}/api/audit?${params}`, { credentials: 'include' });
      if (r.status === 401) { router.push('/login'); return; }
      if (r.ok) {
        const data: AuditResponse = await r.json();
        setEvents(data.items ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.total_pages ?? 1);
      }
    } finally {
      setLoading(false);
    }
  }, [eventType, entityType, fromDate, toDate, actorSearch, router]);

  useEffect(() => {
    fetchAudit(page);
  }, [fetchAudit, page]);

  const applyFilters = () => {
    setPage(1);
    fetchAudit(1);
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? 'Loading…' : `${total} event${total !== 1 ? 's' : ''} total`}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-border rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-muted-foreground font-medium block mb-1">Event Type</label>
            <select
              value={eventType}
              onChange={e => setEventType(e.target.value)}
              className="border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              <option value="">All</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="deleted">Deleted</option>
              <option value="status_changed">Status Changed</option>
              <option value="completed">Completed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="dispatched">Dispatched</option>
              <option value="reopened">Reopened</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-medium block mb-1">Entity Type</label>
            <select
              value={entityType}
              onChange={e => setEntityType(e.target.value)}
              className="border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              <option value="">All</option>
              <option value="hiring_request">Hiring Request</option>
              <option value="candidate_application">Candidate Application</option>
              <option value="interview_round">Interview Round</option>
              <option value="offer">Offer</option>
              <option value="platform_user">Platform User</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-medium block mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-medium block mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-medium block mb-1">Actor</label>
            <input
              type="text"
              value={actorSearch}
              onChange={e => setActorSearch(e.target.value)}
              placeholder="Search by email…"
              className="border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48"
            />
          </div>

          <button
            onClick={applyFilters}
            className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Apply
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Event</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Summary</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground animate-pulse">
                    Loading events…
                  </td>
                </tr>
              )}
              {!loading && events.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No audit events found.
                  </td>
                </tr>
              )}
              {!loading && events.map(event => {
                const isExpanded = expandedRows.has(event.id);
                const detailRoute = ENTITY_DETAIL_ROUTES[event.entity_type]?.(event.entity_id);
                return (
                  <>
                    <tr
                      key={event.id}
                      onClick={() => toggleRow(event.id)}
                      className="border-t border-border hover:bg-indigo-50/30 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        <span title={absoluteTime(event.created_at)}>
                          {relativeTime(event.created_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-indigo-600 font-medium whitespace-nowrap">
                        {event.actor_email}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${EVENT_TYPE_COLORS[event.event_type] ?? 'bg-gray-100 text-gray-600'}`}>
                          {event.event_type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <span className="capitalize">{event.entity_type.replace(/_/g, ' ')}</span>
                        {event.entity_id && (
                          <>
                            {' '}
                            {detailRoute ? (
                              <a
                                href={detailRoute}
                                onClick={e => e.stopPropagation()}
                                className="text-indigo-600 hover:underline font-mono"
                              >
                                {event.entity_id.slice(0, 8)}…
                              </a>
                            ) : (
                              <span className="font-mono">{event.entity_id.slice(0, 8)}…</span>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground max-w-xs truncate">
                        {event.summary}
                      </td>
                    </tr>
                    {isExpanded && event.payload && (
                      <tr key={`${event.id}-payload`} className="border-t border-border bg-slate-50">
                        <td colSpan={5} className="px-4 py-3">
                          <pre className="text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap bg-white border border-border rounded p-3 max-h-64">
                            {JSON.stringify(event.payload, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 px-3 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 px-3 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
