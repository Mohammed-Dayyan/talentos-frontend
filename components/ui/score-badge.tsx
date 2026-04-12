import { cn } from '@/lib/utils'
export function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-green-100 text-green-700' : score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
  const dot = score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold', color)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', dot)} />
      {score}
    </span>
  )
}
