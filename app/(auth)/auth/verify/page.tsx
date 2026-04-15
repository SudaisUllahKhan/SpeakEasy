export default function VerifyPage() {
  return (
    <div className="w-full max-w-sm text-center space-y-4">
      <div className="text-5xl">✉️</div>
      <h1 className="text-2xl font-bold text-gray-900">Check your inbox</h1>
      <p className="text-gray-600 text-sm leading-relaxed">
        A sign-in link has been sent to your email address.<br />
        Tap the link to sign in to SpeakEasy.
      </p>
      <p className="text-xs text-gray-400">
        Didn&apos;t receive it? Check your spam folder or{' '}
        <a href="/auth/signin" className="text-[#1E56A0] underline">
          try again
        </a>
        .
      </p>
    </div>
  )
}
