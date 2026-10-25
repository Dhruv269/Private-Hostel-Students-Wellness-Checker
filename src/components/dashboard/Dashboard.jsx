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
  Flame,
  Wind
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

/**
 * Provides a soothing, time-aware greeting tailored to the rhythm of student hostel life.
 */
function getTimeContext() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return {
      period: 'Morning Solitude',
      subtitle: 'A quiet start before the hostel corridors wake'
    };
  }
  if (hour >= 12 && hour < 17) {
    return {
      period: 'Midday Pause',
      subtitle: 'Take a mindful breath between lectures and labs'
    };
  }
  if (hour >= 17 && hour < 22) {
    return {
      period: 'Twilight Reset',
      subtitle: 'Unpack the day’s weight as evening sets in'
    };
  }
  return {
    period: 'Midnight Sanctuary',
    subtitle: 'Rest your mind away from room and corridor noise'
  };
}

export default function Dashboard({ 
  checkIns, 
  todayCheckIn, 
  setActiveTab,
  calmMode = false
}) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [isFlippingPrompt, setIsFlippingPrompt] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale');

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
    setIsFlippingPrompt(true);
    setTimeout(() => {
      setPromptIndex((prevIndex) => (prevIndex + 1) % STATIC_REFLECTION_PROMPTS.length);
      setIsFlippingPrompt(false);
    }, 180);
  };

  const todayMoodObj = todayCheckIn ? getMoodById(todayCheckIn.mood) : null;
  const todayFormatted = formatDisplayDate(getTodayDateString());
  const timeContext = getTimeContext();

  // 4-7-8 Guided Mindful Breather micro-interaction loop
  useEffect(() => {
    if (!breathingActive) return;
    const phases = ['Inhale', 'Hold', 'Exhale', 'Pause'];
    let step = 0;
    const timer = setInterval(() => {
      step = (step + 1) % phases.length;
      setBreathPhase(phases[step]);
    }, 4000);
    return () => clearInterval(timer);
  }, [breathingActive]);

  // Purposeful GSAP Hero & Bento Entrance Animations (Robust fromTo with clearProps)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || calmMode) {
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
      // Bento cards rise gently without permanent zero-opacity locks
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
  }, [calmMode]);

  return (
    <div className="dashboard-cinematic-wrapper" ref={dashboardRef}>
      {/* 
        ========================================================================
        HERO SECTION: Midnight Sanctuary Threshold with 3D Orb & Time Context
        ========================================================================
      */}
      <section className="dashboard-hero-section" aria-labelledby="dashboard-hero-title">
        <div className="dashboard-hero-grid">
          {/* Left Column: Typography, Context & Sanctuary CTAs */}
          <div className="dashboard-hero-copy">
            <div className="hero-pill-badge gsap-hero-badge">
              <Sparkles size={14} className="hero-pill-icon" aria-hidden="true" />
              <span>{timeContext.period} • {todayFormatted}</span>
            </div>

            {!todayCheckIn ? (
              <>
                <h1 id="dashboard-hero-title" className="hero-headline gsap-hero-title">
                  Welcome to your <br />
                  <span className="hero-headline-accent">digital sanctuary.</span>
                </h1>
                <p className="hero-lead gsap-hero-desc">
                  {timeContext.subtitle}. A private, judgment-free space to observe your academic stress, daily stamina, and emotional balance without surveillance.
                </p>
                <div className="hero-cta-group gsap-hero-actions">
                  <button 
                    type="button" 
                    className="btn-cinematic-primary"
                    onClick={() => setActiveTab('checkin')}
                  >
                    <PenLine size={16} aria-hidden="true" />
                    <span>Begin Daily Check-In</span>
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
                  Your equilibrium <br />
                  <span className="hero-headline-accent">is preserved today.</span>
                </h1>
                <p className="hero-lead gsap-hero-desc">
                  Thank you for pausing for self-reflection. Your session metrics are active. Explore empathetic dialogue with the Gemma companion or review your 7-day wellness trends.
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
                    <span>Adjust Today's Log</span>
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

            {/* Mindful Breather Micro-Interaction Pill */}
            <div className="hero-breather-container">
              <button
                type="button"
                className={`hero-breather-pill ${breathingActive ? 'is-breathing-active' : ''}`}
                onClick={() => setBreathingActive((prev) => !prev)}
                aria-pressed={breathingActive}
                aria-label={breathingActive ? "Stop guided breath" : "Start 4-second mindful breath"}
              >
                <Wind size={13} aria-hidden="true" />
                <span>
                  {breathingActive ? `Breathing: ${breathPhase} (4s)` : 'Pause for a 4-second breath'}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: 3D Centerpiece Orb */}
          <div className="dashboard-hero-visual gsap-hero-orb">
            <div className="hero-visual-backdrop" aria-hidden="true" />
            <WellnessOrb3D className="hero-3d-orb" calmMode={calmMode} />
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        BENTO SECTION: Asymmetric Sanctuary Composition
        ========================================================================
      */}
      <section className="bento-grid-section" aria-label="Wellness overview and metrics">
        {/* Bento 1: Today's Status Sanctuary Card (2-columns) */}
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
                You haven't logged your state of mind or energy levels for today. A 60-second reflection helps ground your day amidst the hostel rush.
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

          {/* Dual-bar mini chart for recent 7 days with interactive inspector */}
          <div className="bento-trend-chart-body" aria-label="7-Day stress and energy comparison bars">
            <div className="bento-bars-grid">
              {recentCheckIns.map((item, idx) => {
                const dayName = getShortDayName(item.date);
                const stressHeight = (Number(item.stress) / 5) * 100;
                const energyHeight = (Number(item.energy) / 5) * 100;
                const isSelected = selectedDayIndex === idx;

                return (
                  <button
                    key={item.id || idx} 
                    type="button"
                    className={`bento-bar-col ${isSelected ? 'is-bar-selected' : ''}`}
                    onClick={() => setSelectedDayIndex(isSelected ? null : idx)}
                    onMouseEnter={() => setSelectedDayIndex(idx)}
                    onMouseLeave={() => setSelectedDayIndex(null)}
                    aria-label={`${dayName}: Stress ${item.stress}/5, Energy ${item.energy}/5`}
                  >
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
                  </button>
                );
              })}
            </div>

            {/* Interactive Inspector readout on hover/touch */}
            {selectedDayIndex !== null && recentCheckIns[selectedDayIndex] && (
              <div className="bento-day-inspector" role="status">
                <span className="inspector-day">{getShortDayName(recentCheckIns[selectedDayIndex].date)}:</span>
                <span className="inspector-stat">Stress {recentCheckIns[selectedDayIndex].stress}/5</span>
                <span className="inspector-divider">•</span>
                <span className="inspector-stat">Energy {recentCheckIns[selectedDayIndex].energy}/5</span>
                {recentCheckIns[selectedDayIndex].mood && (
                  <>
                    <span className="inspector-divider">•</span>
                    <span className="inspector-mood">{recentCheckIns[selectedDayIndex].moodLabel || recentCheckIns[selectedDayIndex].mood}</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="bento-card-footer">
            <span className="bento-footer-note">Hover or tap any bar for day details</span>
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

        {/* Bento 3: 7-Day Dominant Mood Summary */}
        <div className="bento-card gsap-bento-card">
          <div className="bento-card-header">
            <span className="bento-stat-label">7-Day Dominant State</span>
            <DominantMoodIcon size={17} className="bento-icon-emerald" aria-hidden="true" />
          </div>
          <div className="bento-stat-number bento-stat-emerald">
            {dominantMoodObj?.label || 'Good'}
          </div>
          <p className="bento-stat-desc">
            Recorded in {maxCount} of last {recentCheckIns.length} logs ({dominantMoodObj?.description || 'Calm and steady'}).
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
                ? 'Elevated academic pressure — pace your study blocks'
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
                ? 'Lower physical stamina — protect your sleep hours'
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
            {checkIns.filter((c) => c.isSynthetic).length} synthetic demo entries included as initial baseline.
          </p>
        </div>

        {/* Bento 7: Quick Access to AI Companion (2-columns) ⭐ AI Companion Haven */}
        <div className="bento-card bento-card-span-2 gsap-bento-card bento-ai-quick-card">
          <div className="bento-card-header">
            <div className="bento-card-title-group">
              <MessageSquare size={18} className="bento-title-icon-emerald" aria-hidden="true" />
              <h2 className="bento-card-title">AI Reflection Companion</h2>
            </div>
            <span className="bento-badge badge-emerald">Gemma MoE • {isLocalBackend ? 'Port 5002' : 'Active'}</span>
          </div>
          <p className="bento-card-desc">
            Feeling overwhelmed by syllabus coverage, mess food, or roommate friction? Unpack your thoughts with our private empathetic listener in RAM.
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
              "Managing study fatigue tonight"
            </button>
          </div>
          <div className="bento-card-footer">
            <span className="bento-footer-note">Microphone voice input & audio playback ready</span>
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
              className={`btn-cinematic-icon ${isFlippingPrompt ? 'is-spinning' : ''}`}
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
          <blockquote className={`bento-quote-text ${isFlippingPrompt ? 'is-fading' : ''}`}>
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
            If hostel pressure, loneliness, or acute panic feels overwhelming, free verified support is available anytime across India.
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
