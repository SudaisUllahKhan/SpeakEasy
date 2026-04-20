'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The sign-in link has expired or has already been used.',
  Default: 'Something went wrong. Please try signing in again.',
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') ?? 'Default'
  const message = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default

  return (
    <div className="w-full max-w-sm text-center space-y-5">
      <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center" aria-hidden="true">
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Sign-in problem</h1>
      <p className="text-gray-600 text-sm">{message}</p>
      <Link
        href="/auth/signin"
        className="inline-block rounded-xl bg-[#1E56A0] px-6 py-3 text-sm font-semibold text-white"
      >
        Back to sign in
      </Link>
    </div>
  )
}
