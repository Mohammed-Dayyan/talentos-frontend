'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface PlatformUser {
  id: string;
  email: string;
  role: 'admin' | 'hr';
  is_active: boolean;
  added_by?: string;
  added_at?: string;
  created_at?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [myEmail, setMyEmail] = useState('');
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'hr' | 'admin'>('hr');
  const [adding, setAdding] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  const loadMe = useCallback(async () => {
    const r = await fetch(`${API}/api/auth/me`, { credentials: 'include' });
    if (!r.ok) { router.push('/login'); return; }
    const me = await r.json();
    if (me.role !== 'admin') { router.push('/chat'); return; }
    setMyEmail(me.email ?? '');
  }, [router]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/admin/platform-users`, { credentials: 'include' });
      if (r.ok) {
        const data = await r.json();
        setUsers(Array.isArray(data) ? data : data.items ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe().then(() => loadUsers());
  }, [loadMe, loadUsers]);

  const handleAdd = async () => {
    if (!newEmail.trim() || adding) return;
    setAdding(true);
    try {
      const r = await fetch(`${API}/api/admin/platform-users`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim(), role: newRole }),
      });
      if (r.ok) {
        setNewEmail('');
        setNewRole('hr');
        setShowForm(false);
        await loadUsers();
      }
    } finally {
      setAdding(false);
    }
  };

  const handleChangeRole = async (userId: string, role: 'admin' | 'hr') => {
    setChangingRole(userId);
    try {
      const r = await fetch(`${API}/api/admin/platform-users/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (r.ok) await loadUsers();
    } finally {
      setChangingRole(null);
    }
  };

  const handleRevoke = async (userId: string) => {
    setRevoking(userId);
    setConfirmRevoke(null);
    try {
      const r = await fetch(`${API}/api/admin/platform-users/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: false }),
      });
      if (r.ok) await loadUsers();
    } finally {
      setRevoking(null);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage approved users and roles</p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            {showForm ? 'Cancel' : '+ Add User'}
          </button>
        </div>

        {/* Add user form */}
        {showForm && (
          <div className="bg-white border border-border rounded-lg p-4 mb-4 flex items-center gap-3 flex-wrap">
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="email@webknot.in"
              className="flex-1 min-w-[200px] border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <select
              value={newRole}
              onChange={e => setNewRole(e.target.value as 'hr' | 'admin')}
              className="border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={handleAdd}
              disabled={!newEmail.trim() || adding}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {adding ? 'Adding…' : 'Add'}
            </button>
          </div>
        )}

        {/* Revoke confirm dialog */}
        {confirmRevoke && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center justify-between gap-4">
            <p className="text-sm text-red-700 font-medium">Revoke access for this user? This cannot be undone.</p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setConfirmRevoke(null)}
                className="text-xs border border-border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRevoke(confirmRevoke)}
                disabled={!!revoking}
                className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {revoking ? 'Revoking…' : 'Yes, Revoke'}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Added By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Added At</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground animate-pulse">
                    Loading users…
                  </td>
                </tr>
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No users yet.
                  </td>
                </tr>
              )}
              {!loading && users.map(user => {
                const isSelf = user.email === myEmail;
                const isChangingThisRole = changingRole === user.id;
                return (
                  <tr key={user.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {user.email}
                      {isSelf && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}
                    </td>
                    <td className="px-4 py-3">
                      {isChangingThisRole ? (
                        <span className="text-xs text-muted-foreground animate-pulse">Saving…</span>
                      ) : (
                        <select
                          defaultValue={user.role}
                          onChange={e => handleChangeRole(user.id, e.target.value as 'admin' | 'hr')}
                          className="text-xs border border-input rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        >
                          <option value="hr">HR</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {user.is_active ? 'Active' : 'Revoked'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {user.added_by ?? 'System'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(user.added_at ?? user.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isSelf || !user.is_active ? (
                        <span className="text-xs text-muted-foreground italic">
                          {!user.is_active ? 'Revoked' : 'Protected'}
                        </span>
                      ) : (
                        <button
                          onClick={() => setConfirmRevoke(user.id)}
                          disabled={!!revoking}
                          className="text-xs text-red-600 hover:text-red-800 border border-red-200 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {revoking === user.id ? 'Revoking…' : 'Revoke'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
