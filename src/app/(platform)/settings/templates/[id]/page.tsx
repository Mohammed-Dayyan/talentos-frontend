'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const VARS = ['candidate_name','designation','annual_ctc','monthly_gross','basic','hra','special_allowance','lta','employee_pf','employer_pf','joining_bonus','offer_valid_until','role_title','joining_date'];

export default function EditTemplatePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [f, setF] = useState({ name:'', description:'', employment_type:'full_time', html_content:'', is_default:false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    fetch(`${API}/api/admin/offer-templates/${params.id}`, { credentials:'include' })
      .then(r=>r.json()).then(d=>setF({name:d.name,description:d.description||'',employment_type:d.employment_type,html_content:d.html_content,is_default:d.is_default}))
      .finally(()=>setLoading(false));
  }, [params.id]);
  const ins = (v: string) => setF(x=>({...x, html_content: x.html_content+`{{ ${v} }}`}));
  const submit = async () => {
    setSaving(true); setError('');
    try {
      const res = await fetch(`${API}/api/admin/offer-templates/${params.id}`, { method:'PATCH', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify(f) });
      if (!res.ok) throw new Error(await res.text());
      router.push('/settings/templates');
    } catch(e: unknown) { setError(e instanceof Error ? e.message : 'Error'); } finally { setSaving(false); }
  };
  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Template</h1>
      {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-1">Name</label><input className="w-full border rounded px-3 py-2 text-sm" value={f.name} onChange={e=>setF(x=>({...x,name:e.target.value}))} /></div>
        <div><label className="block text-sm font-medium mb-1">Description</label><input className="w-full border rounded px-3 py-2 text-sm" value={f.description} onChange={e=>setF(x=>({...x,description:e.target.value}))} /></div>
        <div><label className="block text-sm font-medium mb-1">Type</label>
          <select className="w-full border rounded px-3 py-2 text-sm" value={f.employment_type} onChange={e=>setF(x=>({...x,employment_type:e.target.value}))}>
            <option value="full_time">Full Time</option><option value="contract">Contract</option><option value="intern">Intern</option>
          </select>
        </div>
        <div>
          <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded border mb-2">{VARS.map(v=><button key={v} type="button" onClick={()=>ins(v)} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded hover:bg-indigo-100 font-mono">{`{{ ${v} }}`}</button>)}</div>
          <textarea className="w-full border rounded px-3 py-2 text-sm font-mono h-64" value={f.html_content} onChange={e=>setF(x=>({...x,html_content:e.target.value}))} />
        </div>
        <div className="flex items-center gap-2"><input type="checkbox" checked={f.is_default} onChange={e=>setF(x=>({...x,is_default:e.target.checked}))} /><label className="text-sm">Default template</label></div>
        <div className="flex gap-3"><button onClick={submit} disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">{saving?'Saving...':'Save'}</button><button onClick={()=>router.back()} className="border px-4 py-2 rounded text-sm">Cancel</button></div>
      </div>
    </div>
  );
}
