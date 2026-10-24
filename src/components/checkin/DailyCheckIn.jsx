/**
 * DailyCheckIn.jsx - Daily Wellness Check-In Form & Success Feedback
 * 
 * HOW THIS COMPONENT WORKS:
 * 1. Form State Management:
 *    - Tracks user inputs locally using React's `useState`:
 *      `mood` (string), `stress` (1-5), `energy` (1-5), `note` (string).
 *    - If the user already checked in today (`todayCheckIn` prop exists),
 *      the form is pre-populated with their existing values so they can edit.
 * 2. Validation:
 *    - Mood is required. If the student clicks Submit without picking a mood,
 *      we set an error message and cancel submission.
 * 3. Saving & "Lifting State Up":
 *    - When valid, the component creates a complete `newRecord` object and calls
 *      `onSaveCheckIn(newRecord)`. This notifies the parent (`App.jsx`) to update
 *      the global `checkIns` array.
 * 4. Conditional Rendering:
 *    - If `isSubmitted === true`, it displays the clean success card instead of the form.
 */

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  ArrowRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { MOOD_DEFINITIONS, STRESS_LEVELS, ENERGY_LEVELS, getMoodById } from '../../data/mockData';
import { getTodayDateString } from '../../utils/dateUtils';

export default function DailyCheckIn({ 
  todayCheckIn, 
  onSaveCheckIn, 
  setActiveTab 
}) {
  // Local form field state: initialized with today's values if editing, or sensible defaults
  const [mood, setMood] = useState(todayCheckIn ? todayCheckIn.mood : '');
  const [stress, setStress] = useState(todayCheckIn ? todayCheckIn.stress : 3);
  const [energy, setEnergy] = useState(todayCheckIn ? todayCheckIn.energy : 3);
  const [note, setNote] = useState(todayCheckIn ? todayCheckIn.note : '');

  // UI state for errors and success screen toggle
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  /**
   * Form Submission Handler:
   * 1. Validates required fields (mood must be selected).
   * 2. Constructs a clean record object with today's date and a timestamp.
   * 3. Calls `onSaveCheckIn` (callback passed down from App.jsx).
   * 4. Flips `isSubmitted` to true to show the success confirmation screen.
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation check: Mood is mandatory
    if (!mood) {
      setError('Please choose a mood that best reflects how you feel right now.');
      return;
    }

    // Clear any previous error
    setError('');

    // Look up human-readable label for the mood
    const moodObj = getMoodById(mood);

    // Build the complete check-in record
    const newRecord = {
      id: todayCheckIn?.id || `session-${Date.now()}`,
      date: getTodayDateString(),
      mood,
      moodLabel: moodObj?.label || mood,
      stress: Number(stress),
      energy: Number(energy),
      note: note.trim(),
      isSynthetic: false, // User-submitted check-in for this session
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Send the record up to App.jsx to update the application-level state
    onSaveCheckIn(newRecord);

    // Switch to the confirmation state
    setIsSubmitted(true);
  };

  /**
   * Reset to allow the user to make edits to today's log
   */
  const handleEditAgain = () => {
    setIsSubmitted(false);
  };

  // ==========================================================================
  // VIEW A: Success Confirmation State (shown after saving)
  // ==========================================================================
  if (isSubmitted) {
    const selectedMoodObj = getMoodById(mood);

    return (
      <div className="checkin-form-container">
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            background: 'var(--color-success-bg)', 
            color: 'var(--color-success)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.25rem auto' 
          }}>
            <CheckCircle2 size={36} aria-hidden="true" />
          </div>

          <span className="badge badge-live" style={{ marginBottom: '0.75rem' }}>
            Check-In Saved (In-Memory Session)
          </span>

          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>
            Thank you for checking in today!
          </h2>
          <p style={{ maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
            Noticing your state of mind is a valuable personal boundary in busy hostel life. Your log has been recorded for this session.
          </p>

          {/* Quick Summary Box */}
          <div style={{ 
            background: 'var(--bg-surface-elevated)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '1.25rem', 
            maxWidth: '480px', 
            margin: '0 auto 1.75rem auto',
            border: '1px solid var(--border-subtle)',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.75rem' }}>{selectedMoodObj?.emoji}</span>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Mood: {selectedMoodObj?.label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedMoodObj?.description}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '0.75rem 0', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Stress Rating</div>
                <div style={{ fontWeight: 700, color: stress >= 4 ? 'var(--color-stress)' : 'var(--text-primary)' }}>
                  Level {stress} / 5
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Energy Rating</div>
                <div style={{ fontWeight: 700, color: 'var(--color-primary-light)' }}>
                  Level {energy} / 5
                </div>
              </div>
            </div>

            {note.trim() && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Your Note</div>
                <div style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  "{note.trim()}"
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActiveTab('dashboard')}
            >
              <span>Back to Dashboard</span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActiveTab('history')}
            >
              <span>View Trends & History</span>
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleEditAgain}
            >
              <RotateCcw size={15} aria-hidden="true" />
              <span>Make Changes</span>
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
    <div className="checkin-form-container">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
          Daily Wellness Check-In
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Take a quiet moment away from academics and roommates. How is your body and mind feeling right now?
        </p>
      </div>

      {/* Accessible Error Alert (Rendered only when validation fails) */}
      {error && (
        <div style={{ 
          background: 'var(--color-stress-bg)', 
          border: '1px solid var(--color-stress)', 
          borderRadius: 'var(--radius-md)', 
          padding: '0.85rem 1rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.65rem', 
          marginBottom: '1.5rem',
          color: '#fecdd3'
        }} role="alert">
          <AlertCircle size={20} style={{ color: 'var(--color-stress)', flexShrink: 0 }} aria-hidden="true" />
          <span style={{ fontSize: '0.875rem' }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Field 1: Overall Mood Selection */}
        <fieldset className="form-section card" style={{ border: 'none', padding: '1.5rem' }}>
          <legend className="form-label" style={{ fontSize: '1.1rem' }}>
            1. Overall Mood <span style={{ color: 'var(--color-stress)' }}>*</span>
          </legend>
          <p className="form-hint">
            Pick the descriptor that feels closest to your mental state today.
          </p>

          <div className="mood-grid" role="radiogroup" aria-required="true">
            {MOOD_DEFINITIONS.map((item) => {
              const isSelected = mood === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`mood-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => setMood(item.id)}
                >
                  <span className="mood-emoji" aria-hidden="true">{item.emoji}</span>
                  <span className="mood-text">{item.label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Field 2: Stress Rating (1 to 5) */}
        <fieldset className="form-section card" style={{ border: 'none', padding: '1.5rem', marginTop: '1.25rem' }}>
          <legend className="form-label" style={{ fontSize: '1.1rem' }}>
            2. Stress & Pressure Level (1 to 5)
          </legend>
          <p className="form-hint">
            Academic deadlines, mess issues, exams, or personal concerns.
          </p>

          <div className="scale-container">
            <div className="scale-buttons" role="radiogroup" aria-label="Stress level from 1 to 5">
              {STRESS_LEVELS.map((item) => {
                const isSelected = stress === item.level;
                const isStressful = item.level >= 4;
                return (
                  <button
                    key={item.level}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`scale-btn ${isSelected ? (isStressful ? 'selected-stress' : 'selected') : ''}`}
                    onClick={() => setStress(item.level)}
                  >
                    <span className="scale-number">{item.level}</span>
                    <span className="scale-tag">{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="scale-labels">
              <span>1: Very Relaxed</span>
              <span>3: Moderate Stress</span>
              <span>5: Overwhelming</span>
            </div>
          </div>
        </fieldset>

        {/* Field 3: Energy Rating (1 to 5) */}
        <fieldset className="form-section card" style={{ border: 'none', padding: '1.5rem', marginTop: '1.25rem' }}>
          <legend className="form-label" style={{ fontSize: '1.1rem' }}>
            3. Physical & Mental Energy Level (1 to 5)
          </legend>
          <p className="form-hint">
            Sleep quality, physical stamina, and ability to focus today.
          </p>

          <div className="scale-container">
            <div className="scale-buttons" role="radiogroup" aria-label="Energy level from 1 to 5">
              {ENERGY_LEVELS.map((item) => {
                const isSelected = energy === item.level;
                return (
                  <button
                    key={item.level}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`scale-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => setEnergy(item.level)}
                  >
                    <span className="scale-number">{item.level}</span>
                    <span className="scale-tag">{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="scale-labels">
              <span>1: Exhausted</span>
              <span>3: Normal Battery</span>
              <span>5: High Energy</span>
            </div>
          </div>
        </fieldset>

        {/* Field 4: Optional Personal Note */}
        <div className="form-section card" style={{ padding: '1.5rem', marginTop: '1.25rem' }}>
          <label htmlFor="checkin-note-input" className="form-label" style={{ fontSize: '1.1rem' }}>
            4. Personal Reflection Note <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
          </label>
          <p className="form-hint">
            Write down whatever is on your mind—a difficult class, an interaction with a hostelmate, or something you are grateful for.
          </p>

          <textarea
            id="checkin-note-input"
            className="textarea-field"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Felt tired during the 9 AM lab. Had tea with roommate in evening which helped me reset."
            maxLength={500}
            rows={4}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {note.length} / 500 characters
          </div>

          <div className="privacy-helper-box">
            <Lock size={16} style={{ color: 'var(--color-primary-light)', flexShrink: 0, marginTop: '0.1rem' }} aria-hidden="true" />
            <div>
              <strong>Privacy Notice for Prototype:</strong> This check-in stays in browser memory only during this demo session. Do not include sensitive medical diagnoses, passwords, or personal identity numbers.
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
            <Sparkles size={18} aria-hidden="true" />
            <span>Save Check-In</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setActiveTab('dashboard')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
