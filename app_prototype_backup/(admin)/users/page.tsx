'use client'
import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

type User = { id: string; name: string; email: string; role: 'HR' | 'Employee'; initials: string }
const USERS: User[] = [
  { id: '1', name: 'Riya Kumar', email: 'riya@webknot.in', role: 'HR', initials: 'RK' },
  { id: '2', name: 'Amit Shah', email: 'amit@webknot.in', role: 'Employee', initials: 'AS' },
  { id: '3', name: 'Priya Varma', email: 'priya@webknot.in', role: 'HR', initials: 'PV' },
  { id: '4', name: "John D'souza", email: 'john@webknot.in', role: 'Employee', initials: 'JD' },
  { id: '5', name: 'Sneha Menon', email: 'sneha@webknot.in', role: 'Employee', initials: 'SM' },
]

export default function UsersPage() {
  const [users, setUsers] = useState(USERS)
  const toggle = (id: string) => setUsers(u => u.map(user => user.id === id ? { ...user, role: user.role === 'HR' ? 'Employee' : 'HR' } : user))

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage HR access for your team</p>
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5 mt-3 inline-block">You cannot change your own role</p>
        </div>

        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user.id} className={`border-t border-border ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback>{user.initials}</AvatarFallback></Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${user.role === 'HR' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => toggle(user.id)} className={user.role === 'HR' ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-primary border-primary/30 hover:bg-indigo-50'}>
                      {user.role === 'HR' ? 'Revoke HR' : 'Grant HR'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
