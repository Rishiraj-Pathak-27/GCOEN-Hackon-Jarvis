import { useRef, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from 'framer-motion';
import { IconMenu2, IconX } from '@tabler/icons-react';

const navItems = [
  { name: 'Home', link: '/' },
  { name: 'Dashboard', link: '/dashboard' },
  { name: 'Patient Intake', link: '/intake' },
  { name: 'AI Analysis', link: '/analysis' },
  { name: 'Blood Bank', link: '/blood-bank' },
  { name: 'Emergency Maps', link: '/maps' },
  { name: 'Queue', link: '/queue' },
  { name: 'Alerts', link: '/alerts' },
];

/* ─── Hover pill on desktop links ─────────────────────── */
function NavItems({ onItemClick }) {
  const [hovered, setHovered] = useState(null);
  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 2,
      }}
    >
      {navItems.map((item, idx) => (
        <NavLink
          key={item.link}
          to={item.link}
          end={item.link === '/'}
          onClick={onItemClick}
          onMouseEnter={() => setHovered(idx)}
          style={{ position: 'relative', padding: '8px 12px', fontSize: 14, fontWeight: 600, textDecoration: 'none', color: 'var(--text-secondary)', zIndex: 20 }}
          className={({ isActive }) => isActive ? 'topnav-link active' : 'topnav-link'}
        >
          {hovered === idx && (
            <motion.div
              layoutId="nav-hovered"
              style={{
                position: 'absolute', inset: 0,
                borderRadius: 8,
                background: 'var(--primary-light)',
                zIndex: -1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span style={{ position: 'relative', zIndex: 20 }}>{item.name}</span>
        </NavLink>
      ))}
    </motion.div>
  );
}

/* ─── Main Navbar ──────────────────────────────────────── */
export default function TopNav() {
  const ref = useRef(null);
  const { scrollY } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const [visible, setVisible] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setVisible(latest > 80);
  });

  return (
    <motion.div
      ref={ref}
      style={{ position: 'fixed', inset: '0 0 auto 0', top: 12, zIndex: 5000, display: 'flex', justifyContent: 'center' }}
    >
      {/* ── Desktop NavBody ── */}
      <motion.div
        animate={{
          backdropFilter: visible ? 'blur(12px)' : 'none',
          boxShadow: visible
            ? '0 0 24px rgba(34,42,53,0.08), 0 1px 1px rgba(0,0,0,0.05), 0 0 0 1px rgba(34,42,53,0.06), 0 16px 68px rgba(47,48,55,0.06)'
            : 'none',
          width: visible ? '72%' : '100%',
          borderRadius: visible ? 9999 : 0,
          y: visible ? 8 : 0,
          background: visible ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.98)',
          borderBottom: visible ? '1px solid transparent' : '1px solid var(--border)',
          paddingLeft: visible ? 20 : 48,
          paddingRight: visible ? 20 : 48,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 40 }}
        style={{
          minWidth: 800,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0, zIndex: 20 }}>
          <div style={{
            width: 38, height: 38, background: 'var(--accent-red)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}>🏥</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>AI Triage</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 500 }}>Emergency Assistant</div>
          </div>
        </Link>

        {/* Center Nav Links */}
        <NavItems />

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, zIndex: 20 }}>
          <motion.div
            animate={{ opacity: visible ? 0 : 1, width: visible ? 0 : 'auto', overflow: 'hidden' }}
            style={{ display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--accent-red-light)', border: '1px solid rgba(229,57,53,0.25)',
              borderRadius: 20, padding: '5px 12px', fontSize: 12, fontWeight: 700, color: 'var(--accent-red)',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ width: 7, height: 7, background: 'var(--accent-red)', borderRadius: '50%', animation: 'blink 1.2s infinite', display: 'inline-block' }} />
            ER Active — 3 Critical
          </motion.div>
          <Link to="/intake" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 700,
            background: 'var(--accent-red)', color: '#fff', textDecoration: 'none',
            transition: 'all 0.2s ease', whiteSpace: 'nowrap',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#c62828'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(229,57,53,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-red)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            🚑 Start Triage
          </Link>
        </div>
      </motion.div>

      {/* ── Mobile Nav ── */}
      <motion.div
        animate={{
          backdropFilter: visible ? 'blur(10px)' : 'none',
          width: visible ? '92%' : '100%',
          borderRadius: visible ? 12 : 0,
          y: visible ? 8 : 0,
          background: visible ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.98)',
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 40 }}
        style={{
          display: 'none',
          flexDirection: 'column',
          position: 'relative',
          padding: '12px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, background: 'var(--accent-red)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏥</div>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>AI Triage</span>
          </Link>
          <button onClick={() => setMobileOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            {mobileOpen ? <IconX size={22} /> : <IconMenu2 size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}
            >
              {navItems.map(item => (
                <NavLink
                  key={item.link}
                  to={item.link}
                  end={item.link === '/'}
                  onClick={() => setMobileOpen(false)}
                  style={{ padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', color: 'var(--text-secondary)' }}
                  className={({ isActive }) => isActive ? 'topnav-link active' : 'topnav-link'}
                >
                  {item.name}
                </NavLink>
              ))}
              <Link to="/intake" onClick={() => setMobileOpen(false)} style={{
                marginTop: 8, padding: '11px 16px', borderRadius: 8, fontSize: 14, fontWeight: 700,
                background: 'var(--accent-red)', color: '#fff', textDecoration: 'none', textAlign: 'center',
              }}>
                🚑 Start Triage
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
