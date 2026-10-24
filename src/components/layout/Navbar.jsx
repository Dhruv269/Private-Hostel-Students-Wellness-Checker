import React from 'react';
import { 
  HeartHandshake, 
  LayoutDashboard, 
  PenLine, 
  History, 
  HelpCircle, 
  ShieldCheck,
  MessageSquare
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, hasCheckedInToday }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'checkin', label: hasCheckedInToday ? 'Today’s Log' : 'Daily Check-In', icon: PenLine, highlight: !hasCheckedInToday },
    { id: 'chat', label: 'AI Companion', icon: MessageSquare },
    { id: 'history', label: 'History & Trends', icon: History },
    { id: 'reflections', label: 'Reflections', icon: HelpCircle },
    { id: 'support', label: 'Support & Helplines', icon: HeartHandshake },
    { id: 'privacy', label: 'Privacy & Limits', icon: ShieldCheck }
  ];

  return (
    <header className="navbar" role="banner">
      <div className="prototype-banner" role="status">
        <span className="prototype-badge">Stage 3 Live</span>
        <span>Check-in data is in browser memory. AI reflection companion connects locally to the Gemma MoE backend on port 5002.</span>
      </div>

      <div className="navbar-inner">
        <a 
          href="#dashboard" 
          className="brand"
          onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
          aria-label="HostelWell home"
        >
          <div className="brand-icon-wrapper" aria-hidden="true">
            🌱
          </div>
          <span>HostelWell</span>
          <span className="brand-badge">India</span>
        </a>

        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`nav-btn ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <IconComponent size={17} aria-hidden="true" />
                    <span>{item.label}</span>
                    {item.highlight && (
                      <span className="badge badge-calm" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                        Pending
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
