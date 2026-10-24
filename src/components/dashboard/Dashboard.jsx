/**
 * Dashboard.jsx - Main Student Landing Screen
 * 
 * HOW THIS COMPONENT WORKS:
 * 1. Checks `todayCheckIn` (passed as a prop from App.jsx):
 *    - If null/undefined: Displays a welcoming invitation to complete today's check-in.
 *    - If defined: Displays a confirmation banner with today's mood, stress, energy, and note.
 * 2. Computes 7-Day Averages:
 *    - Takes the 7 most recent check-ins and calculates average stress and energy.
 * 3. Shows Today's Curated Thought:
 *    - Rotates through pre-written reflection questions using local state (`promptIndex`).
 * 4. Displays Quick Support Card:
 *    - Direct highlight for Tele-MANAS (14416) for instant, 24/7 access to free help.
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  PenLine, 
  CheckCircle2, 
  Activity, 
  BatteryMedium, 
  Calendar, 
  ArrowRight, 
  HelpCircle, 
  PhoneCall, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { STATIC_REFLECTION_PROMPTS, getMoodById } from '../../data/mockData';

/**
 * Beginner-friendly helper: Calculates the arithmetic average of a numeric property (stress or energy).
 * Using a simple loop instead of an accumulator reduce makes this logic easy to trace and explain.
 * 
 * @param {Array} list - Array of check-in objects
 * @param {string} property - The property key to average (e.g. 'stress' or 'energy')
 * @returns {string} Average rounded to 1 decimal place, or 'N/A' if empty
 */
function calculateAverage(list, property) {
  if (!list || list.length === 0) return 'N/A';
  let sum = 0;
  for (const item of list) {
    sum += Number(item[property]);
  }
  return (sum / list.length).toFixed(1);
}

export default function Dashboard({ 
  checkIns, 
  todayCheckIn, 
  setActiveTab 
}) {
  // State for cycling through pre-written reflection prompts
  const [promptIndex, setPromptIndex] = useState(0);

  // Take up to the 7 most recent check-in records for weekly metrics
  const recentCheckIns = checkIns.slice(-7);
  const avgStress = calculateAverage(recentCheckIns, 'stress');
  const avgEnergy = calculateAverage(recentCheckIns, 'energy');

  // Cycle to next prompt: the modulo (%) operator loops back to 0 when reaching the end of the array
  const currentPrompt = STATIC_REFLECTION_PROMPTS[promptIndex % STATIC_REFLECTION_PROMPTS.length];

  const handleNextPrompt = () => {
    setPromptIndex((prevIndex) => (prevIndex + 1) % STATIC_REFLECTION_PROMPTS.length);
  };

  // Look up today's mood details (label, emoji, description)
  const todayMoodObj = todayCheckIn ? getMoodById(todayCheckIn.mood) : null;

  return (
    <div className="dashboard-grid">
      {/* 
        ========================================================================
        HERO SECTION: Conditionally renders based on whether today is logged
        ========================================================================
      */}
      <section className="hero-banner" aria-labelledby="dashboard-hero-title">
        <div className="hero-content">
          <div className="hero-greeting">
            <Sparkles size={16} aria-hidden="true" />
            <span>Hostel Wellness Space</span>
          </div>

          {!todayCheckIn ? (
            /* State A: User has NOT checked in yet today */
            <>
              <h1 id="dashboard-hero-title" className="hero-title">
                How is hostel life treating you today?
              </h1>
              <p className="hero-desc">
                Take 60 seconds to note your mood, stress level, and energy. Regular self-reflection helps you catch burnout early and notice study patterns without judgment.
              </p>
              <div className="hero-actions">
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('checkin')}
                >
                  <PenLine size={18} aria-hidden="true" />
                  <span>Record Today's Check-In</span>
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setActiveTab('history')}
                >
                  <span>View Recent Trends</span>
                </button>
              </div>
            </>
          ) : (
            /* State B: User HAS already checked in today */
            <>
              <h1 id="dashboard-hero-title" className="hero-title">
                You're checked in for today 🌱
              </h1>
              <p className="hero-desc">
                Thank you for taking a moment for yourself. Below is your reflection summary for today. You can review your week or adjust your log anytime.
              </p>
              <div className="hero-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setActiveTab('checkin')}
                >
                  <PenLine size={16} aria-hidden="true" />
                  <span>Update Today's Log</span>
                </button>
                <button 
                  type="button" 
                  className="btn btn-ghost"
                  onClick={() => setActiveTab('history')}
                  style={{ color: 'var(--text-primary)' }}
                >
                  <span>See History & Trends</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 
        ========================================================================
        TODAY'S SUMMARY CARD: Shown only when user has completed today's log
        ========================================================================
      */}
      {todayCheckIn && (
        <section className="today-summary-card" aria-label="Today's check-in summary">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <CheckCircle2 size={22} style={{ color: 'var(--color-primary-light)' }} aria-hidden="true" />
              <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Today's Check-In Logged</h2>
            </div>
            <span className="badge badge-live">Recorded in Current Session</span>
          </div>

          <div className="today-summary-pills">
            <div className="today-pill">
              <span style={{ fontSize: '1.25rem' }}>{todayMoodObj?.emoji || '✨'}</span>
              <span><strong>Mood:</strong> {todayMoodObj?.label || todayCheckIn.mood}</span>
            </div>
            <div className="today-pill">
              <Activity size={16} style={{ color: 'var(--color-stress)' }} aria-hidden="true" />
              <span><strong>Stress:</strong> {todayCheckIn.stress} / 5</span>
            </div>
            <div className="today-pill">
              <BatteryMedium size={16} style={{ color: 'var(--color-primary-light)' }} aria-hidden="true" />
              <span><strong>Energy:</strong> {todayCheckIn.energy} / 5</span>
            </div>
          </div>

          {todayCheckIn.note ? (
            <div className="checkin-note">
              "{todayCheckIn.note}"
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              No personal note attached for today. (Notes are always optional).
            </p>
          )}
        </section>
      )}

      {/* 
        ========================================================================
        METRICS ROW: 7-Day Averages (Stress, Energy, Total Logs)
        ========================================================================
      */}
      <section className="metrics-row" aria-label="Recent weekly averages">
        <div className="metric-card">
          <div className="metric-header">
            <span>Average Stress (7 Days)</span>
            <Activity size={18} style={{ color: 'var(--color-stress)' }} aria-hidden="true" />
          </div>
          <div className="metric-value">
            {avgStress !== 'N/A' ? (
              <>
                {avgStress} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 5</span>
              </>
            ) : (
              '—'
            )}
          </div>
          <div className="metric-subtext">
            {/* 
              Empty-data handling:
              If no check-in records exist yet, we show a neutral message rather than
              converting 'N/A' to NaN and falsely displaying "Within manageable range".
            */}
            {avgStress === 'N/A'
              ? 'No check-in entries yet'
              : Number(avgStress) > 3.5
                ? 'Trending elevated — consider pacing study tasks'
                : 'Within manageable range'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Average Energy (7 Days)</span>
            <BatteryMedium size={18} style={{ color: 'var(--color-primary-light)' }} aria-hidden="true" />
          </div>
          <div className="metric-value">
            {avgEnergy !== 'N/A' ? (
              <>
                {avgEnergy} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 5</span>
              </>
            ) : (
              '—'
            )}
          </div>
          <div className="metric-subtext">
            {/* Neutral empty state for energy when no check-in records exist */}
            {avgEnergy === 'N/A'
              ? 'No check-in entries yet'
              : Number(avgEnergy) < 2.5
                ? 'Lower physical stamina noted recently'
                : 'Sustained daily energy levels'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Check-In Entries</span>
            <Calendar size={18} style={{ color: 'var(--color-accent-lavender)' }} aria-hidden="true" />
          </div>
          <div className="metric-value">
            {checkIns.length}
          </div>
          <div className="metric-subtext">
            {checkIns.length === 0
              ? 'No check-in entries yet'
              : `${checkIns.filter((c) => c.isSynthetic).length} synthetic demo entries included`}
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        SPLIT SECTION: Thought of the Day & Quick Support Hotline
        ========================================================================
      */}
      <div className="dashboard-split">
        {/* Curated Pre-Written Reflection Card */}
        <section className="card" aria-label="Supportive reflection prompt">
          <div className="card-header">
            <div className="card-title">
              <HelpCircle size={20} style={{ color: 'var(--color-accent-lavender)' }} aria-hidden="true" />
              <span>Thought of the Day</span>
            </div>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleNextPrompt}
              aria-label="Load next reflection prompt"
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
            >
              <RefreshCw size={14} aria-hidden="true" />
              <span>Next</span>
            </button>
          </div>

          <div style={{ marginBottom: '0.65rem' }}>
            <span className="badge badge-calm" style={{ fontSize: '0.75rem' }}>
              {currentPrompt.category}
            </span>
          </div>

          <blockquote style={{ fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: '0 0 1rem 0', fontWeight: 500 }}>
            "{currentPrompt.prompt}"
          </blockquote>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Pre-written self-reflection prompt</span>
            <button 
              type="button" 
              onClick={() => setActiveTab('reflections')}
              style={{ color: 'var(--color-primary-light)', fontSize: '0.8rem', fontWeight: 600 }}
            >
              View all prompts →
            </button>
          </div>
        </section>

        {/* Quick Indian Support Access Card */}
        <section className="card card-elevated" aria-label="Verified emergency and support contact">
          <div className="card-header">
            <div className="card-title">
              <PhoneCall size={20} style={{ color: 'var(--color-primary-light)' }} aria-hidden="true" />
              <span>Need Someone to Talk To?</span>
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            If exam pressure, loneliness, or hostel challenges feel overwhelming, free confidential support is available 24/7 across India.
          </p>

          <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Govt. of India Tele-MANAS
            </div>
            <div style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', fontWeight: 700, margin: '0.25rem 0', color: 'var(--text-primary)' }}>
              14416 / 1800 891 4416
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              24/7 • Free • Available in 20+ Indian languages
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setActiveTab('support')}
            style={{ width: '100%' }}
          >
            <span>View All Verified Helplines & Campus Advice</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </section>
      </div>

      {/* Security & Prototype Architecture Notice */}
      <section className="card" style={{ background: 'rgba(21, 29, 47, 0.4)' }} aria-label="Prototype architecture notice">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
          <ShieldCheck size={24} style={{ color: 'var(--color-primary-light)', flexShrink: 0, marginTop: '0.2rem' }} aria-hidden="true" />
          <div>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.35rem' }}>About this Stage 2 Prototype</h3>
            <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
              This demo runs completely locally inside your browser's React state. No data is transmitted to an external server or saved across browser tabs. In Stage 3, we will add Supabase with Row Level Security (RLS) so that only you can securely read or write your personal check-ins.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
