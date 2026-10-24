import React from 'react';
import { 
  PhoneCall, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  Building2, 
  Compass, 
  Clock,
  Sparkles
} from 'lucide-react';
import { VERIFIED_INDIAN_RESOURCES, CAMPUS_SUPPORT_GUIDANCE } from '../../data/mockData';

export default function SupportResources() {
  return (
    <div className="support-page-cinematic">
      <header className="page-cinematic-header">
        <div className="header-eyebrow">
          <Sparkles size={14} className="text-emerald-400" aria-hidden="true" />
          <span>Care Directory</span>
        </div>
        <h1 className="header-main-title">
          Verified Support & Campus Helplines (India)
        </h1>
        <p className="header-lead">
          Verified national helplines and practical advice for hostel students dealing with stress, acute anxiety, or loneliness.
        </p>
      </header>

      {/* Immediate Emergency Crisis Alert Banner */}
      <section className="cinematic-card crisis-banner-card" role="alert" aria-labelledby="crisis-banner-title">
        <div className="crisis-banner-inner">
          <div className="crisis-banner-icon-box">
            <AlertTriangle size={24} className="text-coral-400" aria-hidden="true" />
          </div>
          <div className="crisis-banner-body">
            <h2 id="crisis-banner-title" className="crisis-banner-title">
              Immediate Crisis or Urgent Danger?
            </h2>
            <p className="crisis-banner-lead">
              HostelWell is a personal self-reflection platform and cannot provide live emergency medical intervention. If you or someone around you is in immediate distress or having thoughts of self-harm, connect right now:
            </p>
            <div className="crisis-banner-actions">
              <a 
                href="tel:112" 
                className="btn-cinematic-emergency"
                aria-label="Call National Emergency 112 immediately"
              >
                <PhoneCall size={15} aria-hidden="true" />
                <span>Call 112 (National Police/Ambulance)</span>
              </a>
              <a 
                href="tel:14416" 
                className="btn-cinematic-primary"
                aria-label="Call Govt Tele-MANAS at 14416"
              >
                <PhoneCall size={15} aria-hidden="true" />
                <span>Call 14416 (Tele-MANAS 24/7 Free)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Helplines Directory */}
      <section aria-labelledby="helplines-heading" className="support-directory-section">
        <div className="section-title-row">
          <ShieldCheck size={20} className="text-emerald-400" aria-hidden="true" />
          <h2 id="helplines-heading" className="directory-section-heading">
            Verified Free 24/7 National Helplines (India)
          </h2>
        </div>

        <div className="helpline-cards-grid">
          {VERIFIED_INDIAN_RESOURCES.map((item) => (
            <div key={item.id} className="cinematic-card helpline-glass-card">
              <div className="helpline-card-top">
                <div className="helpline-badges">
                  <span className="badge-category-pill">{item.type}</span>
                  <span className="helpline-hours">
                    <Clock size={12} aria-hidden="true" />
                    <span>{item.availability}</span>
                  </span>
                </div>

                <h3 className="helpline-name-text">{item.name}</h3>
                <p className="helpline-desc-text">{item.description}</p>

                <div className="helpline-specs-list">
                  <div>🌐 <strong>Languages:</strong> {item.languages}</div>
                  <div>💳 <strong>Cost:</strong> {item.cost}</div>
                </div>
              </div>

              <div className="helpline-contact-row">
                <div className="helpline-call-group">
                  <span className="helpline-call-label">Direct 1-Tap Dial</span>
                  <a href={`tel:${item.phone.replace(/[^0-9+]/g, '')}`} className="helpline-tel-link">
                    {item.phone}
                  </a>
                  {item.altPhone && (
                    <div className="helpline-alt-link">
                      Alt: <a href={`tel:${item.altPhone.replace(/[^0-9+]/g, '')}`}>{item.altPhone}</a>
                    </div>
                  )}
                </div>

                {item.officialLink && (
                  <a 
                    href={item.officialLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-cinematic-ghost btn-sm"
                    title={`Visit official website of ${item.name}`}
                  >
                    <span>Website</span>
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Campus Guidance */}
      <section aria-labelledby="campus-guide-heading" className="support-campus-section">
        <div className="section-title-row">
          <Building2 size={20} className="text-emerald-400" aria-hidden="true" />
          <h2 id="campus-guide-heading" className="directory-section-heading">
            Navigating Campus Care as a Hostel Resident
          </h2>
        </div>

        <div className="campus-guide-grid">
          {CAMPUS_SUPPORT_GUIDANCE.map((guide, idx) => (
            <div key={idx} className="cinematic-card campus-guide-tile">
              <h3 className="campus-guide-title">{guide.title}</h3>
              <p className="campus-guide-body">{guide.detail}</p>
            </div>
          ))}
        </div>

        {/* What to Say Advice */}
        <div className="cinematic-card helpline-advice-card">
          <div className="advice-header">
            <Compass size={18} className="text-emerald-400" aria-hidden="true" />
            <h3 className="advice-title">Unsure what to say when calling a counselor?</h3>
          </div>
          <p className="advice-body">
            You do not need an agenda. You can say: <em>"Hi, I'm a student living in a campus hostel. I've been feeling overwhelmed with my schedule lately and just wanted someone to talk to for a few minutes."</em> Helplines are anonymous and will not notify your university.
          </p>
        </div>
      </section>
    </div>
  );
}
