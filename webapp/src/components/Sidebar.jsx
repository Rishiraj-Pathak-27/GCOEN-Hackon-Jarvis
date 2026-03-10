import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, UserPlus, Activity, Droplets,
  Map, ListOrdered, Bell, Home, LogOut, Settings
} from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Welcome' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: 3 },
  { to: '/intake', icon: UserPlus, label: 'Patient Intake' },
  { to: '/analysis', icon: Activity, label: 'AI Analysis' },
  { to: '/blood-bank', icon: Droplets, label: 'Blood Bank Finder' },
  { to: '/maps', icon: Map, label: 'Emergency Maps' },
  { to: '/queue', icon: ListOrdered, label: 'Patient Queue' },
  { to: '/alerts', icon: Bell, label: 'Emergency Alerts', badge: 5 },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🏥</div>
        <div>
          <h2>AI Triage</h2>
          <span>Emergency Assistant</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Navigation</div>
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon"><Icon size={17} /></span>
            {label}
            {badge && <span className="nav-badge">{badge}</span>}
          </NavLink>
        ))}

        <div className="nav-section-title" style={{ marginTop: 12 }}>System</div>
        <div className="nav-item">
          <span className="nav-icon"><Settings size={17} /></span>
          Settings
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="avatar">DR</div>
        <div className="user-info">
          <h4>Dr. Rishi Raj</h4>
          <p>Emergency Physician</p>
        </div>
      </div>
    </aside>
  );
}
