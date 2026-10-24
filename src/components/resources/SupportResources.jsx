import React from 'react';
import { 
  PhoneCall, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  Building2, 
  Compass, 
  Clock
} from 'lucide-react';
import { VERIFIED_INDIAN_RESOURCES, CAMPUS_SUPPORT_GUIDANCE } from '../../data/mockData';

export default function SupportResources() {
  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>
          Verified Support & Campus Helplines (India)
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Real, verified national helplines and practical guidance for hostel students navigating distress, loneliness, or crisis.
        </p>
      </div>

      {/* Emergency Alert Banner */}
      <div style={{ 
        background: 'var(--color-stress-bg)', 
        border: '1.5px solid var(--color-stress)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '1.25rem 1.5rem', 
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem'
      }}>
        <AlertTriangle size={24} style={{ color: 'var(--color-stress)', flexShrink: 0, marginTop: '0.2rem' }} aria-hidden="true" />
        <div>
          <h2 style={{ fontSize: '1.1rem', color: '#fecdd3', marginBottom: '0.35rem' }}>
            Immediate Crisis or Safety Concerns?
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#fda4af', margin: '0 0 0.75rem 0', lineHeight: 1.5 }}>
            HostelWell is a personal self-reflection app and cannot provide live emergency intervention. If you or someone around you is in immediate danger, having thoughts of harming themselves, or in acute medical distress, reach out immediately:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <a 
              href="tel:112" 
              className="btn" 
              style={{ background: 'var(--color-stress)', color: '#fff', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            >
              <PhoneCall size={16} aria-hidden="true" />
              <span>Call 112 (National Emergency)</span>
            </a>
            <a 
              href="tel:14416" 
              className="btn btn-secondary" 
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            >
              <PhoneCall size={16} aria-hidden="true" />
              <span>Call 14416 (Tele-MANAS Free 24/7)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Verified Helplines Directory */}
      <section aria-labelledby="helplines-heading" style={{ marginBottom: '2.5rem' }}>
        <h2 id="helplines-heading" style={{ fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} style={{ color: 'var(--color-primary-light)' }} aria-hidden="true" />
          <span>Verified National Helplines (India)</span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {VERIFIED_INDIAN_RESOURCES.map((item) => (
            <div key={item.id} className="helpline-card">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className="badge badge-calm" style={{ fontSize: '0.75rem' }}>
                    {item.type}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} aria-hidden="true" />
                    {item.availability}
                  </span>
                </div>

                <h3 className="helpline-org">{item.name}</h3>
                <p className="helpline-desc">{item.description}</p>

                <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <div>🌐 <strong>Languages:</strong> {item.languages}</div>
                  <div>💳 <strong>Cost:</strong> {item.cost}</div>
                </div>
              </div>

              <div className="helpline-contact-row">
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone / Dial</div>
                  <a href={`tel:${item.phone.replace(/[^0-9+]/g, '')}`} className="helpline-number">
                    {item.phone}
                  </a>
                  {item.altPhone && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Alt: <a href={`tel:${item.altPhone.replace(/[^0-9+]/g, '')}`}>{item.altPhone}</a>
                    </div>
                  )}
                </div>

                {item.officialLink && (
                  <a 
                    href={item.officialLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-ghost"
                    style={{ fontSize: '0.78rem', padding: '0.4rem 0.6rem' }}
                    title={`Visit official site of ${item.name}`}
                  >
                    <span>Website</span>
                    <ExternalLink size={14} aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Campus Navigation Guidance for Hostel Students */}
      <section aria-labelledby="campus-guide-heading">
        <h2 id="campus-guide-heading" style={{ fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={20} style={{ color: 'var(--color-accent-lavender)' }} aria-hidden="true" />
          <span>Navigating Campus Support as a Hostel Resident</span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {CAMPUS_SUPPORT_GUIDANCE.map((guide, idx) => (
            <div key={idx} className="card" style={{ background: 'var(--bg-surface-elevated)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {guide.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {guide.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Practical tips for reaching out */}
        <div className="card" style={{ marginTop: '1.5rem', background: 'rgba(21, 29, 47, 0.6)' }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Compass size={18} style={{ color: 'var(--color-primary-light)' }} aria-hidden="true" />
            <span>Not sure what to say when calling a helpline?</span>
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            You do not need a speech prepared. You can simply say: <em>"Hello, I am a student living in a college hostel. I have been feeling quite stressed with exams/routine lately and just need someone outside my circle to talk to for a few minutes."</em> The counselors are trained specifically to listen without passing judgment or contacting your college.
          </p>
        </div>
      </section>
    </div>
  );
}
