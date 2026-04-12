'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// After Google OAuth redirect, backend sets cookie and redirects here.
// We just push to /chat — auth state is picked up by Providers via /api/auth/me.
export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    router.push('/chat')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground text-sm">Signing you in...</p>
    </div>
  )
}
