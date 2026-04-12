export function HRMessageBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end mb-4">
      <div className="max-w-[70%] bg-primary-700 text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed" style={{ backgroundColor: '#4338ca' }}>
        {content}
      </div>
    </div>
  )
}
