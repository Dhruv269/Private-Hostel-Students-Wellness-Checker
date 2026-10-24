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
  Info,
  Mic,
  MicOff,
  Square,
  X,
  Volume2,
  Play
} from 'lucide-react';
import { CHAT_API_URL, BACKEND_DISPLAY_LABEL } from '../../utils/apiConfig';

const BACKEND_CHAT_URL = CHAT_API_URL;

// Browser Web Speech API detection (speech-to-text)
const SpeechRecognitionAPI = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition || null)
  : null;
const isSpeechSupported = Boolean(SpeechRecognitionAPI);

// Browser SpeechSynthesis detection (text-to-speech)
const isSpeechSynthesisSupported = 
  typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

function generateMessageId(prefix) {
  return `${prefix}-${Date.now()}`;
}

function getMessageTimestamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Selects the best natural default voice from the system voice list,
 * prioritizing Indian English (en-IN), then US (en-US), then British (en-GB).
 * Never assumes a specific named voice exists.
 * 
 * @param {Array<SpeechSynthesisVoice>} voiceList
 * @returns {SpeechSynthesisVoice|null}
 */
function findBestDefaultVoice(voiceList) {
  if (!voiceList || voiceList.length === 0) return null;

  // 1. Prioritize Indian English (en-IN)
  const indianEnglish = voiceList.find((v) => {
    const lang = (v.lang || '').toLowerCase().replace('_', '-');
    return lang === 'en-in' || lang.startsWith('en-in');
  });
  if (indianEnglish) return indianEnglish;

  // 2. Prioritize US English (en-US)
  const usEnglish = voiceList.find((v) => {
    const lang = (v.lang || '').toLowerCase().replace('_', '-');
    return lang === 'en-us' || lang.startsWith('en-us');
  });
  if (usEnglish) return usEnglish;

  // 3. Prioritize British English (en-GB)
  const gbEnglish = voiceList.find((v) => {
    const lang = (v.lang || '').toLowerCase().replace('_', '-');
    return lang === 'en-gb' || lang.startsWith('en-gb');
  });
  if (gbEnglish) return gbEnglish;

  // 4. Any English voice
  const anyEnglish = voiceList.find((v) => (v.lang || '').toLowerCase().startsWith('en'));
  if (anyEnglish) return anyEnglish;

  // 5. System default voice or first voice in list
  return voiceList.find((v) => v.default) || voiceList[0];
}

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

  // Voice input (Speech-to-Text) state & refs
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [speechStatusMessage, setSpeechStatusMessage] = useState('');
  const recognitionRef = useRef(null);
  const initialTextBeforeSpeechRef = useRef('');

  // Voice playback (Text-to-Speech) state & refs
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [speakingRate, setSpeakingRate] = useState(0.9);
  const activeUtteranceRef = useRef(null);
  const userManuallySelectedVoiceRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, errorMessage]);

  // Load and subscribe to system voices for SpeechSynthesis
  useEffect(() => {
    if (!isSpeechSynthesisSupported) return;

    const loadVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices() || [];
        if (voices.length > 0) {
          // Sort voices: en-IN first, then other English, then alphabetical by name
          const sorted = [...voices].sort((a, b) => {
            const langA = (a.lang || '').toLowerCase().replace('_', '-');
            const langB = (b.lang || '').toLowerCase().replace('_', '-');
            const aIsEnIn = langA === 'en-in' || langA.startsWith('en-in');
            const bIsEnIn = langB === 'en-in' || langB.startsWith('en-in');
            if (aIsEnIn && !bIsEnIn) return -1;
            if (!aIsEnIn && bIsEnIn) return 1;

            const aIsEn = langA.startsWith('en');
            const bIsEn = langB.startsWith('en');
            if (aIsEn && !bIsEn) return -1;
            if (!aIsEn && bIsEn) return 1;

            return (a.name || '').localeCompare(b.name || '');
          });

          setAvailableVoices(sorted);

          // Select best default voice if user hasn't explicitly picked one
          setSelectedVoiceURI((currentURI) => {
            if (userManuallySelectedVoiceRef.current && currentURI && sorted.some((v) => v.voiceURI === currentURI)) {
              return currentURI;
            }
            const defaultVoice = findBestDefaultVoice(sorted);
            return defaultVoice ? defaultVoice.voiceURI : (sorted[0]?.voiceURI || '');
          });
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn('[HostelWell Voice] Failed to load speech synthesis voices:', err);
        }
      }
    };

    loadVoices();

    if (window.speechSynthesis.addEventListener) {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    }
    const prevOnVoicesChanged = window.speechSynthesis.onvoiceschanged;
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (window.speechSynthesis.removeEventListener) {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      }
      window.speechSynthesis.onvoiceschanged = prevOnVoicesChanged;
    };
  }, []);

  // Clean up active speech recognition and speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore abort on unmount
        }
      }
      if (isSpeechSynthesisSupported) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // Ignore cancel on unmount
        }
      }
    };
  }, []);

  /**
   * Starts speech-to-text recognition using the browser's Web Speech API.
   * Transcribed words are placed into the textarea for user review and editing.
   * Recognized speech is NEVER automatically submitted.
   */
  const startListening = () => {
    if (!isSpeechSupported) {
      setSpeechError('Voice input is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Apple Safari.');
      return;
    }

    setSpeechError(null);
    setSpeechStatusMessage('Listening... Speak your reflection clearly.');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore
      }
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-IN';
      recognition.maxAlternatives = 1;

      // Stash current text to allow appending spoken thoughts naturally
      initialTextBeforeSpeechRef.current = inputText;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        setSpeechStatusMessage('Listening... Speak your reflection clearly.');
        if (import.meta.env.DEV) {
          console.log('[HostelWell Voice] Speech recognition started');
        }
      };

      recognition.onresult = (event) => {
        let accumulatedTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          accumulatedTranscript += event.results[i][0].transcript + ' ';
        }
        accumulatedTranscript = accumulatedTranscript.trim();

        const prefix = initialTextBeforeSpeechRef.current.trim();
        const combined = prefix 
          ? `${prefix} ${accumulatedTranscript}` 
          : accumulatedTranscript;

        // Populate textarea without auto-submitting (user reviews and edits before sending)
        setInputText(combined.slice(0, 1000));
        setSpeechStatusMessage('Transcribing your speech...');
      };

      recognition.onerror = (event) => {
        if (import.meta.env.DEV) {
          console.warn('[HostelWell Voice] Speech error event:', event.error);
        }
        setIsListening(false);
        setSpeechStatusMessage('');

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setSpeechError('Microphone permission was denied. Please allow microphone access in your browser address bar.');
        } else if (event.error === 'no-speech') {
          setSpeechError('No speech was detected. Click the microphone again and speak clearly.');
        } else if (event.error === 'audio-capture') {
          setSpeechError('No microphone detected. Please check that your audio input device is connected.');
        } else if (event.error === 'network') {
          setSpeechError('Speech recognition network error. Please verify your internet connection.');
        } else if (event.error !== 'aborted') {
          setSpeechError(`Voice input error (${event.error}). Please try again.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setSpeechStatusMessage('');
        if (import.meta.env.DEV) {
          console.log('[HostelWell Voice] Speech recognition finished');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[HostelWell Voice] Start failed:', err);
      }
      setIsListening(false);
      setSpeechStatusMessage('');
      setSpeechError('Could not start microphone listening. Please verify browser permissions.');
    }
  };

  /**
   * Stops active speech recognition and preserves all transcribed text in the input.
   */
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
    setIsListening(false);
    setSpeechStatusMessage('');
  };

  /**
   * Stops active speech playback and resets the button state.
   */
  const stopSpeaking = () => {
    activeUtteranceRef.current = null;
    if (isSpeechSynthesisSupported) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore cancel errors
      }
    }
    setPlayingMessageId(null);
    setIsPreviewing(false);
  };

  /**
   * Updates user's voice preference for subsequent speech synthesis.
   */
  const handleVoiceChange = (e) => {
    userManuallySelectedVoiceRef.current = true;
    setSelectedVoiceURI(e.target.value);
    stopSpeaking();
  };

  /**
   * Updates speech playback speed (0.8x, 0.9x, 1.0x, 1.1x).
   */
  const handleRateChange = (e) => {
    setSpeakingRate(parseFloat(e.target.value));
    stopSpeaking();
  };

  /**
   * Plays a brief sample voice preview using the chosen voice and rate.
   * Stops immediately if clicked while playing.
   */
  const handleTogglePreview = () => {
    if (!isSpeechSynthesisSupported) return;

    if (isPreviewing) {
      stopSpeaking();
      return;
    }

    stopSpeaking();

    const sampleText = "Hello! I am HostelWell. I am here to listen whenever you need a moment to reflect.";
    try {
      const utterance = new SpeechSynthesisUtterance(sampleText);
      const chosenVoice = availableVoices.find((v) => v.voiceURI === selectedVoiceURI) || findBestDefaultVoice(availableVoices);
      if (chosenVoice) {
        utterance.voice = chosenVoice;
        utterance.lang = chosenVoice.lang || 'en-IN';
      } else {
        utterance.lang = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-IN';
      }
      utterance.rate = speakingRate;
      utterance.pitch = 1.0;

      activeUtteranceRef.current = utterance;

      utterance.onstart = () => {
        setIsPreviewing(true);
      };

      utterance.onend = () => {
        activeUtteranceRef.current = null;
        setIsPreviewing(false);
      };

      utterance.onerror = (event) => {
        activeUtteranceRef.current = null;
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          if (import.meta.env.DEV) {
            console.warn('[HostelWell Voice] Preview error:', event.error);
          }
        }
        setIsPreviewing(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[HostelWell Voice] Failed to start preview playback:', err);
      }
      stopSpeaking();
    }
  };

  /**
   * Toggles speech playback for a specific assistant message.
   * Only speaks when explicitly clicked by the user (never autoplays).
   * Automatically stops any previous speech before starting a new one to prevent voice overlap.
   * 
   * @param {string} messageId - The unique ID of the message
   * @param {string} textToSpeak - Plain text content to read aloud
   */
  const handleToggleSpeak = (messageId, textToSpeak) => {
    if (!isSpeechSynthesisSupported) return;

    // If currently speaking this message, clicking again acts as a stop control
    if (playingMessageId === messageId) {
      stopSpeaking();
      return;
    }

    // Always stop any prior speech first so voices NEVER overlap
    stopSpeaking();

    if (!textToSpeak || !textToSpeak.trim()) return;

    try {
      // Speak only the visible assistant reply text
      const utterance = new SpeechSynthesisUtterance(textToSpeak.trim());
      
      const chosenVoice = availableVoices.find((v) => v.voiceURI === selectedVoiceURI) || findBestDefaultVoice(availableVoices);
      if (chosenVoice) {
        utterance.voice = chosenVoice;
        utterance.lang = chosenVoice.lang || 'en-IN';
      } else {
        utterance.lang = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-IN';
      }

      utterance.rate = speakingRate;
      utterance.pitch = 1.0;

      // Keep ref to avoid garbage collection bug in Chromium
      activeUtteranceRef.current = utterance;

      utterance.onstart = () => {
        setPlayingMessageId(messageId);
        if (import.meta.env.DEV) {
          console.log('[HostelWell Voice] Speech playback started for message:', messageId);
        }
      };

      utterance.onend = () => {
        activeUtteranceRef.current = null;
        setPlayingMessageId((current) => (current === messageId ? null : current));
        if (import.meta.env.DEV) {
          console.log('[HostelWell Voice] Speech playback ended for message:', messageId);
        }
      };

      utterance.onerror = (event) => {
        activeUtteranceRef.current = null;
        // Suppress benign abort/canceled errors when user clicks stop
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          if (import.meta.env.DEV) {
            console.warn('[HostelWell Voice] Speech playback error:', event.error);
          }
        }
        setPlayingMessageId((current) => (current === messageId ? null : current));
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[HostelWell Voice] Failed to start speech playback:', err);
      }
      stopSpeaking();
    }
  };

  /**
   * Sends the user's message to the backend Gemma chat API.
   * 
   * @param {string|unknown} textToSend - The message content (string), or event if called directly
   */
  const handleSendMessage = async (textToSend) => {
    // Stop voice listening or playback if active when sending
    if (isListening) {
      stopListening();
    }
    stopSpeaking();

    // Safely extract string message whether triggered from input, starter pill, or retry
    const messageContent = typeof textToSend === 'string' ? textToSend : inputText;
    const trimmed = (messageContent || '').trim();
    if (!trimmed || isLoading) return;

    // Reset error state
    setErrorMessage(null);

    // Create user message object
    const userMessage = {
      id: generateMessageId('user'),
      role: 'user',
      content: trimmed,
      timestamp: getMessageTimestamp()
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
            errorDetail = 'CORS blocked: The server did not authorize this browser origin.';
          } else if (response.status === 404) {
            errorDetail = `Endpoint not found at ${CHAT_API_URL}.`;
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
        id: generateMessageId('assistant'),
        role: 'assistant',
        content: data.reply.trim(),
        model: data.model || 'gemma-4-26b-a4b-it',
        safetyAlert: Boolean(data.safetyAlert),
        resources: Array.isArray(data.resources) ? data.resources : null,
        timestamp: getMessageTimestamp()
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[HostelWell Chat] Error during chat request:', err.message);
      }

      let displayError = err.message || 'Unable to communicate with the backend.';
      // Provide clear guidance for browser network failures (e.g. CORS block or offline backend)
      if (err.name === 'TypeError' && err.message?.toLowerCase().includes('fetch')) {
        displayError = `Unable to connect to ${CHAT_API_URL}. Please ensure the backend server is running and CORS is authorized.`;
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
    if (isListening) {
      stopListening();
    }
    stopSpeaking();
    setSpeechError(null);
    setSpeechStatusMessage('');
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
                  {BACKEND_DISPLAY_LABEL}
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

        {/* Voice Playback Configuration Bar */}
        {isSpeechSynthesisSupported ? (
          <div className="voice-settings-bar" aria-label="Spoken reply voice settings">
            <div className="voice-settings-group voice-settings-main">
              <Volume2 size={15} className="voice-settings-icon" aria-hidden="true" />
              <label htmlFor="tts-voice-select" className="voice-settings-label">
                Voice:
              </label>
              {availableVoices.length > 0 ? (
                <select
                  id="tts-voice-select"
                  className="voice-select-field"
                  value={selectedVoiceURI}
                  onChange={handleVoiceChange}
                  aria-label="Select speech voice for AI replies"
                >
                  {availableVoices.map((voice) => (
                    <option key={voice.voiceURI || `${voice.name}-${voice.lang}`} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="voice-status-fallback" role="status">
                  Loading system voices... (text chat ready)
                </span>
              )}
            </div>

            <div className="voice-settings-group voice-settings-controls">
              <label htmlFor="tts-speed-select" className="voice-settings-label">
                Speed:
              </label>
              <select
                id="tts-speed-select"
                className="voice-speed-field"
                value={speakingRate}
                onChange={handleRateChange}
                aria-label="Select speech playback rate"
              >
                <option value={0.8}>0.8x</option>
                <option value={0.9}>0.9x</option>
                <option value={1.0}>1.0x</option>
                <option value={1.1}>1.1x</option>
              </select>

              <button
                type="button"
                className={`btn btn-preview-voice ${isPreviewing ? 'btn-preview-playing' : ''}`}
                onClick={handleTogglePreview}
                disabled={availableVoices.length === 0}
                aria-label={isPreviewing ? "Stop voice sample playback" : "Preview selected voice"}
                aria-pressed={isPreviewing}
                title={isPreviewing ? "Stop voice preview" : "Hear a sample of the selected voice and speed"}
              >
                {isPreviewing ? (
                  <>
                    <Square size={12} aria-hidden="true" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Play size={12} aria-hidden="true" />
                    <span>Preview Voice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="voice-settings-bar voice-settings-unsupported" role="note">
            <Volume2 size={14} className="voice-settings-icon" aria-hidden="true" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Text-to-speech voice playback is not supported in this browser. Text reflection chat remains fully functional.
            </span>
          </div>
        )}

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
      <div className="chat-messages-container" data-lenis-prevent role="log" aria-live="polite">
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
                    <div className="chat-safety-resources-title">
                      Verified Free 24/7 Helplines (India):
                    </div>
                    <div className="chat-safety-links-stack">
                      <a href="tel:14416" className="chat-resource-link">
                        <PhoneCall size={14} aria-hidden="true" />
                        <span><strong>Tele-MANAS:</strong> Call 14416 (Govt 24/7 Toll-Free)</span>
                      </a>
                      <a href="tel:18005990019" className="chat-resource-link">
                        <PhoneCall size={14} aria-hidden="true" />
                        <span><strong>KIRAN:</strong> Call 1800-599-0019 (Mental Health)</span>
                      </a>
                      <a href="tel:112" className="chat-resource-link chat-resource-link-emergency">
                        <PhoneCall size={14} aria-hidden="true" />
                        <span><strong>Emergency:</strong> Call 112 (National Police/Ambulance)</span>
                      </a>
                    </div>
                    {setActiveTab && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('support')}
                        className="btn btn-ghost chat-safety-directory-btn"
                      >
                        View Full Support Directory →
                      </button>
                    )}
                  </div>
                )}

                {/* Metadata timestamp, model badge, and Listen button */}
                <div className="chat-bubble-meta">
                  <div className="chat-bubble-meta-info">
                    <span>{msg.timestamp}</span>
                    {!isUser && msg.model && (
                      <span>• {msg.model}</span>
                    )}
                  </div>

                  {/* Optional Voice Playback for Assistant Replies (Never on user messages) */}
                  {!isUser && isSpeechSynthesisSupported && (
                    <button
                      type="button"
                      className={`btn-tts-listen ${playingMessageId === msg.id ? 'btn-tts-playing' : ''}`}
                      onClick={() => handleToggleSpeak(msg.id, msg.content)}
                      aria-label={playingMessageId === msg.id ? "Stop reading reply aloud" : "Listen to reply aloud"}
                      aria-pressed={playingMessageId === msg.id}
                      title={playingMessageId === msg.id ? "Stop reading reply" : "Listen to reply aloud (Text-to-Speech)"}
                    >
                      {playingMessageId === msg.id ? (
                        <>
                          <Square size={11} aria-hidden="true" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={12} aria-hidden="true" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
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
            <div className="chat-avatar chat-avatar-error" aria-hidden="true">
              <AlertTriangle size={16} />
            </div>
            <div className="chat-bubble chat-bubble-assistant chat-bubble-error">
              <div className="chat-error-title">
                <AlertTriangle size={15} />
                <span>Response Interrupted</span>
              </div>
              <div className="chat-bubble-text">
                {errorMessage}
              </div>
              {lastUserMessage && (
                <div style={{ marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleSendMessage(lastUserMessage)}
                    disabled={isLoading}
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
              className="btn btn-secondary btn-sm"
              onClick={() => handleSendMessage(lastUserMessage)}
              disabled={isLoading}
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Suggested Starter Pills (Displayed only when conversation is fresh) */}
      {messages.length === 1 && !isLoading && (
        <div className="chat-starters-section">
          <span className="chat-starters-heading">
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
          {/* Active Voice Listening Banner */}
          {isListening && (
            <div className="voice-listening-indicator" role="status" aria-live="polite">
              <div className="voice-listening-left">
                <span className="voice-listening-dot" aria-hidden="true" />
                <span className="voice-listening-text">
                  {speechStatusMessage || 'Listening... Speak your reflection. Tap Stop when finished.'}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-ghost voice-stop-btn"
                onClick={stopListening}
                aria-label="Stop microphone listening"
              >
                <Square size={12} style={{ marginRight: '0.25rem' }} aria-hidden="true" />
                Stop
              </button>
            </div>
          )}

          {/* Voice Error Notification */}
          {speechError && (
            <div className="voice-error-banner" role="alert">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MicOff size={15} style={{ color: 'var(--color-stress)', flexShrink: 0 }} aria-hidden="true" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{speechError}</span>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setSpeechError(null)}
                style={{ padding: '0.2rem 0.4rem', color: 'var(--text-muted)' }}
                aria-label="Dismiss microphone alert"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          )}

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
            placeholder={
              isListening
                ? "Listening... Your spoken words will appear here for review."
                : "Share how you're feeling, or what happened today... (Press Enter to send)"
            }
            rows={2}
            maxLength={1000}
            disabled={isLoading}
          />

          <div className="chat-input-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {inputText.length} / 1000
              </span>
              {!isSpeechSupported && (
                <span className="voice-unsupported-note" title="Web Speech API is supported in Google Chrome, Microsoft Edge, and Apple Safari">
                  (Voice: Chrome/Edge/Safari)
                </span>
              )}
            </div>

            <div className="chat-input-buttons">
              {/* Voice Speech-to-Text Button */}
              <button
                type="button"
                className={`btn btn-mic ${isListening ? 'btn-mic-active' : ''}`}
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading || !isSpeechSupported}
                title={
                  !isSpeechSupported
                    ? 'Voice input is not supported in this browser (supported in Chrome, Edge, and Safari)'
                    : isListening
                      ? 'Stop microphone listening'
                      : 'Speak your reflection (Speech-to-Text)'
                }
                aria-label={
                  !isSpeechSupported
                    ? 'Voice input not supported in this browser'
                    : isListening
                      ? 'Stop microphone listening'
                      : 'Start voice input'
                }
                aria-pressed={isListening}
              >
                {isListening ? (
                  <>
                    <Square size={14} aria-hidden="true" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Mic size={15} aria-hidden="true" />
                    <span>Voice</span>
                  </>
                )}
              </button>

              {/* Text Send Button */}
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
        </div>
      </form>
    </div>
  );
}
