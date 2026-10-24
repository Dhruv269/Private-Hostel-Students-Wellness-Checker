import React, { useRef, useState } from 'react';
import { BookOpen, CalendarDays, ChevronDown, ChevronUp, Edit3, Save, Trash2, X } from 'lucide-react';
import { STATIC_REFLECTION_PROMPTS } from '../../data/mockData';
import { formatDisplayDate, getTodayDateString } from '../../utils/dateUtils';
import './ReflectionJournal.css';

const MAX_ENTRY_LENGTH = 1000;

function formatEntryTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  });
}

export default function ReflectionJournal({
  entries,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry
}) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [draft, setDraft] = useState('');
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [expandedEntryId, setExpandedEntryId] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const submissionLock = useRef(false);

  const currentPrompt = STATIC_REFLECTION_PROMPTS[promptIndex];
  const sortedEntries = [...entries].sort(
    (first, second) => new Date(second.createdAt) - new Date(first.createdAt)
  );
  const isEditing = editingEntryId !== null;

  const handleShowAnotherPrompt = () => {
    setPromptIndex((currentIndex) => (currentIndex + 1) % STATIC_REFLECTION_PROMPTS.length);
  };

  const handleDraftChange = (event) => {
    setDraft(event.target.value);
    setError('');
    setStatus('');
  };

  const handleClearDraft = () => {
    if (!draft) return;

    if (!window.confirm('Clear this unsaved reflection text?')) return;

    setDraft('');
    setError('');
    setStatus('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (submissionLock.current) return;

    const trimmedText = draft.trim();
    if (!trimmedText) {
      setError('Write a few words before saving your reflection.');
      setStatus('');
      return;
    }

    if (draft.length > MAX_ENTRY_LENGTH) {
      setError(`A reflection can be up to ${MAX_ENTRY_LENGTH} characters.`);
      setStatus('');
      return;
    }

    submissionLock.current = true;
    setIsSaving(true);
    setError('');

    try {
      if (isEditing) {
        const originalEntry = entries.find((entry) => entry.id === editingEntryId);
        if (!originalEntry) {
          setError('This reflection is no longer available. Your current text is still in the editor.');
          return;
        }

        onUpdateEntry({
          ...originalEntry,
          text: trimmedText,
          updatedAt: new Date().toISOString()
        });
        setStatus('Your reflection was updated.');
      } else {
        const now = new Date().toISOString();
        onAddEntry({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          date: getTodayDateString(),
          createdAt: now,
          updatedAt: now,
          text: trimmedText
        });
        setStatus('Your reflection was saved for this session.');
      }

      setDraft('');
      setEditingEntryId(null);
      setExpandedEntryId(null);
    } finally {
      submissionLock.current = false;
      setIsSaving(false);
    }
  };

  const handleEditEntry = (entry) => {
    setDraft(entry.text);
    setEditingEntryId(entry.id);
    setExpandedEntryId(entry.id);
    setError('');
    setStatus(`Editing reflection from ${formatDisplayDate(entry.date)}.`);
    document.getElementById('journal-entry-text')?.focus();
  };

  const handleCancelEditing = () => {
    if (draft && !window.confirm('Discard your unsaved changes to this reflection?')) return;

    setDraft('');
    setEditingEntryId(null);
    setError('');
    setStatus('');
  };

  const handleDeleteEntry = (entry) => {
    if (!window.confirm(`Delete the reflection from ${formatDisplayDate(entry.date)}? This cannot be undone.`)) return;

    onDeleteEntry(entry.id);
    if (expandedEntryId === entry.id) setExpandedEntryId(null);
    if (editingEntryId === entry.id) {
      setDraft('');
      setEditingEntryId(null);
    }
    setError('');
    setStatus('Reflection deleted from this session.');
  };

  const handleToggleEntry = (entryId) => {
    setExpandedEntryId((currentId) => currentId === entryId ? null : entryId);
  };

  return (
    <section className="reflection-journal" aria-labelledby="journal-heading">
      <div className="reflection-journal__header">
        <div>
          <h2 id="journal-heading">Reflection Journal</h2>
          <p>Write at your own pace. You can keep more than one reflection for a day.</p>
        </div>
        <span className="badge badge-demo">Session only</span>
      </div>

      <div className="reflection-journal__privacy" role="note">
        <strong>Your privacy:</strong> Entries stay in this page session and are cleared when you refresh or close the page. They are not sent to AI or other external services, and are not monitored by staff or counsellors. Anyone with access to this open page or an unlocked device may be able to read them.
      </div>

      <div className="card reflection-journal__editor">
        <div className="reflection-journal__prompt">
          <div>
            <span className="reflection-journal__eyebrow">A gentle prompt</span>
            <p>{currentPrompt.prompt}</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary reflection-journal__prompt-button"
            onClick={handleShowAnotherPrompt}
            aria-label="Show another reflection prompt"
          >
            Another prompt
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <label className="reflection-journal__label" htmlFor="journal-entry-text">
            Your reflection
          </label>
          <textarea
            id="journal-entry-text"
            className="textarea-field reflection-journal__textarea"
            value={draft}
            onChange={handleDraftChange}
            maxLength={MAX_ENTRY_LENGTH}
            rows={6}
            placeholder="Write whatever feels useful to you. You do not have to answer the prompt."
            aria-describedby="journal-character-count journal-message"
            aria-invalid={Boolean(error)}
          />

          <div className="reflection-journal__editor-footer">
            <span
              id="journal-character-count"
              className="reflection-journal__counter"
              aria-live="polite"
            >
              {draft.length} / {MAX_ENTRY_LENGTH} characters
            </span>
            <div className="reflection-journal__actions">
              {isEditing && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleCancelEditing}
                  disabled={isSaving}
                >
                  <X size={16} aria-hidden="true" />
                  Cancel edit
                </button>
              )}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleClearDraft}
                disabled={!draft || isSaving}
              >
                Clear text
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving || draft.length > MAX_ENTRY_LENGTH}
              >
                <Save size={16} aria-hidden="true" />
                {isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Save reflection'}
              </button>
            </div>
          </div>

          <p
            id="journal-message"
            className={`reflection-journal__message ${error ? 'is-error' : ''}`}
            role={error ? 'alert' : 'status'}
            aria-live={error ? 'assertive' : 'polite'}
          >
            {error || status}
          </p>
        </form>
      </div>

      <section className="reflection-journal__entries" aria-labelledby="journal-entries-heading">
        <div className="reflection-journal__entries-heading">
          <h3 id="journal-entries-heading">Previous reflections</h3>
          <span>{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
        </div>

        {sortedEntries.length === 0 ? (
          <div className="reflection-journal__empty card">
            <BookOpen size={24} aria-hidden="true" />
            <p>Your saved reflections will appear here. Start whenever you feel ready.</p>
          </div>
        ) : (
          <ul className="reflection-journal__list">
            {sortedEntries.map((entry) => {
              const isExpanded = expandedEntryId === entry.id;
              const isEntryBeingEdited = editingEntryId === entry.id;

              return (
                <li className="card reflection-journal__entry" key={entry.id}>
                  <div className="reflection-journal__entry-top">
                    <div className="reflection-journal__entry-date">
                      <CalendarDays size={17} aria-hidden="true" />
                      <div>
                        <h4>{formatDisplayDate(entry.date)}</h4>
                        <span>
                          {formatEntryTime(entry.createdAt)}
                          {entry.updatedAt !== entry.createdAt ? ' · Edited' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="reflection-journal__entry-actions">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => handleToggleEntry(entry.id)}
                        aria-expanded={isExpanded}
                        aria-controls={`journal-entry-content-${entry.id}`}
                      >
                        {isExpanded ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
                        {isExpanded ? 'Close' : 'Read'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => handleEditEntry(entry)}
                        aria-label={`Edit reflection from ${formatDisplayDate(entry.date)}`}
                      >
                        <Edit3 size={16} aria-hidden="true" />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost reflection-journal__delete"
                        onClick={() => handleDeleteEntry(entry)}
                        aria-label={`Delete reflection from ${formatDisplayDate(entry.date)}`}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div
                      className="reflection-journal__entry-content"
                      id={`journal-entry-content-${entry.id}`}
                      tabIndex={-1}
                    >
                      {isEntryBeingEdited
                        ? 'This reflection is open in the editor above.'
                        : entry.text}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </section>
  );
}
