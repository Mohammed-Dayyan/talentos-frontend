'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const [redirecting, setRedirecting] = useState(false)

  const handleGoogleSignIn = () => {
    setRedirecting(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-panel border border-border p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-700 mb-1" style={{ color: '#4338ca' }}>
              TalentOS
            </h1>
            <p className="text-sm text-muted-foreground">by Webknot</p>
            <p className="text-base font-medium text-foreground mt-4">
              AI-Powered Recruitment,
              <br />
              Built for Teams
            </p>
          </div>

          {/* Domain mismatch error */}
          {errorParam === 'domain_mismatch' && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              Only <strong>@webknot.in</strong> accounts are allowed. Please sign in with your work
              email.
            </div>
          )}

          {redirecting ? (
            <div className="flex items-center justify-center gap-2 w-full border border-border rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground bg-muted/30">
              <svg
                className="animate-spin h-4 w-4 text-primary-700"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Redirecting to Google...
            </div>
          ) : (
            <a
              href="/api/auth/google"
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-3 w-full border border-border rounded-lg px-4 py-2.5 text-sm font-medium text-foreground bg-white hover:bg-muted/50 transition-colors shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path
                  fill="#4285F4"
                  d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"
                />
                <path
                  fill="#34A853"
                  d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"
                />
                <path
                  fill="#FBBC05"
                  d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"
                />
                <path
                  fill="#EA4335"
                  d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"
                />
              </svg>
              Continue with Google
            </a>
          )}

          <p className="text-center text-xs text-muted-foreground mt-4">
            Only @webknot.in accounts are allowed
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center" />
      }
    >
      <LoginContent />
    </Suspense>
  )
}
