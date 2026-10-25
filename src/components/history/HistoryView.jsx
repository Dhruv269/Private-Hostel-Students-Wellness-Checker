import React, { useState } from 'react';
import { 
  Calendar, 
  BarChart3, 
  Activity, 
  BatteryMedium, 
  TrendingUp, 
  Info, 
  Clock, 
  PenLine,
  Sparkles,
  Smile,
  Meh,
  CloudRain,
  Flame
} from 'lucide-react';
import { MOOD_DEFINITIONS, getMoodById } from '../../data/mockData';
import { formatDisplayDate, getShortDayName } from '../../utils/dateUtils';

const MOOD_ICONS = {
  great: Sparkles,
  good: Smile,
  okay: Meh,
  low: CloudRain,
  overwhelmed: Flame
};

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
 * Reusable Cinematic Trend Bar Chart with interactive hover states
 */
function TrendBarChart({ title, icon, description, data, property, barColorClass }) {
  const isStress = property === 'stress';
  const [activeDayIdx, setActiveDayIdx] = useState(null);

  return (
    <div className="cinematic-card trend-chart-card">
      <div className="trend-card-header">
        <div className="trend-card-title-group">
          <div className="trend-title-icon-box">{icon}</div>
          <h2 className="trend-card-title">{title}</h2>
        </div>
        <span className="trend-scale-tag">Scale 1 to 5</span>
      </div>

      <p className="trend-chart-desc">{description}</p>

      {data.length === 0 ? (
        <div className="trend-chart-empty">
          No check-in entries logged yet. Record your first check-in to generate trends.
        </div>
      ) : (
        <div className="trend-chart-body">
          <div 
            className="trend-bars-wrapper" 
            style={data.length < 7 ? { gridTemplateColumns: `repeat(${data.length}, 1fr)` } : undefined}
            aria-label={`${title} over recent check-ins`}
          >
            {data.map((item, index) => {
              const value = getValidScaleValue(item[property]);
              const heightPercent = value === null ? 0 : (value / 5) * 100;
              const dayName = getValidDate(item.date) ? getShortDayName(item.date) : 'Day';
              const isHighStress = isStress && value !== null && value >= 4;
              const isInspected = activeDayIdx === index;

              return (
                <button
                  key={item.id || `${item.date || 'entry'}-${property}-${index}`} 
                  type="button"
                  className={`trend-column ${isInspected ? 'is-column-hovered' : ''}`}
                  onClick={() => setActiveDayIdx(isInspected ? null : index)}
                  onMouseEnter={() => setActiveDayIdx(index)}
                  onMouseLeave={() => setActiveDayIdx(null)}
                  aria-label={`${dayName}: ${property} ${value ?? 'unrecorded'}/5`}
                >
                  <span className={`trend-value-label ${isHighStress ? 'trend-value-stress' : ''}`}>
                    {value ?? '—'}
                  </span>

                  <div className="trend-bar-track">
                    <div 
                      className={`trend-bar-fill ${barColorClass}`} 
                      style={{ height: `${heightPercent}%` }} 
                    />
                  </div>

                  <span className="trend-day-label">{dayName}</span>
                </button>
              );
            })}
          </div>

          {activeDayIdx !== null && data[activeDayIdx] && (
            <div className="trend-day-tooltip" role="status">
              <span>{getShortDayName(data[activeDayIdx].date)}</span>
              <span className="tooltip-divider">•</span>
              <span>{property === 'stress' ? 'Stress Level' : 'Stamina'}: <strong>{data[activeDayIdx][property]}/5</strong></span>
              {data[activeDayIdx].note && (
                <>
                  <span className="tooltip-divider">•</span>
                  <span className="tooltip-note">"{data[activeDayIdx].note.slice(0, 45)}..."</span>
                </>
              )}
            </div>
          )}

          <div className="trend-axis-labels">
            <span>{data.length > 1 ? '7 Days Ago' : 'Current'}</span>
            {data.length > 1 && <span>Today</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistoryView({ checkIns, setActiveTab }) {
  const entries = Array.isArray(checkIns)
    ? checkIns.filter((item) => item && typeof item === 'object')
    : [];

  const [activeViewMode, setActiveViewMode] = useState('trends');

  // Reverse chronological (newest first) for timeline
  const sortedCheckIns = [...entries].sort((a, b) => {
    const dateA = getValidDate(a.date);
    const dateB = getValidDate(b.date);
    if (!dateA || !dateB) return dateA ? -1 : dateB ? 1 : 0;
    return dateB - dateA;
  });

  // Chronological for trend charts (oldest to newest, last 7)
  const last7Days = [...entries]
    .sort((a, b) => {
      const dateA = getValidDate(a.date);
      const dateB = getValidDate(b.date);
      if (!dateA || !dateB) return dateA ? 1 : dateB ? -1 : 0;
      return dateA - dateB;
    })
    .slice(-7);

  // Compute 7-day metrics
  let stressSum = 0;
  let energySum = 0;
  let countWithScales = 0;
  for (const item of last7Days) {
    const s = getValidScaleValue(item.stress);
    const e = getValidScaleValue(item.energy);
    if (s !== null && e !== null) {
      stressSum += s;
      energySum += e;
      countWithScales++;
    }
  }
  const avgStress7d = countWithScales > 0 ? (stressSum / countWithScales).toFixed(1) : '—';
  const avgEnergy7d = countWithScales > 0 ? (energySum / countWithScales).toFixed(1) : '—';

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
    <div className="history-page-cinematic">
      {/* Page Header & Mode Selector */}
      <header className="page-cinematic-header history-header-row">
        <div>
          <div className="header-eyebrow">
            <Sparkles size={14} className="text-emerald-400" aria-hidden="true" />
            <span>Wellness Analytics</span>
          </div>
          <h1 className="header-main-title">
            Check-In History & Trends
          </h1>
          <p className="header-lead">
            Observe your emotional climate and stamina patterns over time without judgment.
          </p>
        </div>

        <div className="history-view-toggle" role="group" aria-label="History view mode">
          <button
            type="button"
            className={`view-toggle-btn ${activeViewMode === 'trends' ? 'is-active' : ''}`}
            onClick={() => setActiveViewMode('trends')}
            aria-pressed={activeViewMode === 'trends'}
          >
            <BarChart3 size={15} aria-hidden="true" />
            <span>Visual Trends</span>
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${activeViewMode === 'timeline' ? 'is-active' : ''}`}
            onClick={() => setActiveViewMode('timeline')}
            aria-pressed={activeViewMode === 'timeline'}
          >
            <Clock size={15} aria-hidden="true" />
            <span>Timeline Logs ({entries.length})</span>
          </button>
        </div>
      </header>

      {/* Quick Summary Metrics Strip */}
      <div className="history-metrics-strip">
        <div className="history-metric-box">
          <span className="metric-box-label">7-Day Avg Stress</span>
          <span className="metric-box-val val-stress">{avgStress7d} / 5</span>
        </div>
        <div className="history-metric-box">
          <span className="metric-box-label">7-Day Avg Stamina</span>
          <span className="metric-box-val val-energy">{avgEnergy7d} / 5</span>
        </div>
        <div className="history-metric-box">
          <span className="metric-box-label">Recorded Entries</span>
          <span className="metric-box-val">{entries.length}</span>
        </div>
        <div className="history-metric-box">
          <span className="metric-box-label">Storage Model</span>
          <span className="metric-box-val metric-box-val-ram">Session RAM Only</span>
        </div>
      </div>

      {!hasActualCheckIns && (
        <div className="cinematic-card history-empty-banner">
          <div className="history-empty-icon-box">
            <Calendar size={28} className="text-emerald-400" aria-hidden="true" />
          </div>
          <div className="history-empty-text-group">
            <h2 className="history-empty-heading">Begin your personal log history</h2>
            <p className="history-empty-subtext">
              {hasSampleEntries
                ? 'The initial entries below are simulated demonstration scenarios to illustrate weekly trends.'
                : 'Log your first daily check-in to start mapping your personal wellness journey.'}
            </p>
          </div>
          <button
            type="button"
            className="btn-cinematic-primary btn-sm"
            onClick={() => setActiveTab('checkin')}
          >
            <PenLine size={15} aria-hidden="true" />
            <span>Record Today's Log</span>
          </button>
        </div>
      )}

      {/* Synthetic Demo Data Clarification Banner */}
      <div className="history-demo-pill-banner" role="note">
        <Info size={16} className="text-emerald-400 flex-shrink-0" aria-hidden="true" />
        <p className="demo-banner-text">
          <strong>Baseline Reference:</strong> Entries marked with <span className="badge-demo-tag">Sample Demo Data</span> are synthetic scenarios illustrating student rhythms. Live check-ins you record during this session are marked <span className="badge-live-tag">Current Session</span>.
        </p>
      </div>

      {/* SUBVIEW 1: Visual Charts */}
      {activeViewMode === 'trends' && (
        <div className="history-trends-view-stack">
          <div className="trends-chart-split-grid">
            <TrendBarChart 
              title="Perceived Stress Fluctuation"
              icon={<Activity size={18} className="text-coral-400" aria-hidden="true" />}
              description="Reflects academic deadlines, exams, or interpersonal hostel tension (1 = relaxed, 5 = overload)."
              data={last7Days}
              property="stress"
              barColorClass="bar-stress-color"
            />

            <TrendBarChart 
              title="Physical & Mental Stamina"
              icon={<BatteryMedium size={18} className="text-emerald-400" aria-hidden="true" />}
              description="Reflects sleep restfulness and daytime capacity to engage in classes (1 = exhausted, 5 = alert)."
              data={last7Days}
              property="energy"
              barColorClass="bar-energy-color"
            />
          </div>

          {/* Mood Distribution */}
          <div className="cinematic-card mood-distribution-card">
            <h2 className="distribution-heading">Mood State Distribution</h2>
            <div className="mood-distribution-grid">
              {MOOD_DEFINITIONS.map((m) => {
                const count = moodCounts[m.id] || 0;
                const MoodIcon = MOOD_ICONS[m.id] || Sparkles;
                return (
                  <div key={m.id} className="distribution-item-tile">
                    <div className="distribution-icon-box">
                      <MoodIcon size={18} aria-hidden="true" />
                    </div>
                    <span className="distribution-label">{m.label}</span>
                    <span className="distribution-count">{count} {count === 1 ? 'day' : 'days'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mindfulness Observation */}
          <div className="cinematic-card mindfulness-tip-card">
            <div className="mindfulness-tip-inner">
              <TrendingUp size={20} className="text-emerald-400 flex-shrink-0" aria-hidden="true" />
              <div>
                <h3 className="mindfulness-tip-title">How to interpret these trends</h3>
                <p className="mindfulness-tip-desc">
                  Notice whether energy dips coincide with consecutive late nights or if stress eases when you set boundaries with study groups. These charts are gentle indicators to help you adjust your schedule, not performance targets to beat.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 2: Chronological Timeline */}
      {activeViewMode === 'timeline' && (
        <section className="timeline-cards-stack" aria-label="Chronological list of check-in entries">
          {sortedCheckIns.length === 0 ? (
            <div className="cinematic-card history-no-entries">
              <h2>No entries recorded yet</h2>
              <p>Your logged check-ins will be listed here.</p>
            </div>
          ) : (
            sortedCheckIns.map((item, index) => {
              const moodObj = getMoodById(item.mood);
              const MoodIcon = MOOD_ICONS[item.mood] || Sparkles;
              const moodLabel = moodObj?.label || (typeof item.mood === 'string' ? item.mood : 'Unrecorded');
              const date = getValidDate(item.date);
              const dateLabel = date ? formatDisplayDate(item.date) : 'Recent Entry';
              const timestamp = typeof item.timestamp === 'string' ? item.timestamp.trim() : '';
              const note = typeof item.note === 'string' ? item.note.trim() : '';
              const stress = getValidScaleValue(item.stress);
              const energy = getValidScaleValue(item.energy);

              return (
                <article key={item.id || `checkin-${index}`} className="cinematic-card timeline-log-item">
                  <div className="timeline-item-header">
                    <div className="timeline-header-left">
                      <div className="timeline-mood-icon-box">
                        <MoodIcon size={18} className="text-emerald-400" aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="timeline-date-heading">{dateLabel}</h2>
                        <p className="timeline-meta-sub">
                          State: <strong>{moodLabel}</strong>
                          {timestamp && ` • ${timestamp}`}
                        </p>
                      </div>
                    </div>

                    <div className="timeline-header-right">
                      {item.isSynthetic ? (
                        <span className="badge-demo-tag">Sample Demo Data</span>
                      ) : (
                        <span className="badge-live-tag">Current Session</span>
                      )}
                    </div>
                  </div>

                  <div className="timeline-ratings-row">
                    {stress !== null && (
                      <span className="timeline-rating-chip">
                        <Activity size={14} className={stress >= 4 ? 'text-coral-400' : 'text-muted'} aria-hidden="true" />
                        <span>Stress: <strong>{stress} / 5</strong></span>
                      </span>
                    )}
                    {energy !== null && (
                      <span className="timeline-rating-chip">
                        <BatteryMedium size={14} className="text-emerald-400" aria-hidden="true" />
                        <span>Stamina: <strong>{energy} / 5</strong></span>
                      </span>
                    )}
                  </div>

                  {note && (
                    <blockquote className="timeline-note-quote">
                      "{note}"
                    </blockquote>
                  )}
                </article>
              );
            })
          )}
        </section>
      )}
    </div>
  );
}
