/**
 * HistoryView.jsx - Check-In History & Trend Visualizations
 * 
 * HOW THIS COMPONENT WORKS:
 * 1. View Mode Toggle:
 *    - Allows switching between 'trends' (visual bar charts) and 'timeline' (chronological log list).
 * 2. Visual Trends View:
 *    - Takes the 7 most recent check-in entries (`last7Days`).
 *    - Uses a reusable `TrendBarChart` helper component to render both the Stress and Energy charts.
 *    - Calculates the height percentage of each bar: `(level / 5) * 100`% (since scales are 1 to 5).
 * 3. Timeline View:
 *    - Sorts the check-ins from newest to oldest.
 *    - Tags each record with either a green "Recorded in Current Session" badge or a yellow "Sample Demo Data" badge.
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  BarChart3, 
  Activity, 
  BatteryMedium, 
  TrendingUp, 
  Info,
  Clock,
  PenLine
} from 'lucide-react';
import { MOOD_DEFINITIONS, getMoodById } from '../../data/mockData';
import { formatDisplayDate, getShortDayName } from '../../utils/dateUtils';

function getValidDate(dateValue) {
  if (typeof dateValue !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return null;
  }

  const date = new Date(`${dateValue}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateValue
    ? null
    : date;
}

function getValidScaleValue(value) {
  if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue >= 1 && numericValue <= 5
    ? numericValue
    : null;
}

/**
 * Reusable Trend Bar Chart Component
 * 
 * Instead of duplicating identical chart JSX for stress and energy,
 * this component accepts props and renders a 7-day horizontal bar chart.
 * 
 * @param {string} title - Chart title (e.g. "Stress Level Fluctuation")
 * @param {React.ReactNode} icon - Lucide icon element
 * @param {string} description - Explanatory hint for students
 * @param {Array} data - Array of check-in records for the last 7 days
 * @param {string} property - Property to chart ('stress' or 'energy')
 * @param {string} barColorClass - CSS class for bar gradient ('trend-bar-stress' or 'trend-bar-energy')
 */
function TrendBarChart({ title, icon, description, data, property, barColorClass }) {
  const isStress = property === 'stress';

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          {icon}
          <span>{title}</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scale 1 to 5</span>
      </div>

      <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        {description}
      </p>

      {/* 
        Chart bars rendered with semantic HTML & CSS Grid.
        Height is calculated as a percentage: (value / 5) * 100
      */}
      <div className="trend-bars-wrapper" aria-label={`${title} over the past 7 days`}>
        {data.map((item, index) => {
          const value = getValidScaleValue(item[property]);
          const heightPercent = value === null ? 0 : (value / 5) * 100;
          const dayName = getValidDate(item.date) ? getShortDayName(item.date) : 'Unknown';
          const isHighStress = isStress && value !== null && value >= 4;

          return (
            <div key={item.id || `${item.date || 'entry'}-${property}-${index}`} className="trend-column">
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 600, 
                color: isHighStress ? 'var(--color-stress)' : 'var(--text-primary)' 
              }}>
                {value ?? '—'}
              </span>

              <div className="trend-bar-wrapper">
                <div 
                  className={`trend-bar ${barColorClass}`} 
                  style={{ height: `${heightPercent}%` }}
                  title={`${dayName}: ${property} ${value === null ? 'not recorded' : `${value}/5`}`}
                />
              </div>

              <span className="trend-day-label">{dayName}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.65rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>Earlier</span>
        <span>Today</span>
      </div>
    </div>
  );
}

export default function HistoryView({ checkIns, setActiveTab }) {
  const entries = Array.isArray(checkIns)
    ? checkIns.filter((item) => item && typeof item === 'object')
    : [];

  // Toggle between 'trends' (visual charts) and 'timeline' (list)
  const [activeViewMode, setActiveViewMode] = useState('trends');

  // Sort check-ins in reverse chronological order (newest first) for the timeline
  const sortedCheckIns = [...entries].sort((a, b) => {
    const dateA = getValidDate(a.date);
    const dateB = getValidDate(b.date);
    if (!dateA || !dateB) return dateA ? -1 : dateB ? 1 : 0;
    return dateB - dateA;
  });

  // Slice the 7 most recent entries for the trend charts
  const last7Days = [...entries].slice(-7);

  // Count how many days each mood was recorded using a simple, readable loop
  const moodCounts = {};
  for (const checkIn of entries) {
    if (typeof checkIn.mood === 'string' && checkIn.mood.trim()) {
      const moodKey = checkIn.mood.trim();
      moodCounts[moodKey] = (moodCounts[moodKey] || 0) + 1;
    }
  }
  const hasActualCheckIns = entries.some((entry) => entry.isSynthetic === false);
  const hasSampleEntries = entries.some((entry) => entry.isSynthetic === true);

  return (
    <div className="history-page">
      {/* Header and View Mode Toggle */}
      <div className="history-controls">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>
            Check-In History & Trends
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Reflect on patterns across your week without judgment. Notice how academics and rest affect your vitality.
          </p>
        </div>

        <div className="view-toggle" role="group" aria-label="History view mode">
          <button
            type="button"
            className={`toggle-btn ${activeViewMode === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveViewMode('trends')}
            aria-pressed={activeViewMode === 'trends'}
          >
            <BarChart3 size={15} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'text-bottom' }} aria-hidden="true" />
            Trends & Patterns
          </button>
          <button
            type="button"
            className={`toggle-btn ${activeViewMode === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveViewMode('timeline')}
            aria-pressed={activeViewMode === 'timeline'}
          >
            <Clock size={15} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'text-bottom' }} aria-hidden="true" />
            Timeline Logs ({entries.length})
          </button>
        </div>
      </div>

      {!hasActualCheckIns && (
        <section className="history-empty-state" aria-labelledby="history-empty-title">
          <div className="card history-empty-card">
            <div className="history-empty-icon" aria-hidden="true">
              <Calendar size={36} />
            </div>
            <h2 id="history-empty-title">Your wellness journey starts here.</h2>
            <p>
              {hasSampleEntries
                ? 'You have not recorded a personal check-in yet. Sample entries below are examples, not your history.'
                : 'Completed check-ins will appear here, giving you a private place to review your reflections over time.'}
            </p>
            <button
              type="button"
              className="btn btn-primary history-empty-cta"
              onClick={() => setActiveTab('checkin')}
            >
              <PenLine size={18} aria-hidden="true" />
              <span>Complete your first check-in</span>
            </button>
          </div>
        </section>
      )}

      {/* Notice regarding synthetic demo data */}
      <div style={{ 
        background: 'rgba(30, 41, 66, 0.4)', 
        border: '1px solid var(--border-subtle)', 
        borderRadius: 'var(--radius-md)', 
        padding: '0.75rem 1rem', 
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        fontSize: '0.825rem',
        color: 'var(--text-secondary)'
      }}>
        <Info size={18} style={{ color: 'var(--color-warning)', flexShrink: 0 }} aria-hidden="true" />
        <span>
          <strong>Demo Notice:</strong> Entries labeled with <span className="badge badge-demo" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>Sample Demo Data</span> are synthetic scenarios simulating a typical hostel student's week. Any check-ins you record today are labeled <span className="badge badge-live" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>Recorded in Current Session</span>.
        </span>
      </div>

      {/* ====================================================================
          SUBVIEW 1: Visual Trend Charts
          ==================================================================== */}
      {activeViewMode === 'trends' && (
        <div className="trend-chart-container">
          <div className="dashboard-split">
            {/* Stress Chart */}
            <TrendBarChart 
              title="Stress Level Fluctuation"
              icon={<Activity size={18} style={{ color: 'var(--color-stress)' }} aria-hidden="true" />}
              description="Higher bars indicate higher perceived academic or personal pressure."
              data={last7Days}
              property="stress"
              barColorClass="trend-bar-stress"
            />

            {/* Energy Chart */}
            <TrendBarChart 
              title="Energy Level Stamina"
              icon={<BatteryMedium size={18} style={{ color: 'var(--color-primary-light)' }} aria-hidden="true" />}
              description="Higher bars indicate better physical vitality, alertness, and focus."
              data={last7Days}
              property="energy"
              barColorClass="trend-bar-energy"
            />
          </div>

          {/* Mood Breakdown Summary */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.85rem' }}>Mood Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
              {MOOD_DEFINITIONS.map((m) => {
                const count = moodCounts[m.id] || 0;
                return (
                  <div key={m.id} style={{ 
                    background: 'var(--bg-surface-elevated)', 
                    padding: '0.85rem', 
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.25rem' }}>{m.emoji}</span>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{m.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{count} {count === 1 ? 'day' : 'days'}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Educational Pattern Observation Box */}
          <div className="card" style={{ background: 'rgba(20, 184, 166, 0.05)', borderColor: 'rgba(20, 184, 166, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <TrendingUp size={22} style={{ color: 'var(--color-primary-light)', flexShrink: 0, marginTop: '0.2rem' }} aria-hidden="true" />
              <div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                  How to use these trends without self-criticism:
                </h4>
                <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                  Notice if your energy dips consistently after consecutive late-night study sessions or if stress drops following calls home. These trends are not "scores" to optimize; they are gentle mirrors to help you plan rest days and protect your boundaries.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          SUBVIEW 2: Chronological Timeline Log List
          ==================================================================== */}
      {activeViewMode === 'timeline' && (
        <section className="checkin-list" aria-label="Timeline of past check-ins">
          {sortedCheckIns.length === 0 ? (
            <div className="card history-no-entries">
              <h2>No check-ins recorded yet</h2>
              <p>Your completed check-ins will appear here.</p>
            </div>
          ) : sortedCheckIns.map((item, index) => {
            const moodObj = getMoodById(item.mood);
            const moodLabel = moodObj?.label
              || (typeof item.mood === 'string' && item.mood.trim() ? item.mood : 'Not recorded');
            const date = getValidDate(item.date);
            const dateLabel = date ? formatDisplayDate(item.date) : 'Date unavailable';
            const timestamp = typeof item.timestamp === 'string' ? item.timestamp.trim() : '';
            const note = typeof item.note === 'string' ? item.note.trim() : '';
            const stress = getValidScaleValue(item.stress);
            const energy = getValidScaleValue(item.energy);

            return (
              <article key={item.id || `checkin-${index}`} className="checkin-item">
                <div className="checkin-item-header">
                  <div className="checkin-date-group">
                    <span style={{ fontSize: '1.4rem' }} aria-hidden="true">{moodObj?.emoji || '✨'}</span>
                    <div className="history-entry-details">
                      <h2 className="checkin-date">{dateLabel}</h2>
                      <p className="history-entry-subtitle">
                        Mood: {moodLabel}
                        {timestamp && ` • ${timestamp}`}
                      </p>
                    </div>
                  </div>

                  <div className="history-entry-badge">
                    {item.isSynthetic ? (
                      <span className="badge badge-demo">Sample Demo Data</span>
                    ) : item.isSynthetic === false ? (
                      <span className="badge badge-live">Recorded in Current Session</span>
                    ) : (
                      <span className="badge badge-calm">Record type unavailable</span>
                    )}
                  </div>
                </div>

                <div className="checkin-metrics" aria-label="Wellness ratings">
                  {stress !== null && (
                    <span className="metric-pill">
                      <Activity size={14} style={{ color: stress >= 4 ? 'var(--color-stress)' : 'var(--text-secondary)' }} aria-hidden="true" />
                      <span>Stress: <strong>{stress}/5</strong></span>
                    </span>
                  )}
                  {energy !== null && (
                    <span className="metric-pill">
                      <BatteryMedium size={14} style={{ color: 'var(--color-primary-light)' }} aria-hidden="true" />
                      <span>Energy: <strong>{energy}/5</strong></span>
                    </span>
                  )}
                  {stress === null && energy === null && (
                    <span className="history-missing-value">No wellness ratings recorded</span>
                  )}
                </div>

                {note && (
                  <div className="checkin-note">
                    “{note}”
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
