const HERO = 'linear-gradient(145deg, #0F2557 0%, #1E40AF 45%, #2563EB 80%, #3B82F6 100%)'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: HERO }}>
      {/* Decorative blobs */}
      <div className="absolute" style={{ top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <div className="absolute" style={{ top: 120, left: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
      <div className="absolute" style={{ bottom: 200, right: 20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

      {/* Brand */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center pt-16 pb-10 px-6 relative z-10">
        <div className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <svg width="38" height="38" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2a4 4 0 014 4v6a4 4 0 01-8 0V6a4 4 0 014-4z" fill="rgba(255,255,255,0.9)"/>
            <path d="M19 10v1a7 7 0 01-14 0v-1M12 19v4M8 23h8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="font-black text-white" style={{ fontSize: 32, letterSpacing: -0.5 }}>SpeakEasy</h1>
        <p className="font-semibold mt-1" style={{ color: 'rgba(147,197,253,0.9)', fontSize: 13 }}>AI English Speaking Practice</p>
      </div>

      {/* White card */}
      <div className="flex-1 relative z-10 flex justify-center px-5 pb-8 pt-8" style={{ background: '#fff', borderRadius: '32px 32px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}>
        <div className="w-full" style={{ maxWidth: 380 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
