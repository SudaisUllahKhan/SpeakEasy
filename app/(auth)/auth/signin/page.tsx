// Server component — safely reads env vars and passes flags down
import { SignInForm } from './SignInForm'

export default function SignInPage() {
  // Check which providers are actually configured with real credentials
  const isDev = process.env.NODE_ENV === 'development'

  const hasGoogle =
    !!process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID !== 'stub' &&
    !process.env.GOOGLE_CLIENT_ID.startsWith('xxxxx')

  const hasApple =
    !!process.env.APPLE_ID &&
    process.env.APPLE_ID !== 'stub' &&
    !process.env.APPLE_ID.startsWith('com.your')

  const hasMagicLink =
    !!process.env.RESEND_API_KEY &&
    process.env.RESEND_API_KEY !== 'stub' &&
    !process.env.RESEND_API_KEY.startsWith('re_xxx')

  return (
    <SignInForm
      isDev={isDev}
      hasGoogle={hasGoogle}
      hasApple={hasApple}
      hasMagicLink={hasMagicLink}
    />
  )
}
