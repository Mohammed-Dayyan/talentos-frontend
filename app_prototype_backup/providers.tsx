'use client'
import { useState, useEffect } from 'react'
import { AuthContext } from '@/lib/hooks/useAuth'
import { api } from '@/lib/api/client'
import type { User } from '@/lib/types/api'

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const BYPASS_AUTH = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true'
  useEffect(() => {
    api
      .get<User>('/api/auth/me')
      .then(setUser)
      .catch(() => {
        if (BYPASS_AUTH) {
          setUser({ id: 'dev-user', email: 'hr@webknot.in', role: 'hr', name: 'Dev HR' })
        } else {
          setUser(null)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const logout = async () => {
    await api.post('/api/auth/logout')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
