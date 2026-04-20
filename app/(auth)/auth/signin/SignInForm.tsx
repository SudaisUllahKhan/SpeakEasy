'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

interface SignInFormProps {
  isDev: boolean
  hasGoogle: boolean
  hasApple: boolean
  hasMagicLink: boolean
}

export function SignInForm({ isDev, hasGoogle, hasApple, hasMagicLink }: SignInFormProps) {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [devLoading, setDevLoading] = useState(false)

  async function handleDevLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setError('Please enter an email address'); return }
    setDevLoading(true); setError('')
    const res = await signIn('dev-bypass', { email: email.trim(), callbackUrl, redirect: true })
    if (res?.error) { setError('Dev login failed — check server logs.'); setDevLoading(false) }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await signIn('email', { email, callbackUrl, redirect: false })
    setLoading(false)
    if (res?.error) setError('Could not send magic link. Check RESEND_API_KEY.')
    else setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/>
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Check your inbox</h2>
          <p className="text-slate-500 text-sm mt-1">Sign-in link sent to <strong className="text-slate-700">{email}</strong></p>
        </div>
        <button onClick={() => setSent(false)} className="text-sm text-blue-600 font-semibold underline underline-offset-2">
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
        <p className="text-slate-400 text-sm mt-0.5">Sign in to continue your practice</p>
      </div>

      {isDev && (
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          <p className="text-sm text-amber-800"><strong>Dev mode</strong> — any email signs in instantly</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={isDev ? handleDevLogin : handleMagicLink} className="space-y-3">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest">Email address</label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        {isDev && (
          <button
            type="submit"
            disabled={devLoading}
            className="w-full rounded-2xl py-4 text-base font-bold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}
          >
            {devLoading ? 'Signing in…' : 'Dev Login (instant)'}
          </button>
        )}

        {hasMagicLink && (
          <button
            type={isDev ? 'button' : 'submit'}
            onClick={isDev ? handleMagicLink : undefined}
            disabled={loading}
            className="w-full rounded-2xl py-4 text-base font-bold text-white shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-60 grad-primary"
          >
            {loading ? 'Sending…' : 'Send magic link'}
          </button>
        )}

        {!isDev && !hasMagicLink && (
          <div className="rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 px-4 py-5 text-center">
            <p className="text-sm text-slate-400">No sign-in method configured.</p>
            <p className="text-xs text-slate-400 mt-0.5">Add credentials to <code className="bg-slate-100 px-1 rounded">.env.local</code></p>
          </div>
        )}
      </form>

      {(hasGoogle || hasApple) && (
        <>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <div className="space-y-3">
            {hasGoogle && (
              <button
                onClick={() => signIn('google', { callbackUrl })}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            )}
            {hasApple && (
              <button
                onClick={() => signIn('apple', { callbackUrl })}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-slate-900 bg-slate-900 py-3.5 text-sm font-semibold text-white hover:bg-black active:scale-[0.98] transition-all"
              >
                <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor">
                  <path d="M13.173 9.545c-.02-2.17 1.77-3.22 1.85-3.27-1.01-1.476-2.58-1.677-3.133-1.698-1.327-.135-2.593.786-3.264.786-.671 0-1.7-.768-2.8-.748-1.435.02-2.766.838-3.502 2.125C.844 9.17 1.966 13.41 3.468 15.73c.744 1.075 1.626 2.275 2.78 2.232 1.12-.044 1.543-.717 2.897-.717 1.354 0 1.742.717 2.928.694 1.204-.022 1.965-1.086 2.696-2.168.858-1.238 1.205-2.449 1.222-2.512-.027-.012-2.34-.896-2.364-3.553l-.454-.16Zm-2.2-6.55c.608-.748.02-2.014-.55-2.662-.597.022-1.654.399-2.284 1.168-.585.707-.19 1.962.39 2.54.637.622 1.837.576 2.444-.046Z"/>
                </svg>
                Continue with Apple
              </button>
            )}
          </div>
        </>
      )}

      <p className="text-center text-xs text-slate-400 pb-4 leading-relaxed">
        By continuing you agree to our{' '}
        <span className="text-blue-600 font-medium">Terms</span> &amp;{' '}
        <span className="text-blue-600 font-medium">Privacy Policy</span>
      </p>
    </div>
  )
}
