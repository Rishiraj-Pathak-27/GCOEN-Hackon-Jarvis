'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';

const links = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/intake', label: 'Patient Intake', icon: '📋' },
  { href: '/analysis', label: 'AI Analysis', icon: '🤖' },
  { href: '/queue', label: 'Triage Queue', icon: '👥' },
  { href: '/history', label: 'History', icon: '📁' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { stats } = useApp();

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand" style={{ textDecoration: 'none' }}>
        <span className="logo">🏥</span>
        TriageAI
      </Link>

      <div className="navbar-links">
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={`nav-link ${pathname === l.href ? 'active' : ''}`}
          >
            {l.icon} {l.label}
          </Link>
        ))}
      </div>

      <div className="navbar-right">
        {stats.critical > 0 && (
          <span className="header-badge critical">
            🔴 {stats.critical} Critical
          </span>
        )}
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {stats.total} patients
        </span>
      </div>
    </nav>
  );
}
