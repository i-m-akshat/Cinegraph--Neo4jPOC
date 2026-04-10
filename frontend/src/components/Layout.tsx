import { ReactNode } from 'react';
import { Navbar } from './Navbar';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-grid" style={{ backgroundColor: '#f8f4ff' }}>
      {/* Top ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 45% at 50% -5%, rgba(139,92,246,0.08) 0%, transparent 65%)',
        }}
      />
      {/* Bottom-right pastel accent */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 40% at 95% 105%, rgba(16,185,129,0.06) 0%, transparent 60%)',
        }}
      />
      <Navbar />
      <main className="pt-[60px] relative">{children}</main>
    </div>
  );
}
