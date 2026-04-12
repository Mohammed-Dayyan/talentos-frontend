'use client'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

interface ChatInputProps { onSend: (message: string) => void }

export function ChatInput({ onSend }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [value])

  const handleSend = () => {
    if (!value.trim()) return
    onSend(value.trim())
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="border-t border-border bg-white p-4">
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask TalentOS anything... e.g. 'Show top candidates for Developer B7H'"
          rows={1}
          className="flex-1 resize-none rounded-xl border border-input bg-muted/50 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          style={{ minHeight: '40px', maxHeight: '120px' }}
        />
        <Button size="icon" onClick={handleSend} disabled={!value.trim()} className="shrink-0 rounded-xl">
          <Send size={16} />
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-2">Press Enter to send, Shift+Enter for new line</p>
    </div>
  )
}
