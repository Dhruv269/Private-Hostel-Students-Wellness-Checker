import React from 'react';
import { Shield, PhoneCall, Sun, Moon, Sparkles, Wind } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer({ 
  setActiveTab, 
  theme = 'dark', 
  toggleTheme,
  calmMode = false,
  toggleCalmMode
}) {
  return (
    <footer className="footer-cinematic" role="contentinfo">
      <div className="footer-cinematic-inner">
        {/* Brand & Purpose Column */}
        <div className="footer-col-main">
          <div className="footer-brand-header">
            <div className="footer-brand-emblem" aria-hidden="true">
              <Sparkles size={16} />
            </div>
            <span className="footer-brand-title">HostelWell</span>
            <span className="footer-brand-subtitle">Find Your Balance</span>
          </div>
          <p className="footer-desc">
            An in-memory, private wellness sanctuary designed for hostel students across India. Reflect on daily pressures, track inner stamina, and notice emotional patterns without surveillance.
          </p>
          <div className="footer-disclaimer-box">
            <div className="footer-disclaimer-title">
              <Shield size={14} aria-hidden="true" />
              <span>Non-Medical & Non-Diagnostic Disclaimer</span>
            </div>
            <p className="footer-disclaimer-text">
              HostelWell is an autonomous self-reflection tool. It does not provide clinical diagnoses, psychiatric treatment, or replace professional mental health care.
            </p>
          </div>
        </div>

        {/* Quick Navigation Column */}
        <div className="footer-col-nav">
          <h3 className="footer-col-heading">Navigation</h3>
          <ul className="footer-nav-list">
            <li>
              <button 
                type="button" 
                onClick={() => setActiveTab('dashboard')} 
                className="footer-link-btn"
              >
                Dashboard
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => setActiveTab('checkin')} 
                className="footer-link-btn"
              >
                Daily Check-In
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => setActiveTab('chat')} 
                className="footer-link-btn"
              >
                AI Companion
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => setActiveTab('history')} 
                className="footer-link-btn"
              >
                Trends & History
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => setActiveTab('reflections')} 
                className="footer-link-btn"
              >
                Reflection Prompts
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => setActiveTab('privacy')} 
                className="footer-link-btn"
              >
                Privacy & Data Storage
              </button>
            </li>
          </ul>
        </div>

        {/* Verified Helplines Column */}
        <div className="footer-col-support">
          <h3 className="footer-col-heading">Verified Helplines (India 24/7)</h3>
          <div className="footer-helpline-stack">
            <div className="footer-helpline-card">
              <div className="footer-helpline-name">Govt. Tele-MANAS (Free 24/7)</div>
              <div className="footer-helpline-numbers">
                <a href="tel:14416" className="footer-helpline-link" aria-label="Call Tele-MANAS at 14416">
                  <PhoneCall size={12} aria-hidden="true" /> 14416
                </a>
                <span className="footer-divider">•</span>
                <a href="tel:18008914416" className="footer-helpline-link" aria-label="Call Tele-MANAS at 1800 891 4416">
                  1800 891 4416
                </a>
              </div>
            </div>

            <div className="footer-helpline-card">
              <div className="footer-helpline-name">KIRAN Mental Health Line</div>
              <div className="footer-helpline-numbers">
                <a href="tel:18005990019" className="footer-helpline-link" aria-label="Call KIRAN at 1800 599 0019">
                  <PhoneCall size={12} aria-hidden="true" /> 1800-599-0019
                </a>
              </div>
            </div>

            <div className="footer-helpline-card footer-helpline-emergency">
              <div className="footer-helpline-name">National Emergency Services</div>
              <div className="footer-helpline-numbers">
                <a href="tel:112" className="footer-helpline-link" aria-label="Call National Emergency 112">
                  <PhoneCall size={12} aria-hidden="true" /> 112 (Police / Ambulance)
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <p className="footer-copyright">
            © {CURRENT_YEAR} HostelWell. Dedicated to student mental equilibrium across India.
          </p>

          <div className="footer-bottom-actions">
            {/* Calm Mode Quick Toggle */}
            {toggleCalmMode && (
              <button
                type="button"
                className={`footer-action-btn ${calmMode ? 'is-calm-active' : ''}`}
                onClick={toggleCalmMode}
                aria-label={calmMode ? "Disable Calm Mode" : "Enable Calm Mode"}
                aria-pressed={calmMode}
              >
                <Wind size={13} aria-hidden="true" />
                <span>{calmMode ? 'Calm Mode: On' : 'Calm Mode: Off'}</span>
              </button>
            )}

            <button
              type="button"
              className="footer-theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? "Switch to light theme" : "Switch to dark theme"}
            >
              {theme === 'dark' ? <Sun size={14} aria-hidden="true" /> : <Moon size={14} aria-hidden="true" />}
              <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
