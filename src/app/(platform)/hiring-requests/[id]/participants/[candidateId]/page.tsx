'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Assignment { id: string; interviewer_email: string; slot_status: string; outcome_submitted: boolean; recommendation?: string; }
interface Round { id: string; round_number: number; round_label: string; round_type: string; duration_minutes: number; status: string; calendar_event_link?: string; scheduled_at?: string; assignments?: Assignment[]; meetmind_result?: { ai_feedback_summary: string }; }
interface Offer { id: string; status: string; annual_ctc: number; compensation_breakdown: Record<string,number>; document_storage_key?: string; created_at: string; }

const SC: Record<string,string> = { awaiting_slots:'bg-yellow-100 text-yellow-800', slots_submitted:'bg-blue-100 text-blue-800', scheduled:'bg-green-100 text-green-800', completed:'bg-gray-100 text-gray-700', pending:'bg-gray-100 text-gray-500', submitted:'bg-blue-100 text-blue-700' };
const OC: Record<string,string> = { pending_approval:'bg-yellow-100 text-yellow-800', approved:'bg-blue-100 text-blue-800', dispatched:'bg-green-100 text-green-800', accepted:'bg-emerald-100 text-emerald-800', rejected:'bg-red-100 text-red-800' };

export default function CandidateDetailPage({ params }: { params: { id: string; candidateId: string } }) {
  const { candidateId } = params;
  const [rounds, setRounds] = useState<Round[]>([]);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/candidates/${candidateId}/interview-rounds`, { credentials:'include' }).then(r=>r.ok?r.json():[]),
      fetch(`${API}/api/candidates/${candidateId}/offers`, { credentials:'include' }).then(r=>r.ok?r.json():null),
    ]).then(([r, o]) => {
      setRounds(Array.isArray(r) ? r : r?.items || []);
      setOffer(Array.isArray(o) ? o[0] || null : o);
    }).finally(() => setLoading(false));
  }, [candidateId]);

  const toggle = (id: string) => setExpanded(p => { const n = new Set(p); n.has(id)?n.delete(id):n.add(id); return n; });
  const inr = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-4">Interview Rounds</h2>
        {!rounds.length ? <p className="text-gray-400 text-sm">No interview rounds yet.</p> : rounds.map(round => (
          <div key={round.id} className="border rounded-lg p-4 mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-sm">Round {round.round_number}: {round.round_label} <span className="text-xs text-gray-500 capitalize ml-1">({round.round_type})</span></span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${SC[round.status]||'bg-gray-100'}`}>{round.status.replace(/_/g,' ')}</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">{round.duration_minutes} min</p>
            {round.status==='scheduled' && round.scheduled_at && (
              <p className="text-sm mb-2">📅 {new Date(round.scheduled_at).toLocaleString('en-IN')} {round.calendar_event_link && <a href={round.calendar_event_link} target="_blank" rel="noreferrer" className="ml-2 text-indigo-600 text-xs hover:underline">View Event</a>}</p>
            )}
            {round.assignments?.map(a => (
              <div key={a.id} className="flex gap-4 text-xs text-gray-600 py-1 border-t">
                <span>{a.interviewer_email}</span>
                <span className={`px-1.5 rounded ${SC[a.slot_status]||''}`}>{a.slot_status}</span>
                {a.outcome_submitted && <span className={`px-1.5 rounded ${a.recommendation==='advance'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{a.recommendation}</span>}
              </div>
            ))}
            {round.meetmind_result?.ai_feedback_summary && (
              <div className="mt-2">
                <button onClick={()=>toggle(round.id)} className="text-xs text-indigo-600 hover:underline">{expanded.has(round.id)?'▲ Hide':'▼ Show'} AI Feedback</button>
                {expanded.has(round.id) && <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{round.meetmind_result.ai_feedback_summary}</p>}
              </div>
            )}
          </div>
        ))}
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-4">Offer</h2>
        {!offer ? <p className="text-gray-400 text-sm">No offer generated yet.</p> : (
          <div className="border rounded-lg p-4">
            <div className="flex justify-between mb-3">
              <span className={`text-sm px-2 py-0.5 rounded-full ${OC[offer.status]||'bg-gray-100'}`}>{offer.status.replace(/_/g,' ')}</span>
              <span className="text-xs text-gray-400">{new Date(offer.created_at).toLocaleDateString('en-IN')}</span>
            </div>
            <p className="text-2xl font-bold mb-3">{inr(offer.annual_ctc)} <span className="text-sm font-normal text-gray-500">/ year</span></p>
            {offer.compensation_breakdown && (
              <table className="w-full text-sm mb-3">
                <thead><tr className="border-b text-xs text-gray-500"><th className="text-left pb-1">Component</th><th className="text-right pb-1">Monthly</th><th className="text-right pb-1">Annual</th></tr></thead>
                <tbody>{Object.entries(offer.compensation_breakdown).map(([k,v])=>(
                  <tr key={k} className="border-b"><td className="py-1 capitalize">{k.replace(/_/g,' ')}</td><td className="py-1 text-right">{inr(Number(v))}</td><td className="py-1 text-right">{inr(Number(v)*12)}</td></tr>
                ))}</tbody>
              </table>
            )}
            {offer.document_storage_key && <a href={`${API}/api/offers/${offer.id}/document`} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline border border-indigo-200 px-3 py-1.5 rounded inline-block">📄 View Offer Letter</a>}
          </div>
        )}
      </section>
    </div>
  );
}
