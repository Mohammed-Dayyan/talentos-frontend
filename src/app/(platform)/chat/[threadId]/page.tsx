'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { MessageSquare, Paperclip, Send } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Action {
  label: string;
  value: string;
  variant?: 'primary' | 'outline' | 'danger';
}

interface Msg {
  id: string;
  content: unknown;
  role?: string;
  sender_type?: string;
  created_at: string;
}

interface Thread {
  id: string;
  title: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatThreadPage() {
  const params = useParams();
  const threadId = params.threadId as string;

  const [thread, setThread] = useState<Thread | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [resuming, setResuming] = useState<string | null>(null);
  const [acted, setActed] = useState<Set<string>>(new Set());
  const bottom = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadMessages = useCallback(async () => {
    const r = await fetch(`${API}/api/chat/threads/${threadId}/messages`, { credentials: 'include' });
    if (r.ok) {
      const data = await r.json();
      setMsgs(data.items ?? data ?? []);
    }
  }, [threadId]);

  const loadThread = useCallback(async () => {
    // Backend has no single-thread GET endpoint — fetch list and find by id
    const r = await fetch(`${API}/api/chat/threads`, { credentials: 'include' });
    if (r.ok) {
      const data = await r.json();
      const threads: Thread[] = data.items ?? data ?? [];
      const found = threads.find(t => t.id === threadId);
      if (found) setThread(found);
    }
  }, [threadId]);

  // ── Connection status ────────────────────────────────────────────────────
  const [wsStatus, setWsStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('disconnected');

  // ── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    loadThread();
    loadMessages();
    // Mark thread as read
    fetch(`${API}/api/chat/threads/${threadId}/read`, { method: 'PATCH', credentials: 'include' }).catch(() => {});
  }, [threadId, loadThread, loadMessages]);

  // ── WebSocket real-time updates ──────────────────────────────────────────
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectDelay = 1000;
    let unmounted = false;

    const connect = () => {
      if (unmounted) return;
      // Cookie is HttpOnly — backend reads it server-side; no token in query param needed
      const wsUrl = `ws://localhost:8000/ws/chat/${threadId}`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        reconnectDelay = 1000;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'connected') {
            setWsStatus('connected');
            return;
          }
          // Append new message (dedupe by id) — no loadMessages() to avoid race condition
          if (data.type === 'message' && data.id) {
            setMsgs(prev => {
              if (prev.some(m => m.id === data.id)) return prev;
              return [...prev, data as Msg];
            });
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onclose = (event) => {
        setWsStatus('disconnected');
        if (unmounted) return;
        // 4001 = auth failure — don't reconnect
        if (event.code === 4001) return;
        setWsStatus('reconnecting');
        reconnectTimer = setTimeout(() => {
          reconnectDelay = Math.min(reconnectDelay * 2, 30000);
          connect();
        }, reconnectDelay);
      };

      ws.onerror = (err) => {
        console.error('[TalentOS WS] error', err);
      };
    };

    // Delay initial connect by 50ms to avoid React StrictMode double-mount race
    // (StrictMode mounts → unmounts → remounts; without delay the first WS closes
    // mid-handshake and the browser logs "closed before connection established")
    const connectTimer = setTimeout(() => {
      connect();
    }, 50);

    return () => {
      unmounted = true;
      clearTimeout(connectTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [threadId, loadMessages]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, sending]);

  const send = async () => {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setSending(true);
    setInput('');
    // Optimistic: immediately show the user's message
    const optimisticMsg: Msg = {
      id: `optimistic-${Date.now()}`,
      content: content,
      role: 'user',
      sender_type: 'user',
      created_at: new Date().toISOString(),
    };
    setMsgs(prev => [...prev, optimisticMsg]);
    try {
      await fetch(`${API}/api/agent/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: threadId, message: content }),
      });
    } finally {
      setSending(false);
      // Single delayed refresh to sync DB state (replaces optimistic msg with real one)
      setTimeout(loadMessages, 800);
    }
  };

  const resume = async (msgId: string, decision: string) => {
    const key = msgId + decision;
    setResuming(key);
    try {
      await fetch(`${API}/api/agent/resume`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: threadId, decision, data: {} }),
      });
      setActed(p => { const n = new Set(Array.from(p)); n.add(msgId); return n; });
      setTimeout(loadMessages, 800);
    } finally {
      setResuming(null);
    }
  };

  const parse = (raw: unknown) => {
    // Already an object (API returned parsed JSON)
    if (typeof raw === 'object' && raw !== null) {
      const obj = raw as Record<string, unknown>;
      // Normalize: map 'text' → 'body' if body missing
      if (obj.text && !obj.body) return { ...obj, body: obj.text };
      return obj;
    }
    // String — try to parse as JSON
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        if (parsed.text && !parsed.body) return { ...parsed, body: parsed.text };
        return parsed;
      } catch {
        return { body: raw };
      }
    }
    return { body: String(raw) };
  };

  const isEmpty = msgs.length === 0 && !sending;

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="border-b border-border px-6 py-3 bg-white shrink-0 flex items-center gap-3">
        <h2 className="text-sm font-semibold text-foreground flex-1">
          {thread?.title ?? 'Chat'}
        </h2>
        {/* WebSocket connection status pill */}
        <span className={[
          'flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full',
          wsStatus === 'connected'
            ? 'bg-green-50 text-green-700'
            : wsStatus === 'reconnecting'
            ? 'bg-yellow-50 text-yellow-700'
            : 'bg-red-50 text-red-600',
        ].join(' ')}>
          <span className={[
            'w-1.5 h-1.5 rounded-full',
            wsStatus === 'connected' ? 'bg-green-500' : wsStatus === 'reconnecting' ? 'bg-yellow-500' : 'bg-red-500',
          ].join(' ')} />
          {wsStatus === 'connected' ? 'Live' : wsStatus === 'reconnecting' ? 'Reconnecting…' : 'Disconnected'}
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-3xl mx-auto">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                <MessageSquare size={20} className="text-indigo-500" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Start a conversation with TalentOS</p>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Ask about candidates, hiring status, or start a new request.
                <br />
                <span className="text-indigo-500">📎 Use the paperclip to attach a PDF or image</span>
              </p>
            </div>
          ) : (
            <>
              {msgs.map(m => {
                const c = parse(m.content);
                const isAgent = (m.role === 'orchestrator' || m.role === 'agent' || m.sender_type === 'orchestrator' || m.sender_type === 'agent' || m.sender_type === 'system');
                const isActed = acted.has(m.id);

                if (isAgent) {
                  return (
                    <div key={m.id} className="flex justify-start mb-4">
                      <div className="max-w-xl">
                        <div className="bg-white border border-border rounded-xl rounded-tl-sm px-4 py-3 shadow-sm">
                          {/* Text content */}
                          {(c.body || (!c.card_type && m.content)) && (
                            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                              {c.body || m.content}
                            </p>
                          )}

                          {/* Status card */}
                          {c.card_type === 'status' && (
                            <div className="mt-2">
                              {c.title && <p className="text-sm font-semibold text-foreground mb-0.5">{c.title}</p>}
                              {c.body && <p className="text-sm text-foreground whitespace-pre-wrap">{c.body}</p>}
                            </div>
                          )}

                          {/* Action card */}
                          {c.card_type === 'action' && !isActed && c.actions && (
                            <div className="mt-3 flex gap-2 flex-wrap">
                              {(c.actions as Action[]).map((a: Action) => {
                                const key = m.id + a.value;
                                const isLoading = resuming === key;
                                const isDanger = a.variant === 'danger';
                                const isOutline = a.variant === 'outline';
                                return (
                                  <button
                                    key={a.value}
                                    onClick={() => resume(m.id, a.value)}
                                    disabled={!!resuming}
                                    className={[
                                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50',
                                      isDanger
                                        ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                        : isOutline
                                        ? 'bg-white text-foreground border border-border hover:bg-muted'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700',
                                    ].join(' ')}
                                  >
                                    {isLoading ? '…' : a.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {isActed && (
                            <p className="text-xs text-muted-foreground mt-2">✓ Decision submitted</p>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 ml-1">
                          TalentOS · {formatTime(m.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                }

                // HR message
                return (
                  <div key={m.id} className="flex justify-end mb-4">
                    <div className="max-w-xl">
                      <div className="bg-indigo-600 text-white rounded-xl rounded-tr-sm px-4 py-3">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{c.body || (typeof m.content === 'string' ? m.content : '')}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 text-right mr-1">
                        {formatTime(m.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {sending && (
                <div className="flex justify-start mb-4">
                  <div className="max-w-xl">
                    <div className="bg-white border border-border rounded-xl rounded-tl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1 items-center h-4">
                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={bottom} />
        </div>
      </div>

      {/* Chat input */}
      <div className="border-t border-border bg-white shrink-0 px-6 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 items-end">
            <button
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0 mb-0.5"
              title="Attach file (coming soon)"
              onClick={() => {}}
            >
              <Paperclip size={16} />
            </button>
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Message TalentOS…"
              className="flex-1 border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none overflow-hidden min-h-[36px]"
              style={{ lineHeight: '1.4' }}
              disabled={sending}
            />
            <button
              onClick={send}
              disabled={sending || !input.trim()}
              className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 shrink-0 mb-0.5"
              title="Send"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
