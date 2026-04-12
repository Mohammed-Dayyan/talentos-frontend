export function ReferralTag({ isReferred, referredBy }: { isReferred: boolean; referredBy?: string | null }) {
  if (!isReferred) return null
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-violet-100 text-violet-700">
      <span>Referred</span>
      {referredBy && <span className="opacity-70">by {referredBy}</span>}
    </span>
  )
}
