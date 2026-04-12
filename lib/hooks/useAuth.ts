'use client'
import { createContext, useContext } from 'react'
import type { User } from '@/lib/types/api'

interface AuthContext {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContext>({
  user: null,
  loading: true,
  logout: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}
