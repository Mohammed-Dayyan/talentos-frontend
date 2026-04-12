'use client';
import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, ClipboardList, UserCog, Plus } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Thread {
  id: string;
  title: string;
  last_message?: string;
  unread_count: number;
  updated_at?: string;
  last_message_at?: string | null;
  created_at?: string;
}

interface Me {
  name: string;
  email: string;
  role: 'admin' | 'hr';
}

function formatThreadTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [me, setMe] = useState<Me | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [creatingThread, setCreatingThread] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const activeThreadId = pathname.startsWith('/chat/')
    ? pathname.split('/chat/')[1]
    : null;

  const isChat = pathname === '/chat' || pathname.startsWith('/chat/');
  const isHiringRequests = pathname === '/hiring-requests' || pathname.startsWith('/hiring-requests/');
  const isAdmin = pathname === '/admin';

  const loadMe = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/auth/me`, { credentials: 'include' });
      if (r.ok) {
        setMe(await r.json());
      } else if (r.status === 401) {
        router.replace('/login');
        return;
      }
    } catch {
      // ignore network errors silently
    } finally {
      setAuthChecked(true);
    }
  }, [router]);

  const loadThreads = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/chat/threads`, { credentials: 'include' });
      if (r.ok) {
        const data = await r.json();
        setThreads(Array.isArray(data) ? data : data.items ?? []);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadMe().then(() => loadThreads());
  }, [loadMe, loadThreads]);

  // Re-load threads when navigating between chat threads
  useEffect(() => {
    loadThreads();
  }, [pathname, loadThreads]);

  const handleNewThread = async () => {
    if (creatingThread) return;
    setCreatingThread(true);
    try {
      const r = await fetch(`${API}/api/chat/threads`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Thread' }),
      });
      if (r.ok) {
        const thread = await r.json();
        await loadThreads();
        router.push(`/chat/${thread.id}`);
      }
    } finally {
      setCreatingThread(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Topbar */}
      <header className="h-12 border-b border-border bg-white flex items-center justify-between px-4 shrink-0 z-10">
        <span className="font-bold text-base" style={{ color: '#4338ca' }}>TalentOS</span>
        <div className="flex items-center gap-2">
          {me && (
            <>
              <span className="text-sm font-medium text-foreground">{me.name}</span>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-semibold capitalize',
                me.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
              )}>
                {me.role === 'admin' ? 'Admin' : 'HR'}
              </span>
            </>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[220px] shrink-0 bg-white border-r border-border flex flex-col overflow-hidden">
          {/* Scrollable top section */}
          <div className="flex-1 overflow-y-auto">
            {/* Chat header */}
            <div className="px-3 pt-3 pb-1">
              <div className="flex items-center justify-between">
                <div className={cn(
                  'flex items-center gap-2 px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wide',
                  isChat ? 'text-indigo-700' : 'text-muted-foreground'
                )}>
                  <MessageSquare size={13} />
                  Chats
                </div>
                <button
                  onClick={handleNewThread}
                  disabled={creatingThread}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium px-1.5 py-0.5 rounded hover:bg-indigo-50 transition-colors disabled:opacity-50"
                  title="New Chat"
                >
                  <Plus size={13} />
                  {creatingThread ? '...' : 'New'}
                </button>
              </div>
            </div>

            {/* Thread list */}
            <div className="px-2 pb-2 space-y-0.5">
              {threads.map((thread) => {
                const isActive = activeThreadId === thread.id ||
                  (pathname === '/chat' && threads[0]?.id === thread.id);
                return (
                  <Link
                    key={thread.id}
                    href={`/chat/${thread.id}`}
                    className={cn(
                      'flex flex-col gap-0.5 px-2.5 py-2 rounded-lg text-xs transition-colors relative group',
                      isActive
                        ? 'bg-indigo-50 text-indigo-900'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={cn('font-medium truncate', thread.unread_count > 0 && 'font-semibold')}>
                        {thread.title}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-muted-foreground text-[10px]">
                          {formatThreadTime(thread.last_message_at || thread.created_at || thread.updated_at)}
                        </span>
                        {thread.unread_count > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        )}
                      </div>
                    </div>
                    {thread.last_message && (
                      <p className="text-muted-foreground truncate text-[10px] leading-tight">
                        {thread.last_message}
                      </p>
                    )}
                  </Link>
                );
              })}
              {threads.length === 0 && (
                <p className="text-[10px] text-muted-foreground px-2.5 py-2">No conversations yet</p>
              )}
            </div>

            {/* Divider */}
            <div className="mx-3 border-t border-border my-1" />

            {/* Navigation links */}
            <div className="px-2 pb-1">
              <Link
                href="/hiring-requests"
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isHiringRequests
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <ClipboardList size={15} />
                Hiring Requests
              </Link>

              {me?.role === 'admin' && (
                <Link
                  href="/admin"
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isAdmin
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <UserCog size={15} />
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* User footer */}
          {me && (
            <div className="p-3 border-t border-border shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 shrink-0">
                  {getInitials(me.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{me.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{me.role === 'admin' ? 'Admin' : 'HR'}</p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
