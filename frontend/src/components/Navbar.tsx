import { Link, useLocation } from 'react-router-dom';
import { Film, Users, Share2, LayoutDashboard, Hexagon } from 'lucide-react';

const NAV = [
  { to: '/',        label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/movies',  label: 'Movies',    Icon: Film },
  { to: '/actors',  label: 'Actors',    Icon: Users },
  { to: '/explore', label: 'Graph',     Icon: Share2 },
];

export function Navbar() {
  const { pathname } = useLocation();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 h-[60px]"
      style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(139,92,246,0.12)',
        boxShadow: '0 1px 12px rgba(109,40,217,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group select-none">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(16,185,129,0.18))',
              border: '1px solid rgba(139,92,246,0.28)',
              boxShadow: '0 2px 12px rgba(139,92,246,0.15)',
            }}
          >
            <Hexagon size={15} strokeWidth={1.8} style={{ color: '#7c3aed' }} />
          </div>
          <div className="leading-none">
            <div className="font-bold text-[15px] tracking-tight gradient-text">CineGraph</div>
            <div
              className="text-[9px] tracking-[0.15em] font-mono"
              style={{ color: 'rgba(124,58,237,0.45)' }}
            >
              NEO4J EXPLORER
            </div>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-0.5">
          {NAV.map(({ to, label, Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200"
                style={
                  active
                    ? {
                        background: 'rgba(139,92,246,0.1)',
                        color: '#7c3aed',
                        border: '1px solid rgba(139,92,246,0.22)',
                      }
                    : {
                        color: 'rgba(107,114,128,0.8)',
                        border: '1px solid transparent',
                      }
                }
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.color = '#7c3aed';
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(139,92,246,0.06)';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(107,114,128,0.8)';
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  }
                }}
              >
                <Icon size={14} strokeWidth={1.8} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Connection pill */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(5,150,105,0.08)',
            border: '1px solid rgba(5,150,105,0.2)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse-slow"
            style={{ background: '#059669', boxShadow: '0 0 6px rgba(5,150,105,0.7)' }}
          />
          <span
            className="text-[11px] font-mono font-medium"
            style={{ color: 'rgba(5,150,105,0.85)' }}
          >
            NEO4J
          </span>
        </div>
      </div>
    </header>
  );
}
