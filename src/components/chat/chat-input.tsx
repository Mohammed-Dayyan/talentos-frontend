'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, X } from 'lucide-react'

interface ChatInputProps { onSend: (message: string) => void }

export function ChatInput({ onSend }: ChatInputProps) {
  const [value, setValue] = useState('')
  const [attachment, setAttachment] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [value])

  const handleSend = () => {
    if (!value.trim() && !attachment) return
    onSend(value.trim() || (attachment ? `[Attached: ${attachment}]` : ''))
    setValue('')
    setAttachment(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setAttachment(file.name)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const canSend = value.trim().length > 0 || !!attachment

  return (
    <div className="border-t border-border bg-white p-4">
      <div className="max-w-3xl mx-auto">
        {attachment && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-medium">
              <Paperclip size={11} />
              {attachment}
              <button onClick={() => setAttachment(null)} className="ml-1 hover:text-red-500 transition-colors">
                <X size={11} />
              </button>
            </div>
          </div>
        )}
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Attach PDF or image"
          >
            <Paperclip size={16} />
          </button>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask TalentOS anything… or upload a JD"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-input bg-muted/50 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="shrink-0 w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={15} />
          </button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
