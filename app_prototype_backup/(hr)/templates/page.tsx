'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const VARS = ['{{candidate_name}}', '{{designation}}', '{{annual_ctc}}', '{{joining_date}}', '{{offer_valid_until}}', '{{monthly_gross}}', '{{basic}}', '{{hra}}']
const DUMMY_HTML = `<h1>Offer Letter</h1>
<p>Dear {{candidate_name}},</p>
<p>We are pleased to offer you the position of <strong>{{designation}}</strong> at Webknot Technologies.</p>
<p>Your annual CTC will be <strong>{{annual_ctc}}</strong>, effective from {{joining_date}}.</p>
<p>This offer is valid until {{offer_valid_until}}.</p>
<p>Regards,<br/>HR Team, Webknot Technologies</p>`

const templates = [
  { id: '1', name: 'Standard Full-Time Offer', type: 'full-time' },
  { id: '2', name: 'Internship Offer', type: 'internship' },
]

export default function TemplatesPage() {
  const [selected, setSelected] = useState('1')
  const [name, setName] = useState('Standard Full-Time Offer')
  const [html, setHtml] = useState(DUMMY_HTML)
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopyVar = (v: string) => { navigator.clipboard.writeText(v); setCopied(v); setTimeout(() => setCopied(null), 1500) }

  return (
    <div className="h-full overflow-hidden flex">
      {/* Templates list */}
      <div className="w-56 border-r border-border bg-muted/20 p-3 space-y-1 shrink-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-2">Templates</p>
        {templates.map(t => (
          <button key={t.id} onClick={() => setSelected(t.id)} className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selected === t.id ? 'bg-primary text-white' : 'hover:bg-muted'}`}>
            {t.name}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Template Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Available Variables (click to copy)</label>
            <div className="flex flex-wrap gap-1.5">
              {VARS.map(v => (
                <button key={v} onClick={() => handleCopyVar(v)} className={`text-xs px-2 py-1 rounded border font-mono transition-colors ${copied === v ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white border-border hover:bg-muted'}`}>
                  {copied === v ? 'Copied!' : v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">HTML Content</label>
            <Textarea value={html} onChange={e => setHtml(e.target.value)} className="min-h-[280px] font-mono text-xs" />
          </div>
          <div className="flex gap-2">
            <Button>Save Template</Button>
            <Button variant="outline">Preview</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
