/**
 * WellnessChat.jsx - AI Text Chat Interface for Hostel Students
 * 
 * HOW THIS COMPONENT WORKS:
 * 1. Conversation State:
 *    - Maintains a local `messages` array in React memory (`useState`).
 *    - Pre-seeded with a warm, welcoming greeting from HostelWell.
 * 2. API Communication:
 *    - Sends user reflection messages to the local Express backend (`POST http://localhost:5002/api/chat`).
 *    - Strictly formats payload as `{ messages: [{ role: 'user'|'assistant', content: string }] }`.
 *    - Caps context history to the last 10 messages to respect server boundaries.
 * 3. Safe Rendering & Non-Clinical Guardrails:
 *    - Renders all replies as plain, safe text (no raw HTML injection).
 *    - If `safetyAlert: true` is returned (acute crisis signal detected by server safety filter),
 *      prominently renders verified 24/7 Indian crisis contacts with 1-tap dialing links.
 * 4. Error & Retry Handling:
 *    - Catches network timeouts, offline states, and non-200 HTTP responses.
 *    - Displays friendly, sanitized error alerts with an instant "Retry" button.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  RotateCcw, 
  AlertTriangle, 
  PhoneCall, 
  Info
} from 'lucide-react';

const BACKEND_CHAT_URL = 'http://localhost:5002/api/chat';

// Suggested reflection prompts for students who want a starting point
const SUGGESTED_PROMPTS = [
  "Feeling overwhelmed by upcoming exams and syllabus coverage.",
  "My hostel room feels cramped and noisy tonight.",
  "Missing home and feeling tired of hostel mess food.",
  "Had a frustrating misunderstanding with my roommate."
];

const INITIAL_WELCOME_MESSAGE = {
  id: 'welcome-msg',
  role: 'assistant',
  content: "Hi there! I'm HostelWell, your companion for moments of quiet reflection away from the bustle of hostel life. Whether you're navigating exam pressure, roommate dynamics, erratic sleep, or homesickness, I'm here to listen without judgment.\n\nHow is hostel life treating you today?",
  model: 'gemma-4-26b-a4b-it',
  safetyAlert: false,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

export default function WellnessChat({ setActiveTab }) {
  // In-memory conversation history
  const [messages, setMessages] = useState([INITIAL_WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [lastUserMessage, setLastUserMessage] = useState(null);

  // Auto-scroll ref to keep the latest message visible
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, errorMessage]);

  /**
   * Sends the user's message to the backend Gemma chat API.
   * 
   * @param {string|unknown} textToSend - The message content (string), or event if called directly
   */
  const handleSendMessage = async (textToSend) => {
    // Safely extract string message whether triggered from input, starter pill, or retry
    const messageContent = typeof textToSend === 'string' ? textToSend : inputText;
    const trimmed = (messageContent || '').trim();
    if (!trimmed || isLoading) return;

    // Reset error state
    setErrorMessage(null);

    // Create user message object
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Stash for one-click retry if the network call fails
    setLastUserMessage(trimmed);

    // Optimistically append user message to local state
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputText('');
    setIsLoading(true);

    try {
      /**
       * Prepare message history for backend API:
       * 1. Filter out static initial welcome greeting (API multiturn conversation starts with 'user').
       * 2. Limit to at most the last 10 messages (server MAX_MESSAGES constraint).
       * 3. Ensure the sequence starts with 'user' and ends with 'user'.
       */
      const conversationalMessages = nextMessages
        .filter((m) => m.id !== 'welcome-msg' && (m.role === 'user' || m.role === 'assistant'))
        .map((m) => ({
          role: m.role,
          content: m.content
        }));

      // Slice the most recent messages (up to 10)
      let formattedHistory = conversationalMessages.slice(-10);

      // If trimming cut into an assistant message, ensure the first message starts with 'user'
      if (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
        formattedHistory = formattedHistory.slice(1);
      }

      // If somehow empty, fallback to the current user message
      if (formattedHistory.length === 0) {
        formattedHistory = [{ role: 'user', content: trimmed }];
      }

      // Development-only diagnostic logging: never logs API keys or private user reflection content
      if (import.meta.env.DEV) {
        console.log('[HostelWell Chat] Sending POST request to:', BACKEND_CHAT_URL);
        console.log('[HostelWell Chat] Conversation payload length:', formattedHistory.length);
      }

      const response = await fetch(BACKEND_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: formattedHistory })
      });

      // Development-only status logging
      if (import.meta.env.DEV) {
        console.log('[HostelWell Chat] Response received with status:', response.status, response.statusText);
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        let errorDetail = data?.error;
        if (!errorDetail) {
          if (response.status === 403) {
            errorDetail = 'CORS blocked: The server on port 5002 did not authorize this browser origin.';
          } else if (response.status === 404) {
            errorDetail = 'Endpoint not found at http://localhost:5002/api/chat.';
          } else if (response.status === 429) {
            errorDetail = 'Rate limit reached. Please pause a moment before checking in again.';
          } else if (response.status === 504) {
            errorDetail = 'The AI inference request timed out after 20 seconds. Please try again.';
          } else {
            errorDetail = `Server returned HTTP ${response.status}.`;
          }
        }
        throw new Error(errorDetail);
      }

      if (!data || !data.reply || typeof data.reply !== 'string' || !data.reply.trim()) {
        throw new Error('Received an empty reply from the wellness companion. Please try again.');
      }

      // Development-only response confirmation
      if (import.meta.env.DEV) {
        console.log('[HostelWell Chat] Received valid reply from model:', data.model, '| safetyAlert:', Boolean(data.safetyAlert));
      }

      // Append assistant's reply to the message history
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply.trim(),
        model: data.model || 'gemma-4-26b-a4b-it',
        safetyAlert: Boolean(data.safetyAlert),
        resources: Array.isArray(data.resources) ? data.resources : null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[HostelWell Chat] Error during chat request:', err.message);
      }

      let displayError = err.message || 'Unable to communicate with the backend.';
      // Provide clear guidance for browser network failures (e.g. CORS block or offline backend)
      if (err.name === 'TypeError' && err.message?.toLowerCase().includes('fetch')) {
        displayError = 'Unable to connect to http://localhost:5002/api/chat. Please ensure the backend server is running on port 5002 and CORS is authorized.';
      }

      setErrorMessage(displayError);
    } finally {
      setIsLoading(false);
      // Return focus to input for smooth keyboard experience
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  /**
   * Resets the conversation to the initial welcoming state.
   */
  const handleClearChat = () => {
    setMessages([INITIAL_WELCOME_MESSAGE]);
    setErrorMessage(null);
    setLastUserMessage(null);
    setInputText('');
  };

  /**
   * Keyboard handler: Submit on Enter (unless Shift+Enter is pressed for a new line)
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-page" aria-label="AI Wellness Chat">
      {/* Header Section */}
      <div className="chat-header-card">
        <div className="chat-header-top">
          <div className="chat-header-title">
            <div className="chat-avatar-icon" aria-hidden="true">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700 }}>
                HostelWell Reflection Companion
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                <span className="badge badge-live" style={{ fontSize: '0.7rem' }}>
                  ● Gemma MoE (gemma-4-26b-a4b-it)
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Local Port 5002
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleClearChat}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
            title="Start a fresh conversation"
          >
            <RotateCcw size={14} aria-hidden="true" />
            <span>Reset Chat</span>
          </button>
        </div>

        {/* Non-Clinical Ethical Disclosure */}
        <div className="chat-disclaimer-banner">
          <Info size={16} style={{ color: 'var(--color-primary-light)', flexShrink: 0, marginTop: '0.1rem' }} aria-hidden="true" />
          <p style={{ margin: 0, fontSize: '0.785rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            <strong>Private Self-Reflection:</strong> HostelWell is a supportive emotional processing tool, 
            <strong> not a doctor, therapist, or emergency response service</strong>. Messages are processed in temporary server memory and are never saved to a database.
          </p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="chat-messages-container" role="log" aria-live="polite">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSafety = Boolean(msg.safetyAlert);

          return (
            <article 
              key={msg.id} 
              className={`chat-message-row ${isUser ? 'chat-row-user' : 'chat-row-assistant'}`}
            >
              <div className="chat-avatar" aria-hidden="true">
                {isUser ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : isSafety ? 'chat-bubble-safety' : 'chat-bubble-assistant'}`}>
                {/* Safety Alert Header if crisis indicators were intercepted */}
                {isSafety && (
                  <div className="chat-safety-header">
                    <AlertTriangle size={18} style={{ color: 'var(--color-stress)', flexShrink: 0 }} aria-hidden="true" />
                    <strong>Immediate Support Guidance</strong>
                  </div>
                )}

                {/* Safe Text Content */}
                <div className="chat-bubble-text">
                  {msg.content}
                </div>

                {/* Emergency Hotline Resource Cards on Safety Trigger */}
                {isSafety && (
                  <div className="chat-safety-resources">
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fecdd3', marginBottom: '0.4rem' }}>
                      Verified Free 24/7 Helplines (India):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <a href="tel:14416" className="chat-resource-link">
                        <PhoneCall size={14} aria-hidden="true" />
                        <span><strong>Tele-MANAS:</strong> Call 14416 (Govt 24/7 Toll-Free)</span>
                      </a>
                      <a href="tel:18005990019" className="chat-resource-link">
                        <PhoneCall size={14} aria-hidden="true" />
                        <span><strong>KIRAN:</strong> Call 1800-599-0019 (Mental Health)</span>
                      </a>
                      <a href="tel:112" className="chat-resource-link" style={{ borderColor: 'var(--color-stress)' }}>
                        <PhoneCall size={14} aria-hidden="true" />
                        <span><strong>Emergency:</strong> Call 112 (National Police/Ambulance)</span>
                      </a>
                    </div>
                    {setActiveTab && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('support')}
                        className="btn btn-ghost"
                        style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#fda4af' }}
                      >
                        View Full Support Directory →
                      </button>
                    )}
                  </div>
                )}

                {/* Metadata timestamp & model badge */}
                <div className="chat-bubble-meta">
                  <span>{msg.timestamp}</span>
                  {!isUser && msg.model && (
                    <span>• {msg.model}</span>
                  )}
                </div>
              </div>
            </article>
          );
        })}

        {/* Loading / Thinking Indicator */}
        {isLoading && (
          <div className="chat-message-row chat-row-assistant" aria-label="HostelWell is reflecting">
            <div className="chat-avatar" aria-hidden="true">
              <Bot size={16} />
            </div>
            <div className="chat-bubble chat-bubble-assistant chat-typing-bubble">
              <span className="chat-typing-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                HostelWell is reflecting...
              </span>
            </div>
          </div>
        )}

        {/* Visible In-Flow Error Notification */}
        {errorMessage && (
          <div className="chat-message-row chat-row-assistant" role="alert">
            <div className="chat-avatar" style={{ background: 'var(--color-stress-bg)', color: 'var(--color-stress)', border: '1px solid var(--color-stress)' }} aria-hidden="true">
              <AlertTriangle size={16} />
            </div>
            <div className="chat-bubble chat-bubble-assistant" style={{ borderColor: 'var(--color-stress)', background: 'rgba(244, 63, 94, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#fda4af', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                <AlertTriangle size={15} />
                <span>Response Interrupted</span>
              </div>
              <div className="chat-bubble-text" style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                {errorMessage}
              </div>
              {lastUserMessage && (
                <div style={{ marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleSendMessage(lastUserMessage)}
                    disabled={isLoading}
                    style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
                  >
                    <RotateCcw size={13} style={{ marginRight: '0.35rem' }} />
                    Retry Message
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error & Retry Banner */}
      {errorMessage && (
        <div className="chat-error-banner" role="alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} style={{ color: 'var(--color-stress)', flexShrink: 0 }} aria-hidden="true" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              {errorMessage}
            </span>
          </div>

          {lastUserMessage && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleSendMessage(lastUserMessage)}
              disabled={isLoading}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Suggested Starter Pills (Displayed only when conversation is fresh) */}
      {messages.length === 1 && !isLoading && (
        <div className="chat-starters-section">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Common Hostel Reflections:
          </span>
          <div className="chat-starters-pills">
            {SUGGESTED_PROMPTS.map((promptText, idx) => (
              <button
                key={idx}
                type="button"
                className="chat-starter-btn"
                onClick={() => handleSendMessage(promptText)}
              >
                "{promptText}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form Area */}
      <form 
        className="chat-input-container" 
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
      >
        <div className="chat-input-wrapper">
          <label htmlFor="chat-textarea" className="sr-only">
            Share what is on your mind
          </label>
          <textarea
            id="chat-textarea"
            ref={inputRef}
            className="chat-textarea"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share how you're feeling, or what happened today... (Press Enter to send)"
            rows={2}
            maxLength={1000}
            disabled={isLoading}
          />

          <div className="chat-input-actions">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {inputText.length} / 1000
            </span>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !inputText.trim()}
              aria-label="Send reflection message"
              style={{ padding: '0.45rem 1rem' }}
            >
              <Send size={15} aria-hidden="true" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
