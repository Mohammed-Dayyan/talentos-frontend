'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const ERROR_MESSAGES: Record<string, string> = {
  access_not_granted: 'Your account has not been granted access. Contact your administrator.',
  domain_mismatch: 'Only @webknot.in accounts are allowed.',
  auth_failed: 'Authentication failed. Please try again.',
  unauthorized: 'You are not authorised to access this application.',
};

function LoginContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('error');
  const errorMsg = errorCode ? (ERROR_MESSAGES[errorCode] ?? 'Something went wrong. Please try again.') : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg border border-border p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-1" style={{ color: '#4338ca' }}>TalentOS</h1>
            <p className="text-sm text-muted-foreground">by Webknot</p>
            <p className="text-base font-medium text-foreground mt-4">
              AI-Powered Recruitment,<br />Built for Teams
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          <button
            onClick={() => { window.location.href = `${API}/api/auth/google`; }}
            className="flex items-center justify-center gap-3 w-full border border-border rounded-lg px-4 py-2.5 text-sm font-medium text-foreground bg-white hover:bg-muted/50 transition-colors shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" />
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z" />
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Only @webknot.in accounts are allowed
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
