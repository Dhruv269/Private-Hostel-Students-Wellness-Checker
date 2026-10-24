import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Cpu, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  Database,
  Sparkles
} from 'lucide-react';

export default function PrivacyNotice() {
  return (
    <div className="privacy-page-cinematic">
      <header className="page-cinematic-header">
        <div className="header-eyebrow">
          <Sparkles size={14} className="text-emerald-400" aria-hidden="true" />
          <span>Ethics & Architecture</span>
        </div>
        <h1 className="header-main-title">
          Privacy, Data Protection & System Limits
        </h1>
        <p className="header-lead">
          Transparent details on what HostelWell stores, our ephemeral in-memory model, and non-diagnostic boundaries.
        </p>
      </header>

      {/* Primary Trust Guarantees */}
      <div className="privacy-guarantees-grid">
        <div className="cinematic-card privacy-guarantee-card">
          <div className="guarantee-icon-box">
            <EyeOff size={22} className="text-emerald-400" aria-hidden="true" />
          </div>
          <h2 className="guarantee-card-title">Never Shared</h2>
          <p className="guarantee-card-body">
            Your check-in entries, mood scores, and reflection notes are strictly private. Nothing is ever sent to campus authorities, wardens, or peers.
          </p>
        </div>

        <div className="cinematic-card privacy-guarantee-card">
          <div className="guarantee-icon-box">
            <ShieldCheck size={22} className="text-teal-400" aria-hidden="true" />
          </div>
          <h2 className="guarantee-card-title">Non-Diagnostic</h2>
          <p className="guarantee-card-body">
            We never categorize you with clinical disorders or claim medical authority. This application acts solely as a personal reflection mirror.
          </p>
        </div>

        <div className="cinematic-card privacy-guarantee-card">
          <div className="guarantee-icon-box">
            <Database size={22} className="text-amber-400" aria-hidden="true" />
          </div>
          <h2 className="guarantee-card-title">In-Memory Session</h2>
          <p className="guarantee-card-body">
            Check-in entries exist only in active browser RAM. Nothing is written to a persistent database or disk storage.
          </p>
        </div>
      </div>

      {/* Detailed Sectional Breakdown */}
      <div className="privacy-sections-stack">
        {/* Section 1: In-Memory Storage */}
        <section className="cinematic-card privacy-section-card">
          <div className="section-title-row">
            <Lock size={18} className="text-emerald-400" aria-hidden="true" />
            <h2 className="privacy-section-heading">1. In-Memory Session Boundary</h2>
          </div>
          <p className="privacy-section-desc">
            HostelWell operates under an intentional <strong>zero-retention architecture</strong>:
          </p>
          <ul className="privacy-section-list">
            <li>All check-in entries you record live strictly in temporary React application memory in your active tab.</li>
            <li>No database is attached. If you reload or close this tab, new session entries reset to the baseline demo dataset.</li>
            <li>No third-party trackers, telemetry scripts, or marketing cookies monitor your private notes.</li>
          </ul>

          <div className="privacy-caution-callout">
            <strong>Guidance for Students:</strong> Because this is an ephemeral session, please do not write sensitive passwords, phone numbers, or clinical histories into the reflection fields.
          </div>
        </section>

        {/* Section 2: Zero Server Logging & CORS */}
        <section className="cinematic-card privacy-section-card">
          <div className="section-title-row">
            <Database size={18} className="text-emerald-400" aria-hidden="true" />
            <h2 className="privacy-section-heading">2. Network Protection & Gemma Companion</h2>
          </div>
          <p className="privacy-section-desc">
            When you interact with the AI Reflection Companion:
          </p>
          <ul className="privacy-section-list">
            <li><strong>Zero Server Logging:</strong> The local Express server receives the chat array in memory to query Gemma. It does not write your conversation to disk, database, or server logs.</li>
            <li><strong>Restricted CORS:</strong> The backend server on port 5002 only accepts connections originating from your local application.</li>
            <li><strong>Secret Protection:</strong> Google GenAI SDK keys remain server-side in <code>server/.env</code> and are never leaked to client bundles.</li>
          </ul>
        </section>

        {/* Section 3: AI Boundaries */}
        <section className="cinematic-card privacy-section-card">
          <div className="section-title-row">
            <Cpu size={18} className="text-emerald-400" aria-hidden="true" />
            <h2 className="privacy-section-heading">3. AI Companion Ethical Capabilities</h2>
          </div>
          <p className="privacy-section-desc">
            The Gemma-powered reflection companion operates within clear boundaries:
          </p>
          <div className="privacy-ai-grid">
            <div className="ai-capability-box ai-capability-can">
              <div className="ai-capability-header">
                <CheckCircle2 size={16} className="text-emerald-400" aria-hidden="true" />
                <span>What Gemma Can Do</span>
              </div>
              <ul className="ai-capability-list">
                <li>Offer calm, empathetic listening and reflection.</li>
                <li>Encourage pacing, study breaks, and regular sleep.</li>
                <li>Offer gentle grounding questions for hostel living.</li>
              </ul>
            </div>

            <div className="ai-capability-box ai-capability-never">
              <div className="ai-capability-header">
                <AlertCircle size={16} className="text-coral-400" aria-hidden="true" />
                <span>What Gemma Will Never Do</span>
              </div>
              <ul className="ai-capability-list">
                <li>Never act as a doctor, psychiatrist, or therapist.</li>
                <li>Never diagnose clinical anxiety, depression, or disorders.</li>
                <li>Never replace human connection or crisis emergency helplines.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4: Clinical Disclaimers */}
        <section className="cinematic-card privacy-section-card">
          <div className="section-title-row">
            <HelpCircle size={18} className="text-emerald-400" aria-hidden="true" />
            <h2 className="privacy-section-heading">4. Scope & Clinical Disclaimers</h2>
          </div>
          <p className="privacy-section-desc">
            HostelWell is intended strictly for personal self-awareness. If you are experiencing persistent despair, severe depression, thoughts of self-harm, or overwhelming physical exhaustion, digital tools cannot substitute for certified human medical professionals. Please reach out to trusted friends, family, campus doctors, or verified 24/7 helplines such as Tele-MANAS (14416).
          </p>
        </section>
      </div>
    </div>
  );
}
