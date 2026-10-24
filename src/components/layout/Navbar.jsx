import React, { useState } from 'react';
import { 
  HeartHandshake, 
  LayoutDashboard, 
  PenLine, 
  History, 
  HelpCircle, 
  ShieldCheck,
  MessageSquare,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

/**
 * Navbar - Floating Oval Glassmorphism Navigation Bar
 * 
 * Features:
 * - Horizontally centered, floating pill/oval container with backdrop-filter blur
 * - High-end translucent dark glass with subtle emerald highlights
 * - Fits brand, all 7 navigation links, and theme toggle in a single row on desktop
 * - Clear active state with soft emerald pill indicator
 * - Sleek mobile menu toggle opening a floating dark glass modal
 * - Removed obsolete top prototype banner while keeping all destinations accessible
 */
export default function Navbar({ activeTab, setActiveTab, hasCheckedInToday, theme = 'dark', toggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, title: 'Overview & Daily Balance' },
    { id: 'checkin', label: hasCheckedInToday ? 'Today’s Log' : 'Check-In', icon: PenLine, highlight: !hasCheckedInToday, title: 'Daily Wellness Check-In' },
    { id: 'chat', label: 'AI Companion', icon: MessageSquare, title: 'Gemma Mental Health Companion' },
    { id: 'history', label: 'Trends', icon: History, title: '7-Day History & Wellness Trends' },
    { id: 'reflections', label: 'Reflections', icon: HelpCircle, title: 'Journaling & Guided Prompts' },
    { id: 'support', label: 'Support', icon: HeartHandshake, title: 'Emergency Helplines & Campus Care' },
    { id: 'privacy', label: 'Privacy', icon: ShieldCheck, title: 'Privacy Notice & Architecture Limits' }
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-floating-wrapper" role="banner">
      <div className="navbar-pill-container">
        {/* Brand Link */}
        <a 
          href="#dashboard" 
          className="navbar-brand"
          onClick={(e) => { e.preventDefault(); handleNavClick('dashboard'); }}
          aria-label="HostelWell - Home"
        >
          <div className="navbar-brand-emblem" aria-hidden="true">
            <Sparkles size={16} />
          </div>
          <span className="navbar-brand-text">HostelWell</span>
        </a>

        {/* Desktop Navigation Links (Single Row) */}
        <nav className="navbar-desktop-nav" aria-label="Primary Navigation">
          <ul className="navbar-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id} className="navbar-nav-item">
                  <button
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`navbar-nav-btn ${isActive ? 'is-active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    title={item.title}
                  >
                    <Icon size={14} className="navbar-btn-icon" aria-hidden="true" />
                    <span className="navbar-btn-label">{item.label}</span>
                    {item.highlight && (
                      <span className="navbar-pending-dot" title="Check-in pending today" aria-label="Check-in pending today" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right Actions: Theme Toggle & Mobile Menu Trigger */}
        <div className="navbar-actions">
          {/* Theme Toggle Button */}
          <button
            type="button"
            className="navbar-theme-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === 'dark' ? "Switch to light theme" : "Switch to dark theme"}
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? (
              <Sun size={15} aria-hidden="true" />
            ) : (
              <Moon size={15} aria-hidden="true" />
            )}
          </button>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            className="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Floating Dark Glass Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div 
          className="navbar-mobile-glass-card" 
          role="dialog" 
          aria-modal="true" 
          aria-label="Mobile Navigation Menu"
        >
          <nav aria-label="Mobile Navigation Links">
            <ul className="navbar-mobile-list">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`navbar-mobile-btn ${isActive ? 'is-active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <div className="navbar-mobile-btn-left">
                        <Icon size={17} aria-hidden="true" />
                        <span>{item.label}</span>
                      </div>
                      {item.highlight && (
                        <span className="navbar-mobile-pending-tag">Pending</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
