'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle } from 'lucide-react'

export default function ReferralPage() {
  const [form, setForm] = useState({ referrerName: '', referrerEmail: '', candidateName: '', candidatePhone: '', note: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true) }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center py-6">
          <span className="font-bold text-2xl" style={{ color: '#4338ca' }}>TalentOS</span>
          <span className="text-sm text-muted-foreground ml-2">by Webknot</span>
        </div>

        {!submitted ? (
          <div className="bg-white rounded-2xl border border-border shadow-panel p-6">
            <div className="mb-5">
              <h1 className="text-lg font-bold">Refer a Candidate</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">Senior Software Engineer</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Developer · B7H</span>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Priority</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Your Name</label>
                <Input placeholder="John D'souza" value={form.referrerName} onChange={e => setForm({...form, referrerName: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Your Webknot Email</label>
                <Input type="email" placeholder="you@webknot.in" value={form.referrerEmail} onChange={e => setForm({...form, referrerEmail: e.target.value})} required />
                <p className="text-xs text-muted-foreground mt-0.5">Must be a @webknot.in address</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Candidate Name</label>
                <Input placeholder="Rahul Sharma" value={form.candidateName} onChange={e => setForm({...form, candidateName: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Candidate Phone</label>
                <Input type="tel" placeholder="+91 98765 43210" value={form.candidatePhone} onChange={e => setForm({...form, candidatePhone: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Why are they a good fit?</label>
                <Textarea placeholder="Brief note about their background and why they'd be great for this role..." value={form.note} onChange={e => setForm({...form, note: e.target.value})} className="min-h-[80px]" />
              </div>
              <Button type="submit" className="w-full">Submit Referral</Button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border shadow-panel p-8 text-center">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">Thanks for the referral!</h2>
            <p className="text-sm text-muted-foreground">We'll keep you posted on <strong>{form.candidateName || 'your candidate'}</strong>'s progress via email.</p>
          </div>
        )}
      </div>
    </div>
  )
}
