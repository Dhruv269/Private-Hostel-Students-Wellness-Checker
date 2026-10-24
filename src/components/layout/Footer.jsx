import React from 'react';
import { Shield } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            <span>🌱 HostelWell</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Student Reflection Hub</span>
          </div>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.85rem' }}>
            A private, non-clinical wellness companion designed to help hostel students in India notice patterns in their daily mood, energy, and stress.
          </p>
          <div className="footer-disclaimer-box">
            <strong style={{ color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
              <Shield size={14} aria-hidden="true" />
              Non-Medical & Non-Diagnostic Disclaimer
            </strong>
            <p style={{ fontSize: '0.8rem', margin: 0 }}>
              This application is strictly for personal self-reflection. It does not diagnose mental health conditions, provide clinical treatment, or replace certified mental health professionals.
            </p>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Quick Navigation</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem', padding: 0 }}>
            <li>
              <button 
                type="button" 
                onClick={() => setActiveTab('dashboard')} 
                style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => setActiveTab('checkin')} 
                style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}
              >
                Daily Check-In
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => setActiveTab('history')} 
                style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}
              >
                Trends & History
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => setActiveTab('privacy')} 
                style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}
              >
                Privacy & Data Storage
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Verified Indian Helplines</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>Tele-MANAS (24/7)</div>
              <div style={{ color: 'var(--color-primary-light)', fontSize: '0.9rem', fontWeight: 600 }}>14416 / 1800 891 4416</div>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>KIRAN (Govt Helpline)</div>
              <div style={{ color: 'var(--color-primary-light)', fontSize: '0.9rem', fontWeight: 600 }}>1800-599-0019</div>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>National Emergency</div>
              <div style={{ color: 'var(--color-stress)', fontSize: '0.9rem', fontWeight: 700 }}>112</div>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ maxWidth: '1100px', margin: '2rem auto 0 auto', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        HostelWell Prototype (Stage 2) • Designed for privacy and peaceful self-reflection
      </div>
    </footer>
  );
}
