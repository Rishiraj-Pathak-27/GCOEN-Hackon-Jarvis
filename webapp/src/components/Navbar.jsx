import { Bell, Search, Settings } from 'lucide-react';

const pageTitles = {
  '/': 'Welcome',
  '/dashboard': 'Emergency Dashboard',
  '/intake': 'Patient Intake',
  '/analysis': 'AI Analysis Results',
  '/blood-bank': 'Blood Bank Finder',
  '/maps': 'Emergency Maps',
  '/queue': 'Patient Queue',
  '/alerts': 'Emergency Alerts',
};

export default function Navbar({ pathname }) {
  const title = pageTitles[pathname] || 'AI Emergency Triage';
  return (
    <header className="navbar">
      <div className="navbar-title">{title}</div>

      <div className="navbar-search">
        <Search size={14} color="var(--text-muted)" />
        <input placeholder="Search patient, ID..." />
      </div>

      <div className="navbar-actions">
        <div className="emergency-status">
          <div className="dot-blink" />
          ER Active
        </div>
        <button className="btn-icon">
          <Bell size={16} />
          <span className="dot" />
        </button>
        <button className="btn-icon">
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
