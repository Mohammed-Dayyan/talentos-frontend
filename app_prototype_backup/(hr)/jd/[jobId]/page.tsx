'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Copy } from 'lucide-react'

const DUMMY_JD = `We are looking for a Senior Software Engineer to join our growing development team at Webknot Technologies. In this role, you will design, build, and maintain scalable backend and frontend systems that power our enterprise HR platform.

You will work closely with product managers, designers, and other engineers to deliver high-quality software. You will be expected to take ownership of features end-to-end, from architecture to deployment.

Key Responsibilities:
- Design and implement RESTful APIs using Python/FastAPI
- Build responsive frontend components using React and TypeScript
- Write clean, well-tested, maintainable code
- Participate in code reviews and technical discussions
- Collaborate with the design team to implement pixel-perfect UIs

Requirements:
- 3+ years of software engineering experience
- Strong proficiency in Python or JavaScript/TypeScript
- Experience with React, FastAPI, or similar frameworks
- Familiarity with PostgreSQL and Redis
- Good understanding of REST API design principles`

export default function JDPage() {
  const [jd, setJd] = useState(DUMMY_JD)
  const [approved, setApproved] = useState(false)
  const [published, setPublished] = useState(false)
  const [copied, setCopied] = useState(false)
  const link = 'https://careers.webknot.in/jobs/senior-software-engineer-abc123'

  const handleCopy = () => { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-bold mb-1">Job Description</h1>
        <p className="text-sm text-muted-foreground mb-6">Senior Software Engineer · Developer B7H</p>

        <div className="bg-white border border-border rounded-lg p-5 mb-4">
          <Textarea value={jd} onChange={e => setJd(e.target.value)} className="min-h-[300px] font-mono text-sm border-0 shadow-none focus-visible:ring-0 p-0" />
        </div>

        <div className="flex gap-2 mb-6">
          <Button onClick={() => setApproved(true)} disabled={approved}>{approved ? 'JD Approved' : 'Approve JD'}</Button>
          <Button variant="outline">Save Draft</Button>
        </div>

        {approved && (
          <div className="bg-white border border-border rounded-lg p-5">
            <h2 className="text-sm font-semibold mb-3">Publish to Careers Portal</h2>
            <Textarea placeholder="Add screening questions for candidates... e.g. What is your experience with FastAPI?" className="min-h-[80px] mb-3" />
            {!published ? (
              <Button onClick={() => setPublished(true)}>Publish & Get Link</Button>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-800">Published! Share this link on LinkedIn:</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-white border border-green-200 rounded px-3 py-2 text-green-700 truncate">{link}</code>
                  <Button size="sm" variant="outline" onClick={handleCopy} className="shrink-0">
                    <Copy size={12} className="mr-1" />{copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
