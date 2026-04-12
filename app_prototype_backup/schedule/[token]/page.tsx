'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, Plus, X } from 'lucide-react'

type Slot = { id: string; date: string; start: string; end: string }

export default function SchedulePage() {
  const [slots, setSlots] = useState<Slot[]>([{ id: '1', date: '', start: '', end: '' }])
  const [submitted, setSubmitted] = useState(false)

  const addSlot = () => { if (slots.length < 5) setSlots([...slots, { id: Date.now().toString(), date: '', start: '', end: '' }]) }
  const removeSlot = (id: string) => setSlots(slots.filter(s => s.id !== id))
  const updateSlot = (id: string, field: keyof Slot, value: string) => setSlots(slots.map(s => s.id === id ? { ...s, [field]: value } : s))

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
              <h1 className="text-lg font-bold">Submit Your Availability</h1>
              <div className="mt-2 bg-muted/50 rounded-lg px-3 py-2 text-xs text-muted-foreground space-y-0.5">
                <p><span className="font-medium text-foreground">Candidate:</span> Rahul Sharma</p>
                <p><span className="font-medium text-foreground">Role:</span> Senior Software Engineer</p>
                <p><span className="font-medium text-foreground">Round:</span> Technical Interview · 60 minutes</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {slots.map((slot, i) => (
                <div key={slot.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">Slot {i + 1}</span>
                    {slots.length > 1 && <button onClick={() => removeSlot(slot.id)} className="text-muted-foreground hover:text-destructive"><X size={14} /></button>}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="date" value={slot.date} onChange={e => updateSlot(slot.id, 'date', e.target.value)} className="col-span-3 h-8 rounded border border-input px-2 text-xs" />
                    <input type="time" value={slot.start} onChange={e => updateSlot(slot.id, 'start', e.target.value)} className="h-8 rounded border border-input px-2 text-xs" />
                    <span className="flex items-center justify-center text-xs text-muted-foreground">to</span>
                    <input type="time" value={slot.end} onChange={e => updateSlot(slot.id, 'end', e.target.value)} className="h-8 rounded border border-input px-2 text-xs" />
                  </div>
                </div>
              ))}
            </div>

            {slots.length < 5 && (
              <button onClick={addSlot} className="flex items-center gap-1.5 text-xs text-primary hover:underline mb-4">
                <Plus size={12} />Add another slot
              </button>
            )}
            <Button className="w-full" onClick={() => setSubmitted(true)}>Submit Availability</Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border shadow-panel p-8 text-center">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">Availability submitted!</h2>
            <p className="text-sm text-muted-foreground">HR will confirm the interview time shortly. You'll receive a calendar invite once scheduled.</p>
          </div>
        )}
      </div>
    </div>
  )
}
