'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface OfferTemplate {
  id: string; name: string; employment_type: string; version: number; is_default: boolean;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<OfferTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${API}/api/admin/offer-templates`, { credentials: 'include' })
      .then(r => r.json()).then(setTemplates).finally(() => setLoading(false));
  }, []);
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Offer Templates</h1>
        <Link href="/settings/templates/new" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700">+ New Template</Link>
      </div>
      {loading ? <p className="text-gray-500">Loading...</p> : (
        <table className="w-full text-sm border-collapse">
          <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 pr-4">Name</th><th className="pb-2 pr-4">Type</th><th className="pb-2 pr-4">Version</th><th className="pb-2 pr-4">Default</th><th className="pb-2"></th></tr></thead>
          <tbody>
            {templates.map(t => (
              <tr key={t.id} className="border-b">
                <td className="py-2 pr-4 font-medium">{t.name}</td>
                <td className="py-2 pr-4 text-gray-600 capitalize">{t.employment_type.replace('_',' ')}</td>
                <td className="py-2 pr-4 text-gray-600">v{t.version}</td>
                <td className="py-2 pr-4">{t.is_default && <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Default</span>}</td>
                <td className="py-2"><Link href={`/settings/templates/${t.id}`} className="text-indigo-600 hover:underline">Edit</Link></td>
              </tr>
            ))}
            {!templates.length && <tr><td colSpan={5} className="py-8 text-center text-gray-400">No templates yet.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}
