'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard', label: 'Home',     Icon: HomeIcon     },
  { href: '/topics',    label: 'Topics',   Icon: TopicsIcon   },
  { href: '/review',   label: 'Review',   Icon: ReviewIcon   },
  { href: '/progress', label: 'Progress', Icon: ProgressIcon },
  { href: '/settings', label: 'Profile',  Icon: ProfileIcon  },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: '#fff', borderTop: '1px solid #E2E8F0', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex max-w-md mx-auto" style={{ height: 60 }}>
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const hrefAny = href as any
          return (
            <Link key={href} href={hrefAny} className="flex flex-col items-center justify-center flex-1 relative">
              {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full" style={{ background: '#2563EB' }} />}
              <Icon active={active} />
              <span className="text-[10px] font-bold mt-0.5" style={{ color: active ? '#2563EB' : '#94A3B8' }}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function HomeIcon({ active }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#2563EB' : 'none'} stroke={active ? '#2563EB' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}
function TopicsIcon({ active }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563EB' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="2" fill={active ? '#DBEAFE' : 'none'}/><rect x="14" y="3" width="7" height="7" rx="2" fill={active ? '#DBEAFE' : 'none'}/><rect x="3" y="14" width="7" height="7" rx="2" fill={active ? '#DBEAFE' : 'none'}/><rect x="14" y="14" width="7" height="7" rx="2" fill={active ? '#DBEAFE' : 'none'}/></svg>
}
function ReviewIcon({ active }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#2563EB' : 'none'} stroke={active ? '#2563EB' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
}
function ProgressIcon({ active }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563EB' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
}
function ProfileIcon({ active }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563EB' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
}
