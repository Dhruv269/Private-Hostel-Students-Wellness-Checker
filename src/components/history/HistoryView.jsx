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
  Clock
} from 'lucide-react';
import { MOOD_DEFINITIONS, getMoodById } from '../../data/mockData';
import { formatDisplayDate, getShortDayName } from '../../utils/dateUtils';

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

      {/* Empty State: If no check-ins exist, show clear feedback rather than an empty box */}
      {data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No check-in records available yet. Log your first check-in to see your trends!
        </div>
      ) : (
        <>
          {/* 
            Chart bars rendered with semantic HTML & CSS Grid.
            Layout alignment: When fewer than 7 entries exist (e.g. 2 or 3 days),
            we dynamically match the grid columns to data.length so bars fill the space
            proportionally without phantom empty slots on the right.
          */}
          <div 
            className="trend-bars-wrapper" 
            style={data.length < 7 ? { gridTemplateColumns: `repeat(${data.length}, 1fr)` } : undefined}
            aria-label={`${title} over recent check-ins`}
          >
            {data.map((item) => {
              const value = Number(item[property]);
              const heightPercent = (value / 5) * 100;
              const dayName = getShortDayName(item.date);
              const isHighStress = isStress && value >= 4;

              return (
                <div key={item.id} className="trend-column">
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    color: isHighStress ? 'var(--color-stress)' : 'var(--text-primary)' 
                  }}>
                    {value}
                  </span>

                  <div className="trend-bar-wrapper">
                    <div 
                      className={`trend-bar ${barColorClass}`} 
                      style={{ height: `${heightPercent}%` }}
                      title={`${dayName}: ${property} ${value}/5`}
                    />
                  </div>

                  <span className="trend-day-label">{dayName}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.65rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>{data.length > 1 ? 'Earlier' : 'Latest Check-In'}</span>
            {data.length > 1 && <span>Recent</span>}
          </div>
        </>
      )}
    </div>
  );
}

export default function HistoryView({ checkIns }) {
  // Toggle between 'trends' (visual charts) and 'timeline' (list)
  const [activeViewMode, setActiveViewMode] = useState('trends');

  // Sort check-ins in reverse chronological order (newest first) for the timeline list
  const sortedCheckIns = [...checkIns].sort((a, b) => new Date(b.date) - new Date(a.date));

  // For the trend charts, sort in chronological order (oldest to newest) and take the 7 most recent
  const last7Days = [...checkIns]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-7);

  // Count how many days each mood was recorded using a simple, readable loop
  const moodCounts = {};
  for (const checkIn of checkIns) {
    const m = checkIn.mood;
    moodCounts[m] = (moodCounts[m] || 0) + 1;
  }

  return (
    <div>
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
          >
            <BarChart3 size={15} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'text-bottom' }} aria-hidden="true" />
            Trends & Patterns
          </button>
          <button
            type="button"
            className={`toggle-btn ${activeViewMode === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveViewMode('timeline')}
          >
            <Clock size={15} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'text-bottom' }} aria-hidden="true" />
            Timeline Logs ({checkIns.length})
          </button>
        </div>
      </div>

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
        <div className="checkin-list" role="feed" aria-label="Timeline of past check-ins">
          {sortedCheckIns.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <Calendar size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} aria-hidden="true" />
              <h3>No check-ins recorded yet</h3>
              <p>Your logged check-ins will appear here.</p>
            </div>
          ) : (
            sortedCheckIns.map((item) => {
              const moodObj = getMoodById(item.mood);
              return (
                <article key={item.id} className="checkin-item">
                  <div className="checkin-item-header">
                    <div className="checkin-date-group">
                      <span style={{ fontSize: '1.4rem' }} aria-hidden="true">{moodObj?.emoji || '✨'}</span>
                      <div>
                        <div className="checkin-date">{formatDisplayDate(item.date)}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Mood: {moodObj?.label || item.mood}
                          {item.timestamp ? ` • ${item.timestamp}` : ''}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {item.isSynthetic ? (
                        <span className="badge badge-demo">Sample Demo Data</span>
                      ) : (
                        <span className="badge badge-live">Recorded in Current Session</span>
                      )}
                    </div>
                  </div>

                  <div className="checkin-metrics">
                    <span className="metric-pill">
                      <Activity size={14} style={{ color: item.stress >= 4 ? 'var(--color-stress)' : 'var(--text-secondary)' }} aria-hidden="true" />
                      <span>Stress: <strong>{item.stress}/5</strong></span>
                    </span>
                    <span className="metric-pill">
                      <BatteryMedium size={14} style={{ color: 'var(--color-primary-light)' }} aria-hidden="true" />
                      <span>Energy: <strong>{item.energy}/5</strong></span>
                    </span>
                  </div>

                  {item.note && (
                    <div className="checkin-note">
                      "{item.note}"
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
