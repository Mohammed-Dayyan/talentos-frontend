'use client'
import { useEffect, useState } from 'react'
import { HiringRequestCard } from './hiring-request-card'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface HiringRequest {
  id: string
  title: string
  stream: string
  band: string
  urgency: string
  status: string
  application_count?: number
  candidate_count?: number
}

export function PipelineContextPanel() {
  const [requests, setRequests] = useState<HiringRequest[]>([])

  useEffect(() => {
    fetch(`${API}/api/hiring-requests?per_page=20`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setRequests(data.items ?? []) })
      .catch(() => {})
  }, [])

  return (
    <div className="h-full flex flex-col bg-muted/30 border-l border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-foreground">Active Hiring</h2>
          <span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">{requests.length}</span>
        </div>
        <p className="text-xs text-muted-foreground">Hiring requests pipeline</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {requests.map(r => <HiringRequestCard key={r.id} request={r} />)}
      </div>
    </div>
  )
}
