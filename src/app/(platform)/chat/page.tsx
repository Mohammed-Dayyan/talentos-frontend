'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Thread {
  id: string;
  title: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/chat/threads`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then((data) => {
        const threads: Thread[] = Array.isArray(data) ? data : data.items ?? [];
        if (threads.length > 0) {
          router.replace(`/chat/${threads[0].id}`);
        } else {
          setChecked(true);
        }
      })
      .catch(() => setChecked(true));
  }, [router]);

  const handleNewChat = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const r = await fetch(`${API}/api/chat/threads`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Thread' }),
      });
      if (r.ok) {
        const thread = await r.json();
        router.push(`/chat/${thread.id}`);
      }
    } finally {
      setCreating(false);
    }
  };

  if (!checked) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-muted-foreground">
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full items-center justify-center text-center px-4">
      <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
        <MessageSquare size={20} className="text-indigo-500" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">No conversations yet</p>
      <p className="text-xs text-muted-foreground mb-4 max-w-xs leading-relaxed">
        Start chatting with TalentOS to manage hiring requests, review candidates, and more.
      </p>
      <button
        onClick={handleNewChat}
        disabled={creating}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {creating ? 'Creating…' : 'Start a new chat'}
      </button>
    </div>
  );
}
