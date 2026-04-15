import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SpeakEasy — AI Speaking Practice',
    short_name: 'SpeakEasy',
    description:
      'AI-powered English speaking practice for ESL learners. Listen, read aloud, and get instant feedback.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#1E56A0',
    categories: ['education', 'productivity'],
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: '/screenshots/home.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow' as never,
        label: 'Home dashboard with streak and daily lesson',
      },
    ],
    shortcuts: [
      {
        name: 'Start Today\'s Lesson',
        url: '/topics',
        description: 'Jump straight to the topic browser',
      },
    ],
  }
}
