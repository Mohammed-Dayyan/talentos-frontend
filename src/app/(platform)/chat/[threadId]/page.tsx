'use client';
import { useEffect, useState, useRef, useCallback, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { MessageSquare, Paperclip, Send, ExternalLink, Copy } from 'lucide-react';

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

// ── Lifecycle action envelope types ───────────────────────────────────────────

type LifecycleStatus = 'pending_confirmation' | 'needs_clarification' | 'success' | 'error' | 'cancelled';
type ExtendedLifecycleStatus = LifecycleStatus | 'info';

interface ClarificationOption {
  label: string;
  value: string;
}

interface LifecycleData {
  type: string;
  action: string;
  text?: string;
  options?: ClarificationOption[];
  available_streams?: string[];
  available_transitions?: string[];
  entity?: Record<string, unknown>;
  missing_fields?: string[];
  preview?: {
    jd_draft?: string;
    portal_payload?: {
      title?: string;
      stream?: string;
      band?: string;
      employment_type?: string;
      experience_level?: string;
      skills?: string[];
      expected_salary?: string;
      questions?: Array<{ id: string; text: string; type: string; required?: boolean; options?: string[] }>;
      jd_preview?: string;
    };
  };
  result?: {
    job_url?: string;
    share_text?: string;
    text?: string;
  };
  error?: string;
}

interface LifecycleEnvelope {
  status: ExtendedLifecycleStatus;
  action: string;
  message: string;
  data: LifecycleData;
}

function renderInlineMarkdown(text: string) {
  const parts: Array<{ type: 'text' | 'bold' | 'code' | 'link'; value: string; href?: string }> = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\((https?:\/\/[^)]+)\))/g;
  let last = 0;
  let match: RegExpExecArray | null = regex.exec(text);
  while (match) {
    const m = match[0];
    const index = match.index ?? 0;
    if (index > last) parts.push({ type: 'text', value: text.slice(last, index) });
    if (m.startsWith('**') && m.endsWith('**')) {
      parts.push({ type: 'bold', value: m.slice(2, -2) });
    } else if (m.startsWith('`') && m.endsWith('`')) {
      parts.push({ type: 'code', value: m.slice(1, -1) });
    } else {
      const link = m.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
      if (link) parts.push({ type: 'link', value: link[1], href: link[2] });
      else parts.push({ type: 'text', value: m });
    }
    last = index + m.length;
    match = regex.exec(text);
  }
  if (last < text.length) parts.push({ type: 'text', value: text.slice(last) });

  return parts.map((p, i) => {
    if (p.type === 'bold') return <strong key={i} className="font-semibold">{p.value}</strong>;
    if (p.type === 'code') return <code key={i} className="px-1 py-0.5 rounded bg-muted text-[0.92em]">{p.value}</code>;
    if (p.type === 'link' && p.href) {
      return (
        <a key={i} href={p.href} target="_blank" rel="noreferrer" className="text-indigo-600 underline hover:text-indigo-700">
          {p.value}
        </a>
      );
    }
    return <span key={i}>{p.value}</span>;
  });
}

function MarkdownText({ text, className = '' }: { text: string; className?: string }) {
  const lines = text.split('\n').map(l => l.trimEnd());
  const nodes: ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (keyBase: string) => {
    if (!listItems.length) return;
    nodes.push(
      <ul key={`ul-${keyBase}`} className="list-disc pl-5 space-y-1 my-2">
        {listItems.map((item, idx) => <li key={idx}>{renderInlineMarkdown(item)}</li>)}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((line, idx) => {
    const bullet = line.match(/^(?:[-*•]|\d+\.)\s+(.*)$/);
    if (bullet) {
      listItems.push(bullet[1]);
      return;
    }
    flushList(String(idx));
    if (!line.trim()) {
      nodes.push(<div key={`br-${idx}`} className="h-2" />);
      return;
    }
    const heading = line.match(/^#{1,3}\s+(.*)$/);
    if (heading) {
      nodes.push(<h4 key={`h-${idx}`} className="font-semibold mt-1">{renderInlineMarkdown(heading[1])}</h4>);
      return;
    }
    nodes.push(<p key={`p-${idx}`} className="leading-relaxed">{renderInlineMarkdown(line)}</p>);
  });
  flushList('end');

  return <div className={`text-sm text-foreground whitespace-pre-wrap ${className}`}>{nodes}</div>;
}

// Human-readable labels for decision transition strings
function transitionLabel(t: string): string {
  const map: Record<string, string> = {
    confirm_hiring_request: 'Yes, create it',
    cancel_hiring_request: 'Cancel',
    post_hiring_request_to_portal: 'Post to portal',
    skip_hiring_request_portal_post: 'Skip for now',
  };
  return map[t] ?? t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function isDangerTransition(t: string) {
  return t.includes('cancel') || t.includes('skip');
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
  const [copied, setCopied] = useState<string | null>(null);
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
  const [sseStatus, setSseStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('disconnected');

  // ── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    loadThread();
    loadMessages();
    // Mark thread as read
    fetch(`${API}/api/chat/threads/${threadId}/read`, { method: 'PATCH', credentials: 'include' }).catch(() => {});
  }, [threadId, loadThread, loadMessages]);

  // ── Server-Sent Events real-time updates ────────────────────────────────
  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectDelay = 1000;
    let unmounted = false;

    const connect = () => {
      if (unmounted) return;
      // SSE endpoint — cookie is sent automatically (same-origin)
      es = new EventSource(`${API}/api/chat/stream/${threadId}`, { withCredentials: true });

      es.onopen = () => {
        setSseStatus('connected');
        reconnectDelay = 1000;
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
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

      es.onerror = () => {
        setSseStatus('reconnecting');
        es?.close();
        if (unmounted) return;
        reconnectTimer = setTimeout(() => {
          reconnectDelay = Math.min(reconnectDelay * 2, 30000);
          connect();
        }, reconnectDelay);
      };
    };

    const connectTimer = setTimeout(connect, 50);

    return () => {
      unmounted = true;
      clearTimeout(connectTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
      setSseStatus('disconnected');
    };
  }, [threadId]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, sending]);

  const send = async () => {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setSending(true);
    setInput('');
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
      setTimeout(loadMessages, 800);
    }
  };

  // Send a pre-filled text (e.g., clarification option selection)
  const sendText = async (text: string) => {
    if (sending) return;
    setSending(true);
    const optimisticMsg: Msg = {
      id: `optimistic-${Date.now()}`,
      content: text,
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
        body: JSON.stringify({ thread_id: threadId, message: text }),
      });
    } finally {
      setSending(false);
      setTimeout(loadMessages, 800);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
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

  const parse = (raw: unknown): Record<string, unknown> => {
    if (typeof raw === 'object' && raw !== null) {
      const obj = raw as Record<string, unknown>;
      if (obj.text && !obj.body) return { ...obj, body: obj.text };
      return obj;
    }
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

  const isLifecycleEnvelope = (c: unknown): c is LifecycleEnvelope => {
    if (typeof c !== 'object' || c === null) return false;
    const obj = c as Record<string, unknown>;
    return typeof obj.status === 'string' && typeof obj.data === 'object' && obj.data !== null;
  };

  // ── Renderer for new lifecycle action envelope ──────────────────────────────
  const renderLifecycleMessage = (c: LifecycleEnvelope, msgId: string, isActed: boolean) => {
    const { status, action, message: msg, data } = c;
    const transitions = data.available_transitions ?? [];
    const fallbackStreams = Array.isArray(data.available_streams) ? data.available_streams : [];
    const usingFallbackStreams = !(data.options && data.options.length > 0) && fallbackStreams.length > 0;
    const options = (data.options && data.options.length > 0)
      ? data.options
      : fallbackStreams.map((s) => ({ label: s, value: s }));
    const statusTone =
      status === 'success'
        ? 'border-green-200 bg-green-50/40'
        : status === 'error'
        ? 'border-red-200 bg-red-50/40'
        : status === 'pending_confirmation'
        ? 'border-indigo-200 bg-indigo-50/35'
        : status === 'needs_clarification'
        ? 'border-amber-200 bg-amber-50/35'
        : 'border-border bg-muted/25';

    const renderWithTone = (node: ReactNode) => (
      <div className={`border rounded-lg p-3 ${statusTone}`}>{node}</div>
    );

    const TransitionButtons = () => (
      <div className="flex flex-wrap gap-2 mt-3">
        {transitions.map((t) => {
          const key = msgId + t;
          const loading = resuming === key;
          return (
            <button
              key={t}
              onClick={() => resume(msgId, t)}
              disabled={!!resuming}
              className={[
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50',
                isDangerTransition(t)
                  ? 'bg-white text-foreground border border-border hover:bg-muted'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700',
              ].join(' ')}
            >
              {loading ? '…' : transitionLabel(t)}
            </button>
          );
        })}
      </div>
    );

    if (status === 'needs_clarification') {
      return renderWithTone(
        <>
          {msg && <MarkdownText text={msg} />}
          {options.length > 0 && !isActed && (
            <div className="flex flex-wrap gap-2 mt-3">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setActed(p => { const n = new Set(Array.from(p)); n.add(msgId); return n; }); sendText(opt.value); }}
                  disabled={sending}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-border hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          {usingFallbackStreams && options.length > 0 && (
            <ul className="mt-3 list-disc pl-5 text-sm text-foreground space-y-1">
              {options.map((opt) => (
                <li key={`${opt.value}-preview`} className="leading-relaxed">{opt.label}</li>
              ))}
            </ul>
          )}
          {isActed && <p className="text-xs text-muted-foreground mt-2">✓ Response sent</p>}
        </>
      );
    }

    if (status === 'pending_confirmation') {
      const entity = data.entity as Record<string, unknown> | undefined;
      const preview = data.preview;
      const portalPayload = preview?.portal_payload;
      const jdDraft = preview?.jd_draft;

      return renderWithTone(
        <>
          {msg && <MarkdownText text={msg} />}

          {/* Entity summary for create_hiring_request */}
          {entity && action === 'create_hiring_request' && (
            <div className="mt-3 bg-muted/50 rounded-lg px-3 py-2.5 text-xs space-y-1">
              {typeof entity.designation === 'string' && entity.designation && (
                <p>
                  <span className="text-muted-foreground">Role: </span>
                  <span className="font-medium">{String(entity.designation)}</span>
                  {typeof entity.stream === 'string' && entity.stream && <span className="text-muted-foreground"> — {String(entity.stream)}</span>}
                  {typeof entity.band === 'string' && entity.band && <span className="text-muted-foreground"> | {String(entity.band)}</span>}
                </p>
              )}
              {Array.isArray(entity.skills) && entity.skills.length > 0 && (
                <p>
                  <span className="text-muted-foreground">Skills: </span>
                  {(entity.skills as string[]).join(', ')}
                </p>
              )}
              {entity.openings !== undefined && entity.openings !== null && (
                <p>
                  <span className="text-muted-foreground">Openings: </span>
                  {String(entity.openings)}
                </p>
              )}
              {typeof entity.employment_type === 'string' && entity.employment_type && (
                <p>
                  <span className="text-muted-foreground">Type: </span>
                  {String(entity.employment_type)}
                </p>
              )}
            </div>
          )}

          {/* JD draft preview */}
          {jdDraft && (
            <details className="mt-2 group">
              <summary className="text-xs text-indigo-600 cursor-pointer select-none hover:text-indigo-700">
                View draft JD
              </summary>
              <pre className="text-xs whitespace-pre-wrap mt-2 text-foreground bg-muted/30 rounded-lg px-3 py-2 leading-relaxed">
                {jdDraft}
              </pre>
            </details>
          )}

          {/* Portal payload preview for publish_hiring_request */}
          {portalPayload && action === 'publish_hiring_request' && (
            <div className="mt-3 border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-3 py-2 border-b border-border">
                <p className="text-xs font-medium text-muted-foreground">Portal Listing Preview</p>
              </div>
              <div className="px-3 py-2.5 text-xs space-y-1.5">
                {portalPayload.title && <p><span className="text-muted-foreground">Title: </span><span className="font-medium">{portalPayload.title}</span></p>}
                {portalPayload.stream && <p><span className="text-muted-foreground">Department: </span>{portalPayload.stream}</p>}
                {portalPayload.band && <p><span className="text-muted-foreground">Band: </span>{portalPayload.band}</p>}
                {portalPayload.employment_type && <p><span className="text-muted-foreground">Type: </span>{portalPayload.employment_type}</p>}
                {portalPayload.experience_level && <p><span className="text-muted-foreground">Level: </span>{portalPayload.experience_level}</p>}
                {portalPayload.expected_salary && <p><span className="text-muted-foreground">Salary: </span>{portalPayload.expected_salary}</p>}
                {Array.isArray(portalPayload.skills) && portalPayload.skills.length > 0 && (
                  <p><span className="text-muted-foreground">Skills: </span>{portalPayload.skills.join(', ')}</p>
                )}
                {Array.isArray(portalPayload.questions) && portalPayload.questions.length > 0 && (
                  <div className="mt-1.5">
                    <p className="text-muted-foreground font-medium mb-1">Screening questions ({portalPayload.questions.length})</p>
                    <ul className="space-y-0.5 list-disc list-inside text-foreground">
                      {portalPayload.questions.map((q) => (
                        <li key={q.id}>{q.text}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isActed && transitions.length > 0 && <TransitionButtons />}
          {isActed && <p className="text-xs text-muted-foreground mt-2">✓ Decision submitted</p>}
        </>
      );
    }

    if (status === 'success') {
      const result = data.result;
      return renderWithTone(
        <>
          {msg && <MarkdownText text={msg} />}
          {result?.job_url && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-700 font-medium">✅ Posted successfully</span>
              </div>
              <a
                href={String(result.job_url)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 underline break-all"
              >
                {String(result.job_url)}
                <ExternalLink size={10} />
              </a>
            </div>
          )}
          {result?.share_text && (
            <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium text-indigo-700">LinkedIn caption</p>
                <button
                  onClick={() => copyToClipboard(String(result!.share_text), msgId + 'share')}
                  className="flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  <Copy size={10} />
                  {copied === msgId + 'share' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-foreground leading-relaxed">{String(result.share_text)}</p>
            </div>
          )}
        </>
      );
    }

    if (status === 'error') {
      return renderWithTone(
        <>
          {msg && <MarkdownText text={msg} />}
          {data.error && <MarkdownText text={data.error} className="text-red-600 mt-1" />}
          {!isActed && transitions.length > 0 && <TransitionButtons />}
          {isActed && <p className="text-xs text-muted-foreground mt-2">✓ Decision submitted</p>}
        </>
      );
    }

    if (status === 'cancelled') {
      return renderWithTone(<MarkdownText text={msg || 'Action cancelled.'} className="text-muted-foreground" />);
    }

    if (status === 'info') {
      // Pure conversational response — no lifecycle action, just render text.
      const infoText = msg || (data.text as string | undefined) || '';
      return infoText ? renderWithTone(<MarkdownText text={infoText} />) : null;
    }

    // Fallback: show message text
    return msg ? renderWithTone(<MarkdownText text={msg} />) : null;
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
          sseStatus === 'connected'
            ? 'bg-green-50 text-green-700'
            : sseStatus === 'reconnecting'
            ? 'bg-yellow-50 text-yellow-700'
            : 'bg-red-50 text-red-600',
        ].join(' ')}>
          <span className={[
            'w-1.5 h-1.5 rounded-full',
            sseStatus === 'connected' ? 'bg-green-500' : sseStatus === 'reconnecting' ? 'bg-yellow-500' : 'bg-red-500',
          ].join(' ')} />
          {sseStatus === 'connected' ? 'Live' : sseStatus === 'reconnecting' ? 'Reconnecting…' : 'Disconnected'}
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
              {msgs.map((m, idx) => {
                const c = parse(m.content);
                const isAgent = (m.role === 'orchestrator' || m.role === 'agent' || m.sender_type === 'orchestrator' || m.sender_type === 'agent' || m.sender_type === 'system');
                // A message is "acted" if the user explicitly clicked a button this session,
                // OR if a user message appears anywhere after it in the thread (meaning the
                // user already responded, even if via free text or a previous session).
                const hasUserResponseAfter = msgs.slice(idx + 1).some(
                  m2 => m2.role === 'user' || m2.sender_type === 'user'
                );
                const isActed = acted.has(m.id) || hasUserResponseAfter;

                if (isAgent) {
                  return (
                    <div key={m.id} className="flex justify-start mb-4">
                      <div className="max-w-xl w-full">
                        <div className="bg-white border border-border rounded-xl rounded-tl-sm px-4 py-3 shadow-sm">
                          {isLifecycleEnvelope(c) ? (
                            // ── New lifecycle action envelope ──────────────────
                            renderLifecycleMessage(c, m.id, isActed)
                          ) : (
                            // ── Legacy card_type / body format ─────────────────
                            <>
                              {/* Plain text */}
                              {(c.body || c.text) && (
                                <MarkdownText text={String(c.body ?? c.text ?? '')} />
                              )}

                              {/* Status card */}
                              {c.card_type === 'status' && (
                                <div className="mt-2">
                                  {typeof c.title === 'string' && c.title && <p className="text-sm font-semibold text-foreground mb-0.5">{c.title}</p>}
                                  {typeof c.body === 'string' && c.body && <p className="text-sm text-foreground whitespace-pre-wrap">{c.body}</p>}
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
                            </>
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
                const hrText = typeof c.body === 'string'
                  ? c.body
                  : typeof c.text === 'string'
                  ? c.text
                  : typeof m.content === 'string'
                  ? m.content
                  : '';
                return (
                  <div key={m.id} className="flex justify-end mb-4">
                    <div className="max-w-xl">
                      <div className="bg-indigo-600 text-white rounded-xl rounded-tr-sm px-4 py-3">
                        <MarkdownText text={hrText} className="text-white [&_a]:text-white [&_a]:underline" />
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
