function formatTime(iso?: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export function HRMessageBubble({ content, timestamp }: { content: string; timestamp?: string }) {
  return (
    <div className="flex justify-end mb-4">
      <div className="max-w-[70%]">
        {timestamp && (
          <p className="text-right text-[10px] text-muted-foreground mb-0.5 pr-1">{formatTime(timestamp)}</p>
        )}
        <div
          className="bg-indigo-700 text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed"
        >
          {content}
        </div>
      </div>
    </div>
  )
}
