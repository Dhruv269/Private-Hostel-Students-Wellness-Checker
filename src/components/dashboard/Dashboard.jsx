import React, { useState, useEffect, useRef } from 'react';
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
  RefreshCw, 
  MessageSquare, 
  Clock, 
  BarChart3, 
  ShieldCheck, 
  Smile, 
  Meh, 
  CloudRain, 
  Flame 
} from 'lucide-react';
import gsap from 'gsap';
import WellnessOrb3D from '../common/WellnessOrb3D';
import { STATIC_REFLECTION_PROMPTS, getMoodById } from '../../data/mockData';
import { getTodayDateString, formatDisplayDate, getShortDayName } from '../../utils/dateUtils';
import { isLocalBackend } from '../../utils/apiConfig';

const MOOD_ICONS = {
  great: Sparkles,
  good: Smile,
  okay: Meh,
  low: CloudRain,
  overwhelmed: Flame
};

/**
 * Calculates arithmetic average of a numeric property (stress or energy).
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
  const [promptIndex, setPromptIndex] = useState(0);
  const dashboardRef = useRef(null);

  // Take up to 7 most recent check-in records for weekly metrics
  const recentCheckIns = checkIns.slice(-7);
  const avgStress = calculateAverage(recentCheckIns, 'stress');
  const avgEnergy = calculateAverage(recentCheckIns, 'energy');

  // Compute 7-day dominant mood for the mood summary
  const moodFrequencies = {};
  for (const c of recentCheckIns) {
    if (c.mood) {
      moodFrequencies[c.mood] = (moodFrequencies[c.mood] || 0) + 1;
    }
  }

  let dominantMoodId = 'good';
  let maxCount = 0;
  for (const [id, count] of Object.entries(moodFrequencies)) {
    if (count > maxCount) {
      maxCount = count;
      dominantMoodId = id;
    }
  }
  const dominantMoodObj = getMoodById(dominantMoodId);
  const DominantMoodIcon = MOOD_ICONS[dominantMoodId] || Smile;

  const currentPrompt = STATIC_REFLECTION_PROMPTS[promptIndex % STATIC_REFLECTION_PROMPTS.length];

  const handleNextPrompt = () => {
    setPromptIndex((prevIndex) => (prevIndex + 1) % STATIC_REFLECTION_PROMPTS.length);
  };

  const todayMoodObj = todayCheckIn ? getMoodById(todayCheckIn.mood) : null;
  const todayFormatted = formatDisplayDate(getTodayDateString());

  // Purposeful GSAP Hero & Bento Entrance Animations (Robust fromTo with clearProps)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-hero-badge', 
        { opacity: 0, y: -10 }, 
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', clearProps: 'all' }
      );
      gsap.fromTo(
        '.gsap-hero-title', 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.6, delay: 0.05, ease: 'power3.out', clearProps: 'all' }
      );
      gsap.fromTo(
        '.gsap-hero-desc', 
        { opacity: 0, y: 12 }, 
        { opacity: 1, y: 0, duration: 0.6, delay: 0.1, ease: 'power3.out', clearProps: 'all' }
      );
      gsap.fromTo(
        '.gsap-hero-actions', 
        { opacity: 0, y: 10 }, 
        { opacity: 1, y: 0, duration: 0.6, delay: 0.15, ease: 'power3.out', clearProps: 'all' }
      );
      gsap.fromTo(
        '.gsap-hero-orb', 
        { opacity: 0, scale: 0.92 }, 
        { opacity: 1, scale: 1, duration: 0.8, delay: 0.05, ease: 'power2.out', clearProps: 'all' }
      );
      // Bento cards gently rise without zero-opacity locks so they are ALWAYS visible
      gsap.fromTo(
        '.gsap-bento-card',
        { y: 14 },
        {
          y: 0,
          stagger: 0.04,
          duration: 0.5,
          delay: 0.15,
          ease: 'power2.out',
          clearProps: 'transform'
        }
      );
    }, dashboardRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="dashboard-cinematic-wrapper" ref={dashboardRef}>
      {/* 
        ========================================================================
        HERO SECTION: Asymmetric Composition with 3D Centerpiece & Date Header
        ========================================================================
      */}
      <section className="dashboard-hero-section" aria-labelledby="dashboard-hero-title">
        <div className="dashboard-hero-grid">
          {/* Left Column: Typography, Date & Intentional Actions */}
          <div className="dashboard-hero-copy">
            <div className="hero-pill-badge gsap-hero-badge">
              <Sparkles size={14} className="hero-pill-icon" aria-hidden="true" />
              <span>{todayFormatted} • Student Mental Equilibrium</span>
            </div>

            {!todayCheckIn ? (
              <>
                <h1 id="dashboard-hero-title" className="hero-headline gsap-hero-title">
                  Restoring quiet balance <br />
                  <span className="hero-headline-accent">to hostel life.</span>
                </h1>
                <p className="hero-lead gsap-hero-desc">
                  A private, calm sanctuary to observe your academic stress, daily energy, and emotional state. In-memory and autonomous, designed for hostel students without surveillance.
                </p>
                <div className="hero-cta-group gsap-hero-actions">
                  <button 
                    type="button" 
                    className="btn-cinematic-primary"
                    onClick={() => setActiveTab('checkin')}
                  >
                    <PenLine size={16} aria-hidden="true" />
                    <span>Record Today's Log</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn-cinematic-secondary"
                    onClick={() => setActiveTab('chat')}
                  >
                    <MessageSquare size={16} aria-hidden="true" />
                    <span>Talk with AI Companion</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn-cinematic-ghost"
                    onClick={() => setActiveTab('history')}
                  >
                    <span>View Trends</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 id="dashboard-hero-title" className="hero-headline gsap-hero-title">
                  Today's equilibrium <br />
                  <span className="hero-headline-accent">is recorded.</span>
                </h1>
                <p className="hero-lead gsap-hero-desc">
                  Thank you for pausing for self-reflection. Your session metrics are active. Explore empathetic dialogue with the Gemma AI companion or review your 7-day wellness trends.
                </p>
                <div className="hero-cta-group gsap-hero-actions">
                  <button 
                    type="button" 
                    className="btn-cinematic-primary"
                    onClick={() => setActiveTab('chat')}
                  >
                    <MessageSquare size={16} aria-hidden="true" />
                    <span>Reflect with AI Companion</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn-cinematic-secondary"
                    onClick={() => setActiveTab('checkin')}
                  >
                    <PenLine size={15} aria-hidden="true" />
                    <span>Update Today's Log</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn-cinematic-ghost"
                    onClick={() => setActiveTab('history')}
                  >
                    <span>See Trends</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right Column: 3D Centerpiece Orb */}
          <div className="dashboard-hero-visual gsap-hero-orb">
            <div className="hero-visual-backdrop" aria-hidden="true" />
            <WellnessOrb3D className="hero-3d-orb" />
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        BENTO SECTION: Comprehensive Wellness Overview & Trends
        ========================================================================
      */}
      <section className="bento-grid-section" aria-label="Wellness overview and metrics">
        {/* Bento 1: Today's Status Card (2-columns) */}
        <div className={`bento-card bento-card-span-2 gsap-bento-card ${todayCheckIn ? 'bento-card-logged' : 'bento-card-pending'}`}>
          <div className="bento-card-header">
            <div className="bento-card-title-group">
              {todayCheckIn ? (
                <CheckCircle2 size={18} className="bento-title-icon-emerald" aria-hidden="true" />
              ) : (
                <Clock size={18} className="bento-title-icon-muted" aria-hidden="true" />
              )}
              <h2 className="bento-card-title">Today's Check-In Status</h2>
            </div>
            <span className={`bento-badge ${todayCheckIn ? 'badge-emerald' : 'badge-amber'}`}>
              {todayCheckIn ? 'Session Active' : 'Pending Today'}
            </span>
          </div>

          {todayCheckIn ? (
            <div className="bento-status-body">
              <div className="bento-status-metrics">
                <div className="bento-status-pill">
                  <span className="status-pill-label">Mood</span>
                  <span className="status-pill-value">{todayMoodObj?.label || todayCheckIn.mood}</span>
                </div>
                <div className="bento-status-pill">
                  <span className="status-pill-label">Stress Level</span>
                  <span className="status-pill-value status-pill-value-stress">{todayCheckIn.stress} / 5</span>
                </div>
                <div className="bento-status-pill">
                  <span className="status-pill-label">Energy Level</span>
                  <span className="status-pill-value status-pill-value-energy">{todayCheckIn.energy} / 5</span>
                </div>
              </div>
              {todayCheckIn.note && (
                <p className="bento-status-note">
                  "{todayCheckIn.note}"
                </p>
              )}
            </div>
          ) : (
            <div className="bento-status-empty">
              <p className="bento-status-empty-text">
                You haven't logged your mood, stress, or stamina for today yet. It takes under 60 seconds to build self-awareness.
              </p>
              <button
                type="button"
                className="btn-cinematic-secondary btn-sm"
                onClick={() => setActiveTab('checkin')}
              >
                <PenLine size={14} aria-hidden="true" />
                <span>Begin Quick Log</span>
              </button>
            </div>
          )}
        </div>

        {/* Bento 2: 7-Day Trend Visualizer Card (2-columns) ⭐ Useful Trend Visualization */}
        <div className="bento-card bento-card-span-2 gsap-bento-card bento-trend-visualizer-card">
          <div className="bento-card-header">
            <div className="bento-card-title-group">
              <BarChart3 size={18} className="bento-title-icon-emerald" aria-hidden="true" />
              <h2 className="bento-card-title">7-Day Wellness Rhythm</h2>
            </div>
            <div className="bento-mini-trend-legend">
              <span className="legend-chip-energy"><span className="legend-dot dot-energy" /> Energy</span>
              <span className="legend-chip-stress"><span className="legend-dot dot-stress" /> Stress</span>
            </div>
          </div>

          {/* Dual-bar mini chart for recent 7 days */}
          <div className="bento-trend-chart-body" aria-label="7-Day stress and energy comparison bars">
            <div className="bento-bars-grid">
              {recentCheckIns.map((item, idx) => {
                const dayName = getShortDayName(item.date);
                const stressHeight = (Number(item.stress) / 5) * 100;
                const energyHeight = (Number(item.energy) / 5) * 100;

                return (
                  <div key={item.id || idx} className="bento-bar-col">
                    <div 
                      className="bento-dual-bars-track" 
                      title={`${dayName}: Stress ${item.stress}/5, Energy ${item.energy}/5`}
                    >
                      <div 
                        className="bento-mini-bar bento-mini-bar-energy" 
                        style={{ height: `${energyHeight}%` }} 
                      />
                      <div 
                        className="bento-mini-bar bento-mini-bar-stress" 
                        style={{ height: `${stressHeight}%` }} 
                      />
                    </div>
                    <span className="bento-bar-day">{dayName}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bento-card-footer">
            <span className="bento-footer-note">Daily fluctuation comparison</span>
            <button
              type="button"
              className="bento-footer-link"
              onClick={() => setActiveTab('history')}
            >
              <span>Explore full trends</span>
              <ArrowRight size={13} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Bento 3: 7-Day Mood Summary ⭐ Mood Summary */}
        <div className="bento-card gsap-bento-card">
          <div className="bento-card-header">
            <span className="bento-stat-label">7-Day Dominant Mood</span>
            <DominantMoodIcon size={17} className="bento-icon-emerald" aria-hidden="true" />
          </div>
          <div className="bento-stat-number bento-stat-emerald">
            {dominantMoodObj?.label || 'Good'}
          </div>
          <p className="bento-stat-desc">
            Recorded {maxCount} of last {recentCheckIns.length} days ({dominantMoodObj?.description || 'Calm and steady'}).
          </p>
        </div>

        {/* Bento 4: 7-Day Stress Average */}
        <div className="bento-card gsap-bento-card">
          <div className="bento-card-header">
            <span className="bento-stat-label">7-Day Avg Stress</span>
            <Activity size={17} className="bento-icon-coral" aria-hidden="true" />
          </div>
          <div className="bento-stat-number bento-stat-stress">
            {avgStress !== 'N/A' ? avgStress : '—'}
            <span className="bento-stat-denom">/ 5</span>
          </div>
          <p className="bento-stat-desc">
            {avgStress === 'N/A'
              ? 'No check-in entries yet'
              : Number(avgStress) > 3.5
                ? 'Elevated pressure — pace your study intervals'
                : 'Balanced academic workload'}
          </p>
        </div>

        {/* Bento 5: 7-Day Energy Average */}
        <div className="bento-card gsap-bento-card">
          <div className="bento-card-header">
            <span className="bento-stat-label">7-Day Avg Energy</span>
            <BatteryMedium size={17} className="bento-icon-emerald" aria-hidden="true" />
          </div>
          <div className="bento-stat-number bento-stat-energy">
            {avgEnergy !== 'N/A' ? avgEnergy : '—'}
            <span className="bento-stat-denom">/ 5</span>
          </div>
          <p className="bento-stat-desc">
            {avgEnergy === 'N/A'
              ? 'No check-in entries yet'
              : Number(avgEnergy) < 2.5
                ? 'Low physical stamina — prioritize sleep'
                : 'Steady daily stamina levels'}
          </p>
        </div>

        {/* Bento 6: Total Logged Entries */}
        <div className="bento-card gsap-bento-card">
          <div className="bento-card-header">
            <span className="bento-stat-label">Check-In Habit</span>
            <Calendar size={17} className="bento-icon-teal" aria-hidden="true" />
          </div>
          <div className="bento-stat-number">
            {checkIns.length}
          </div>
          <p className="bento-stat-desc">
            {checkIns.filter((c) => c.isSynthetic).length} synthetic demo records included for trend baseline.
          </p>
        </div>

        {/* Bento 7: Quick Access to AI Companion (2-columns) ⭐ AI Companion Quick Access */}
        <div className="bento-card bento-card-span-2 gsap-bento-card bento-ai-quick-card">
          <div className="bento-card-header">
            <div className="bento-card-title-group">
              <MessageSquare size={18} className="bento-title-icon-emerald" aria-hidden="true" />
              <h2 className="bento-card-title">AI Reflection Companion</h2>
            </div>
            <span className="bento-badge badge-emerald">Gemma MoE • {isLocalBackend ? 'Port 5002' : 'Active'}</span>
          </div>
          <p className="bento-card-desc">
            Feeling overwhelmed by exams, mess routines, or hostel friction? Talk it through with our private empathetic listener in browser RAM.
          </p>
          <div className="bento-ai-prompt-shortcuts">
            <button
              type="button"
              className="ai-shortcut-pill"
              onClick={() => setActiveTab('chat')}
            >
              "How to quiet racing thoughts before sleep?"
            </button>
            <button
              type="button"
              className="ai-shortcut-pill"
              onClick={() => setActiveTab('chat')}
            >
              "Managing study pressure tonight"
            </button>
          </div>
          <div className="bento-card-footer">
            <span className="bento-footer-note">Microphone voice input & audio reply ready</span>
            <button
              type="button"
              className="bento-footer-link"
              onClick={() => setActiveTab('chat')}
            >
              <span>Talk with Companion</span>
              <ArrowRight size={13} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Bento 8: Thought of the Day (2-columns) */}
        <div className="bento-card bento-card-span-2 gsap-bento-card">
          <div className="bento-card-header">
            <div className="bento-card-title-group">
              <HelpCircle size={18} className="bento-title-icon-lavender" aria-hidden="true" />
              <h2 className="bento-card-title">Thought of the Day</h2>
            </div>
            <button
              type="button"
              className="btn-cinematic-icon"
              onClick={handleNextPrompt}
              aria-label="Load next reflection prompt"
              title="Next reflection thought"
            >
              <RefreshCw size={13} aria-hidden="true" />
            </button>
          </div>
          <div className="bento-category-tag">
            {currentPrompt.category}
          </div>
          <blockquote className="bento-quote-text">
            "{currentPrompt.prompt}"
          </blockquote>
          <div className="bento-card-footer">
            <span className="bento-footer-note">Curated mindful reflection</span>
            <button
              type="button"
              className="bento-footer-link"
              onClick={() => setActiveTab('reflections')}
            >
              <span>Explore all prompts</span>
              <ArrowRight size={13} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Bento 9: Quick Indian Crisis Support Link (2-columns) */}
        <div className="bento-card bento-card-span-2 gsap-bento-card bento-card-emergency">
          <div className="bento-card-header">
            <div className="bento-card-title-group">
              <PhoneCall size={18} className="bento-title-icon-emerald" aria-hidden="true" />
              <h2 className="bento-card-title">Confidential Support Resources</h2>
            </div>
            <span className="bento-badge badge-neutral">24/7 Toll-Free</span>
          </div>
          <p className="bento-card-desc">
            If hostel pressure, loneliness, or academic anxiety feels overwhelming, verified support is available anytime across India.
          </p>
          <div className="bento-emergency-contact">
            <div className="emergency-name">Govt. Tele-MANAS Helpline</div>
            <a href="tel:14416" className="emergency-phone-link">
              14416 / 1800 891 4416
            </a>
          </div>
          <div className="bento-card-footer">
            <button
              type="button"
              className="btn-cinematic-ghost btn-sm"
              onClick={() => setActiveTab('support')}
            >
              <span>View all emergency numbers & campus care</span>
              <ArrowRight size={13} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Bento 10: In-Memory Architecture Notice (Full Width 4-columns) */}
        <div className="bento-card bento-card-span-4 gsap-bento-card bento-architecture-note">
          <div className="architecture-note-inner">
            <ShieldCheck size={20} className="text-emerald-400 flex-shrink-0" aria-hidden="true" />
            <div className="architecture-note-text">
              <h3 className="architecture-note-title">Private & In-Memory Session Boundary</h3>
              <p className="architecture-note-desc">
                Your check-in reflections exist only in browser memory for this session and are never saved to an external database. The companion connects to the Gemma MoE backend for empathetic listening.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
