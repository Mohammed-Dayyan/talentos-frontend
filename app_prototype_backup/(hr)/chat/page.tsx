'use client'
import { useState, useRef, useEffect } from 'react'
import { AgentMessageCard } from '@/components/chat/agent-message-card'
import { HRMessageBubble } from '@/components/chat/hr-message-bubble'
import { ChatInput } from '@/components/chat/chat-input'
import { CHAT_MESSAGES, type ChatMessage } from '@/lib/dummy-data'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(CHAT_MESSAGES)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = (content: string) => {
    const hrMsg: ChatMessage = { id: Date.now().toString(), role: 'hr', type: 'text', content }
    const agentMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'agent', type: 'text', content: "I'm processing your request. This is a prototype — connect the API to see real results." }
    setMessages(prev => [...prev, hrMsg, agentMsg])
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-3xl mx-auto">
          {messages.map(msg => msg.role === 'agent'
            ? <AgentMessageCard key={msg.id} type={msg.type ?? 'text'} content={msg.content} data={msg.data} />
            : <HRMessageBubble key={msg.id} content={msg.content} />
          )}
          <div ref={bottomRef} />
        </div>
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  )
}
