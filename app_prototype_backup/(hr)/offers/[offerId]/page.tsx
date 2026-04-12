'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { COMPENSATION_18LPA } from '@/lib/dummy-data'
import { FileText } from 'lucide-react'

const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(n)

export default function OfferPreviewPage() {
  const [approved, setApproved] = useState(false)
  const c = COMPENSATION_18LPA

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Offer Letter — Rahul Sharma</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Senior Software Engineer · Developer B7H</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded font-medium ${approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {approved ? 'Approved' : 'Pending Approval'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* PDF Preview */}
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="aspect-[3/4] bg-muted/30 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <FileText size={40} strokeWidth={1} />
              <p className="text-sm">Offer Letter PDF</p>
              <p className="text-xs opacity-60">Preview after approval</p>
            </div>
          </div>

          {/* Compensation Table */}
          <div className="space-y-4">
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold">Compensation Breakdown</p>
                <p className="text-xs text-muted-foreground">Annual CTC: ₹{fmt(c.annualCTC)}</p>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Component</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Monthly</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Annual</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Basic Salary', monthly: c.basic / 12, annual: c.basic },
                    { label: 'HRA', monthly: c.hra / 12, annual: c.hra },
                    { label: 'Special Allowance', monthly: c.specialAllowance / 12, annual: c.specialAllowance },
                    { label: 'LTA', monthly: c.lta / 12, annual: c.lta },
                    { label: 'Employee PF', monthly: -c.employeePF, annual: -c.employeePF * 12 },
                  ].map(row => (
                    <tr key={row.label} className="border-t border-border/50">
                      <td className="px-4 py-2">{row.label}</td>
                      <td className="px-4 py-2 text-right text-muted-foreground">₹{fmt(Math.round(row.monthly))}</td>
                      <td className="px-4 py-2 text-right text-muted-foreground">₹{fmt(row.annual)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border font-semibold">
                    <td className="px-4 py-2">Net Monthly</td>
                    <td className="px-4 py-2 text-right text-green-700">₹{fmt(c.netMonthly)}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground">—</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex gap-2">
              {!approved ? (
                <>
                  <Button onClick={() => setApproved(true)} className="flex-1">Approve Offer</Button>
                  <Button variant="outline" className="flex-1">Request Changes</Button>
                </>
              ) : (
                <Button className="flex-1">Dispatch to Candidate</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
