import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  ArrowRight,
  RotateCcw,
  Sparkles,
  Smile,
  Meh,
  CloudRain,
  Flame
} from 'lucide-react';
import gsap from 'gsap';
import { MOOD_DEFINITIONS, STRESS_LEVELS, ENERGY_LEVELS, getMoodById } from '../../data/mockData';
import { getTodayDateString } from '../../utils/dateUtils';

// Professional icon mapping to avoid emoji-only interface
const MOOD_ICONS = {
  great: Sparkles,
  good: Smile,
  okay: Meh,
  low: CloudRain,
  overwhelmed: Flame
};

export default function DailyCheckIn({ 
  todayCheckIn, 
  onSaveCheckIn, 
  setActiveTab 
}) {
  const [mood, setMood] = useState(todayCheckIn ? todayCheckIn.mood : '');
  const [stress, setStress] = useState(todayCheckIn ? todayCheckIn.stress : 3);
  const [energy, setEnergy] = useState(todayCheckIn ? todayCheckIn.energy : 3);
  const [note, setNote] = useState(todayCheckIn ? todayCheckIn.note : '');

  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const successRef = useRef(null);
  const formRef = useRef(null);

  // GSAP animation for success confirmation view
  useEffect(() => {
    if (isSubmitted && successRef.current) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.from(successRef.current, {
        opacity: 0,
        y: 24,
        scale: 0.96,
        duration: 0.7,
        ease: 'power3.out'
      });
    }
  }, [isSubmitted]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!mood) {
      setError('Please choose a state of mind that best reflects how you feel right now.');
      return;
    }

    setError('');
    const moodObj = getMoodById(mood);

    const newRecord = {
      id: todayCheckIn?.id || `session-${Date.now()}`,
      date: getTodayDateString(),
      mood,
      moodLabel: moodObj?.label || mood,
      stress: Number(stress),
      energy: Number(energy),
      note: note.trim(),
      isSynthetic: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onSaveCheckIn(newRecord);
    setIsSubmitted(true);
  };

  const handleEditAgain = () => {
    setIsSubmitted(false);
  };

  // ==========================================================================
  // VIEW A: Success Confirmation State (GSAP Animated)
  // ==========================================================================
  if (isSubmitted) {
    const selectedMoodObj = getMoodById(mood);
    const MoodIcon = MOOD_ICONS[mood] || Sparkles;

    return (
      <div className="checkin-container-focused">
        <div className="cinematic-card checkin-success-modal" ref={successRef}>
          <div className="success-emblem-wrapper">
            <CheckCircle2 size={36} className="text-emerald-400" aria-hidden="true" />
          </div>

          <div className="success-badge-row">
            <span className="badge-emerald-subtle">
              Check-In Recorded (Current Session)
            </span>
          </div>

          <h1 className="success-modal-title">
            Your daily check-in is logged.
          </h1>
          <p className="success-modal-desc">
            Noticing your mental state is a powerful practice amidst the pace of hostel life. Your log is preserved in browser memory.
          </p>

          <div className="success-metric-summary">
            <div className="success-mood-item">
              <div className="success-mood-icon-box">
                <MoodIcon size={22} className="text-emerald-400" aria-hidden="true" />
              </div>
              <div className="success-mood-meta">
                <span className="success-mood-label">Mood: {selectedMoodObj?.label}</span>
                <span className="success-mood-desc">{selectedMoodObj?.description}</span>
              </div>
            </div>

            <div className="success-scales-row">
              <div className="success-scale-chip">
                <span className="scale-chip-label">Stress</span>
                <span className={`scale-chip-val ${stress >= 4 ? 'val-stress-high' : 'val-stress-normal'}`}>
                  {stress} / 5
                </span>
              </div>
              <div className="success-scale-chip">
                <span className="scale-chip-label">Energy</span>
                <span className="scale-chip-val val-energy">
                  {energy} / 5
                </span>
              </div>
            </div>

            {note.trim() && (
              <div className="success-note-display">
                <span className="success-note-label">Personal Reflection:</span>
                <p className="success-note-body">"{note.trim()}"</p>
              </div>
            )}
          </div>

          <div className="success-button-group">
            <button
              type="button"
              className="btn-cinematic-primary"
              onClick={() => setActiveTab('dashboard')}
            >
              <span>Back to Dashboard</span>
              <ArrowRight size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="btn-cinematic-secondary"
              onClick={() => setActiveTab('chat')}
            >
              <span>Talk with AI Companion</span>
            </button>
            <button
              type="button"
              className="btn-cinematic-ghost"
              onClick={handleEditAgain}
            >
              <RotateCcw size={14} aria-hidden="true" />
              <span>Adjust Log</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VIEW B: The Check-In Input Form
  // ==========================================================================
  return (
    <div className="checkin-container-focused" ref={formRef}>
      <header className="page-cinematic-header">
        <div className="header-eyebrow">
          <Sparkles size={14} className="text-emerald-400" aria-hidden="true" />
          <span>Mindful Pause</span>
        </div>
        <h1 className="header-main-title">
          Daily Wellness Check-In
        </h1>
        <p className="header-lead">
          Take a quiet moment away from lectures, mess noise, and deadlines. Record how your mind and body feel right now.
        </p>
      </header>

      {error && (
        <div className="cinematic-alert-error" role="alert">
          <AlertCircle size={18} className="alert-error-icon" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="checkin-form-stack">
        {/* Field 1: Overall Mood Selection */}
        <fieldset className="cinematic-card form-section-card">
          <legend className="form-section-legend">
            1. State of Mind <span className="legend-required">*</span>
          </legend>
          <p className="form-section-hint">
            Select the state that best aligns with your inner climate today.
          </p>

          <div className="mood-tile-grid" role="radiogroup" aria-required="true">
            {MOOD_DEFINITIONS.map((item) => {
              const isSelected = mood === item.id;
              const MoodIcon = MOOD_ICONS[item.id] || Sparkles;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`mood-tile-btn ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setMood(item.id)}
                >
                  <div className="mood-tile-icon-box">
                    <MoodIcon size={20} aria-hidden="true" />
                  </div>
                  <span className="mood-tile-label">{item.label}</span>
                  <span className="mood-tile-subtext">{item.description}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Field 2: Stress Rating (1 to 5) */}
        <fieldset className="cinematic-card form-section-card">
          <legend className="form-section-legend">
            2. Academic & Living Stress (1 to 5)
          </legend>
          <p className="form-section-hint">
            Exams, assignment pressure, hostel environment, or roommate friction.
          </p>

          <div className="scale-control-wrapper">
            <div className="scale-button-grid" role="radiogroup" aria-label="Stress level from 1 to 5">
              {STRESS_LEVELS.map((item) => {
                const isSelected = stress === item.level;
                const isHigh = item.level >= 4;
                return (
                  <button
                    key={item.level}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`scale-segment-btn ${isSelected ? (isHigh ? 'is-selected-stress' : 'is-selected') : ''}`}
                    onClick={() => setStress(item.level)}
                  >
                    <span className="segment-number">{item.level}</span>
                    <span className="segment-label">{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="scale-axis-labels">
              <span>1: Very Relaxed</span>
              <span>3: Manageable Workload</span>
              <span>5: Severe Tension</span>
            </div>
          </div>
        </fieldset>

        {/* Field 3: Energy Rating (1 to 5) */}
        <fieldset className="cinematic-card form-section-card">
          <legend className="form-section-legend">
            3. Physical & Mental Stamina (1 to 5)
          </legend>
          <p className="form-section-hint">
            Rest quality, physical energy, and capacity to focus throughout the day.
          </p>

          <div className="scale-control-wrapper">
            <div className="scale-button-grid" role="radiogroup" aria-label="Energy level from 1 to 5">
              {ENERGY_LEVELS.map((item) => {
                const isSelected = energy === item.level;
                return (
                  <button
                    key={item.level}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`scale-segment-btn ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setEnergy(item.level)}
                  >
                    <span className="segment-number">{item.level}</span>
                    <span className="segment-label">{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="scale-axis-labels">
              <span>1: Exhausted</span>
              <span>3: Balanced Battery</span>
              <span>5: Fully Charged</span>
            </div>
          </div>
        </fieldset>

        {/* Field 4: Optional Personal Note */}
        <div className="cinematic-card form-section-card">
          <label htmlFor="checkin-note-input" className="form-section-legend">
            4. Personal Reflection Note <span className="legend-optional">(Optional)</span>
          </label>
          <p className="form-section-hint">
            Jot down a fleeting thought: a lab that went well, a conversation, or something you are grateful for.
          </p>

          <textarea
            id="checkin-note-input"
            className="cinematic-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., Felt groggy in the 8:30 AM lecture, but going for a walk around the hostel grounds cleared my head..."
            maxLength={500}
            rows={4}
          />
          <div className="textarea-footer-meta">
            <div className="privacy-pill-subtle">
              <Lock size={13} aria-hidden="true" />
              <span>In-Memory RAM Only</span>
            </div>
            <span className="char-count-text">{note.length} / 500</span>
          </div>
        </div>

        {/* Submit Action */}
        <div className="form-submit-row">
          <button type="submit" className="btn-cinematic-primary btn-lg">
            <Sparkles size={16} aria-hidden="true" />
            <span>Save Today's Reflection</span>
          </button>
          <button
            type="button"
            className="btn-cinematic-ghost"
            onClick={() => setActiveTab('dashboard')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
