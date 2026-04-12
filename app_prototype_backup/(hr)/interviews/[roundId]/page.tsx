'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'

const slots = [
  { id: '1', date: 'Apr 10, Thu', time: '10:00–11:00 AM', john: true, priya: true },
  { id: '2', date: 'Apr 10, Thu', time: '2:00–3:00 PM', john: true, priya: false },
  { id: '3', date: 'Apr 11, Fri', time: '11:00–12:00 PM', john: true, priya: true },
]

export default function InterviewSchedulePage() {
  const [selected, setSelected] = useState('1')
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold">Schedule Interview</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">Senior Software Engineer</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Rahul Sharma</span>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Technical Round · 60 min</span>
          </div>
        </div>

        {!confirmed ? (
          <>
            <div className="bg-white border border-border rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-8"></th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">john@webknot.in</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">priya@webknot.in</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map(slot => (
                    <tr key={slot.id} onClick={() => setSelected(slot.id)} className={`border-t border-border cursor-pointer hover:bg-muted/30 ${selected === slot.id ? 'bg-indigo-50' : ''}`}>
                      <td className="px-4 py-3">
                        <input type="radio" checked={selected === slot.id} onChange={() => setSelected(slot.id)} className="accent-primary" />
                      </td>
                      <td className="px-4 py-3 font-medium">{slot.date}</td>
                      <td className="px-4 py-3">{slot.time}</td>
                      <td className="px-4 py-3">{slot.john ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-400" />}</td>
                      <td className="px-4 py-3">{slot.priya ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-400" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle size={10} className="text-green-600" /></span>
                john@webknot.in — Submitted
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle size={10} className="text-green-600" /></span>
                priya@webknot.in — Submitted
              </div>
            </div>
            <Button onClick={() => setConfirmed(true)}>Confirm Schedule</Button>
          </>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
            <p className="font-semibold text-green-800">Interview Scheduled!</p>
            <p className="text-sm text-green-600 mt-1">Calendar invites sent to all participants.</p>
          </div>
        )}
      </div>
    </div>
  )
}
