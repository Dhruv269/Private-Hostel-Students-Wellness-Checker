import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Cpu, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  Database
} from 'lucide-react';

export default function PrivacyNotice() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>
          Privacy, Data Protection & System Limits
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Transparent details on what HostelWell stores, our security architecture, and our non-diagnostic boundaries.
        </p>
      </div>

      {/* Primary Trust Guarantees */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ background: 'var(--bg-surface-elevated)' }}>
          <div style={{ color: 'var(--color-primary-light)', marginBottom: '0.5rem' }}>
            <EyeOff size={24} aria-hidden="true" />
          </div>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>Never Public</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Your check-in entries, mood scores, and reflection notes are never shared with campus authorities, wardens, or peers.
          </p>
        </div>

        <div className="card" style={{ background: 'var(--bg-surface-elevated)' }}>
          <div style={{ color: 'var(--color-accent-lavender)', marginBottom: '0.5rem' }}>
            <ShieldCheck size={24} aria-hidden="true" />
          </div>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>Non-Diagnostic</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            We never label you with psychological conditions or claim clinical authority. This is a personal wellness mirror.
          </p>
        </div>

        <div className="card" style={{ background: 'var(--bg-surface-elevated)' }}>
          <div style={{ color: 'var(--color-warning)', marginBottom: '0.5rem' }}>
            <Database size={24} aria-hidden="true" />
          </div>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>Prototype Storage</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            In Stage 2, records exist strictly in local memory. In Stage 3, Supabase Row Level Security will ensure data isolation.
          </p>
        </div>
      </div>

      {/* Detailed Accordion-style or Sectional breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Section 1: Data Storage in Prototype */}
        <section className="card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} style={{ color: 'var(--color-primary-light)' }} aria-hidden="true" />
            <span>1. What is stored in this Stage 2 Prototype?</span>
          </h2>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            This application is currently running in <strong>Stage 2 (Frontend Foundation)</strong>. That means:
          </p>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '0.5rem' }}>
            <li>All check-in entries you submit are stored in temporary, in-memory React application state for your current browser session.</li>
            <li>No database is connected yet. If you refresh or close this browser tab, any newly logged entries reset to the initial demo set.</li>
            <li>No cookies, tracking scripts, or analytics pixels are transmitting your reflection notes.</li>
          </ul>

          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-md)', padding: '0.85rem', marginTop: '1rem', fontSize: '0.825rem', color: '#fde68a' }}>
            <strong>Important Caution for Students:</strong> Because this is an in-memory prototype, please do not type sensitive personal passwords, contact numbers, or clinical health histories into the optional reflection note field.
          </div>
        </section>

        {/* Section 2: Future Supabase Row Level Security Plan */}
        <section className="card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={18} style={{ color: 'var(--color-accent-lavender)' }} aria-hidden="true" />
            <span>2. How will data be protected in Stage 3 (Supabase)?</span>
          </h2>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            In Stage 3, when persistent authentication and database storage are connected:
          </p>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '0.5rem' }}>
            <li><strong>Row Level Security (RLS):</strong> The Postgres database will enforce database-level policies where each user can only execute <code>SELECT</code>, <code>INSERT</code>, <code>UPDATE</code>, or <code>DELETE</code> queries on rows matching their own authenticated user ID (<code>auth.uid() = user_id</code>).</li>
            <li><strong>Zero Public Access:</strong> No unauthenticated user can read table contents, and students cannot access other students' check-ins.</li>
            <li><strong>Zero Frontend Secrets:</strong> Supabase service-role keys are never placed in browser JavaScript. Only the public anonymous key is used alongside secure JWT tokens.</li>
          </ul>
        </section>

        {/* Section 3: AI Boundaries */}
        <section className="card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={18} style={{ color: 'var(--color-primary-light)' }} aria-hidden="true" />
            <span>3. What can and cannot AI do in this project?</span>
          </h2>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            When the AI reflection feature is introduced in Stage 4:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={16} aria-hidden="true" /> What AI Can Do
              </div>
              <ul style={{ paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <li>Offer optional, non-judgmental reflection prompts.</li>
                <li>Encourage balanced pacing and regular rest breaks.</li>
                <li>Suggest simple grounding or journaling questions.</li>
              </ul>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ color: 'var(--color-stress)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertCircle size={16} aria-hidden="true" /> What AI Will Never Do
              </div>
              <ul style={{ paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <li>Never act as a therapist or clinical counselor.</li>
                <li>Never diagnose anxiety, depression, or medical conditions.</li>
                <li>Never claim certainty about a human being's state of mind.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4: Academic Integrity & Student Agency */}
        <section className="card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={18} style={{ color: 'var(--color-primary-light)' }} aria-hidden="true" />
            <span>4. Scope and Clinical Disclaimers</span>
          </h2>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
            HostelWell is intended solely for personal self-awareness. If you are experiencing persistent sadness, panic attacks, thoughts of self-harm, or severe exhaustion, self-reflection software is not a substitute for human medical attention. Please consult a qualified mental health professional or call verified 24/7 helplines like Tele-MANAS (14416).
          </p>
        </section>
      </div>
    </div>
  );
}
