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
  Flame,
  Lightbulb,
  Heart
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

const NOTE_INSPIRATIONS = [
  "Felt groggy in morning lecture, but a short walk around the campus green cleared my head...",
  "Hostel corridor felt noisy, but putting on headphones helped me finish my tutorial sheet...",
  "Had warm chai with my roommate and talked through our exam anxieties...",
  "Missing home and home-cooked food today, but taking it one evening at a time..."
];

/**
 * Calculates a dynamic equilibrium insight comparing current stress and stamina.
 */
function getEquilibriumInsight(stressVal, energyVal) {
  const s = Number(stressVal);
  const e = Number(energyVal);

  if (s >= 4 && e <= 2) {
    return {
      status: 'High Load • Low Stamina',
      desc: 'Heavy academic or living stress with drained reserves. Prioritize resting, hydration, and stepping away from screens tonight.',
      toneClass: 'balance-tone-warning'
    };
  }
  if (s >= 4 && e >= 4) {
    return {
      status: 'High Intensity • Active Energy',
      desc: 'You have drive, but watch out for sudden burnout. Schedule short recovery intervals between study blocks.',
      toneClass: 'balance-tone-alert'
    };
  }
  if (s <= 2 && e >= 4) {
    return {
      status: 'In The Zone • Rested & Grounded',
      desc: 'Optimal equilibrium. A great mental space to tackle complex assignments or unwind with friends.',
      toneClass: 'balance-tone-thriving'
    };
  }
  if (s <= 2 && e <= 2) {
    return {
      status: 'Low Stress • Gentle Rest Mode',
      desc: 'You might feel drowsy or physically sluggish. A brief nap or light walk can restore physical stamina.',
      toneClass: 'balance-tone-gentle'
    };
  }
  return {
    status: 'Steady Equilibrium',
    desc: 'Workload and physical stamina are reasonably balanced today. Keep pacing yourself smoothly.',
    toneClass: 'balance-tone-balanced'
  };
}

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
  const [inspirationIndex, setInspirationIndex] = useState(0);

  const successRef = useRef(null);
  const formRef = useRef(null);

  // GSAP animation for success confirmation view
  useEffect(() => {
    if (isSubmitted && successRef.current) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.from(successRef.current, {
        opacity: 0,
        y: 20,
        scale: 0.97,
        duration: 0.6,
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

  const handleInsertInspiration = () => {
    const nextText = NOTE_INSPIRATIONS[inspirationIndex % NOTE_INSPIRATIONS.length];
    setNote(nextText);
    setInspirationIndex((prev) => prev + 1);
  };

  const equilibriumInsight = getEquilibriumInsight(stress, energy);

  // ==========================================================================
  // VIEW A: Success Confirmation State (Midnight Sanctuary Acknowledgement)
  // ==========================================================================
  if (isSubmitted) {
    const selectedMoodObj = getMoodById(mood);
    const MoodIcon = MOOD_ICONS[mood] || Sparkles;

    return (
      <div className="checkin-container-focused">
        <div className="cinematic-card checkin-success-modal" ref={successRef}>
          <div className="success-emblem-wrapper">
            <div className="success-emblem-halo" aria-hidden="true" />
            <CheckCircle2 size={38} className="text-emerald-400" aria-hidden="true" />
          </div>

          <div className="success-badge-row">
            <span className="badge-emerald-subtle">
              Check-In Preserved in Session RAM
            </span>
          </div>

          <h1 className="success-modal-title">
            Your sanctuary log is recorded.
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
                <span className="success-mood-label">State of Mind: {selectedMoodObj?.label}</span>
                <span className="success-mood-desc">{selectedMoodObj?.description}</span>
              </div>
            </div>

            <div className="success-scales-row">
              <div className="success-scale-chip">
                <span className="scale-chip-label">Stress Level</span>
                <span className={`scale-chip-val ${stress >= 4 ? 'val-stress-high' : 'val-stress-normal'}`}>
                  {stress} / 5
                </span>
              </div>
              <div className="success-scale-chip">
                <span className="scale-chip-label">Stamina Level</span>
                <span className="scale-chip-val val-energy">
                  {energy} / 5
                </span>
              </div>
            </div>

            {/* Equilibrium Summary */}
            <div className={`success-equilibrium-box ${equilibriumInsight.toneClass}`}>
              <div className="equilibrium-title-row">
                <Heart size={14} aria-hidden="true" />
                <strong>{equilibriumInsight.status}</strong>
              </div>
              <p className="equilibrium-desc">{equilibriumInsight.desc}</p>
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
  // VIEW B: Tactile Sanctuary Input Form
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
        {/* Field 1: Overall Mood Selection (Tactile Frosted Stones) */}
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
                  className={`mood-tile-btn mood-tile-${item.id} ${isSelected ? 'is-selected' : ''}`}
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
            Exam prep, syllabus deadlines, hostel room environment, or roommate friction.
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
            Sleep quality, physical battery, and your capacity to focus throughout lectures.
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

          {/* Live Dynamic Equilibrium Feedback */}
          <div className={`checkin-live-equilibrium ${equilibriumInsight.toneClass}`}>
            <span className="equilibrium-pill-label">Equilibrium Preview:</span>
            <span className="equilibrium-pill-status">{equilibriumInsight.status}</span>
            <p className="equilibrium-pill-desc">{equilibriumInsight.desc}</p>
          </div>
        </fieldset>

        {/* Field 4: Optional Personal Note with Suggestion Tool */}
        <div className="cinematic-card form-section-card">
          <div className="note-section-header">
            <label htmlFor="checkin-note-input" className="form-section-legend">
              4. Personal Reflection Note <span className="legend-optional">(Optional)</span>
            </label>
            <button
              type="button"
              className="note-inspiration-btn"
              onClick={handleInsertInspiration}
              title="Insert a gentle reflection prompt"
            >
              <Lightbulb size={13} aria-hidden="true" />
              <span>Need prompt?</span>
            </button>
          </div>
          <p className="form-section-hint">
            Jot down a fleeting thought: a lab experiment, conversation with a roommate, or something you weathered today.
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
