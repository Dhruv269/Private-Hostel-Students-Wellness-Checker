# HostelWell 🏡🌱
**A Privacy-Conscious Wellness Check-In & AI Reflection Companion for Hostel Students**

HostelWell is a web application designed specifically for college students living in shared and private hostels. Living away from home presents unique day-to-day challenges—academic deadlines, roommate dynamics, erratic sleep patterns, mess food fatigue, and homesickness. HostelWell provides an approachable, private space for daily wellness check-ins, visual trend tracking, guided reflection prompts, verified emergency resources, and an AI reflection companion powered by Google's hosted **Gemma** open models.

---

## 📋 Table of Contents
- [✨ Current Features](#-current-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [🏗️ System Architecture & Folder Structure](#️-system-architecture--folder-structure)
- [💾 Data Storage, Privacy & Boundaries](#-data-storage-privacy--boundaries)
- [⚙️ Prerequisites](#️-prerequisites)
- [📦 Installation & Setup](#-installation--setup)
- [🔐 Environment Configuration](#-environment-configuration)
- [🚀 Running the Application](#-running-the-application)
- [🤖 Gemma Model Integration](#-gemma-model-integration)
- [🎙️ Voice & Speech Capabilities](#️-voice--speech-capabilities)
- [📡 Backend API Reference](#-backend-api-reference)
  - [1. Health Check (`GET /api/health`)](#1-health-check-get-apihealth)
  - [2. Wellness Chat (`POST /api/chat`)](#2-wellness-chat-post-apichat)
- [🔒 Security, CORS & Rate Limiting](#-security-cors--rate-limiting)
- [🛡️ Safety Boundaries & Crisis Screening](#️-safety-boundaries--crisis-screening)
- [🔧 Troubleshooting](#-troubleshooting)
- [🧑‍💻 Development & Quality Commands](#-development--quality-commands)
- [📄 License](#-license)

---

## ✨ Current Features

### 1. Daily Student Wellness Check-In
- **Multi-Factor Ratings:** Log daily mood (5 options: *Great*, *Good*, *Okay*, *Low*, *Overwhelmed*), academic/life stress (1–5 scale: *Very Low* to *Extreme*), and physical/mental energy (1–5 scale: *Exhausted* to *High*).
- **Personal Notes:** Add an optional reflection note (up to 500 characters) about the day's experiences.
- **Dynamic Date Tracking:** Check-in dates evaluate dynamically against your local calendar day, updating status if kept open past midnight.

### 2. Wellness Dashboard
- **Daily Status Overview:** Immediately see whether today's check-in has been completed or is still pending.
- **Key Metrics & Rolling Averages:** Displays today's mood, stress, and energy alongside calculated 7-day rolling averages and check-in streak.
- **Quick-Access Action Buttons:** Direct shortcuts to start a check-in, review reflection prompts, or talk with the AI Companion.

### 3. History & Trend Analysis
- **Stress & Energy Variations:** Visual comparative bars tracking daily stress vs. energy levels.
- **Mood Distribution:** Breakdown of logged moods across recorded check-ins.
- **Chronological Timeline:** Detailed log entries clearly indicating what was recorded each day.
- **Synthetic Demo Data Identification:** Initial history is pre-seeded with 6 synthetic demo records (`isSynthetic: true`). The UI visibly badges these as **"Demo Record"** to distinguish them from check-ins you log during your active session.

### 4. Guided Reflection Prompts
- Pre-written, hostel-specific journaling and self-reflection prompts categorized by common focus areas:
  - Roommate dynamics and shared living boundaries.
  - Academic pressure and exam anxiety.
  - Sleep habits and irregular schedules.
  - Homesickness and adapting to living away from family.
  - Gratitude and small daily wins.

### 5. Verified Support Directory
- Immediate access to verified, free, 24/7 mental health and emergency helplines in India:
  - **Tele-MANAS:** `14416` or `1800-891-4416` (Govt. of India 24/7 Toll-Free Mental Health Support, 20+ languages).
  - **KIRAN Helpline:** `1800-599-0019` (Govt. of India Department of Empowerment of Persons with Disabilities).
  - **National Emergency Response System:** `112` (All-in-one Police, Fire, Ambulance).

### 6. Transparent Privacy Notice
- Clear non-clinical disclosure outlining the application's ethical boundaries, data lifecycle, and zero-retention architecture.

### 7. Gemma-Powered AI Companion with Voice
- **Empathetic Emotional Processing:** Secure Express backend querying Google's hosted `gemma-4-26b-a4b-it` model via the `@google/genai` SDK.
- **Voice Input (Speech-to-Text):** Dictate reflections using the browser's Web Speech API. Words are transcribed directly into the textarea for review and editing before sending. Speech is never submitted automatically.
- **Spoken AI Replies (Text-to-Speech):** Listen to any assistant reply on demand using the browser's native `SpeechSynthesis` API. Never autoplays.
- **Voice Customization & Speed Control:**
  - Automatically discovers available system voices with asynchronous loading support.
  - Prioritizes natural English voices (`en-IN` Indian English first, then `en-US` and `en-GB`).
  - Choose any detected voice and keep your preference throughout the session.
  - Select speech speeds: `0.8x`, `0.9x` (calibrated default), `1.0x`, and `1.1x` (pitch `1.0`).
  - **Preview Voice** button to test the selected voice and speed with a short sample phrase before reading long replies.
  - Automatic speech overlap prevention and instant stop on new message or chat reset.

### 8. Crisis Screening Layer
- Deterministic regex and keyword filter intercepting acute distress expressions before invoking the AI model, instantly returning verified emergency contacts.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** [React 19](https://react.dev/) (`^19.3.1`)
- **Build Tool & Dev Server:** [Vite 8](https://vitejs.dev/) (`^8.3.4`)
- **Styling:** Vanilla CSS with custom design tokens, glassmorphism, responsive CSS Grid, and Flexbox layouts (`src/styles/index.css`).
- **Icons:** [Lucide React](https://lucide.dev/) (`^1.61.0`)
- **Static Analysis & Linter:** [Oxlint](https://oxc.rs/) (`^1.88.0`)
- **Web Speech APIs:** Browser native `window.SpeechRecognition` / `webkitSpeechRecognition` (STT) and `window.speechSynthesis` (TTS).

### Backend
- **Runtime:** [Node.js](https://nodejs.org/) (v18.0.0 or higher; ES Modules)
- **Web Framework:** [Express](https://expressjs.com/) (`^4.21.2`)
- **AI SDK:** [@google/genai](https://www.npmjs.com/package/@google/genai) (`^2.31.0`) — official Google Gen AI SDK
- **CORS:** [cors](https://www.npmjs.com/package/cors) (`^2.8.5`)
- **Rate Limiting:** [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) (`^7.5.0`)
- **Configuration:** [dotenv](https://www.npmjs.com/package/dotenv) (`^16.4.7`)

---

## 🏗️ System Architecture & Folder Structure

```text
┌─────────────────────────────────────────────────────────────┐
│                 Frontend Client (Browser)                   │
│          React 19 + Vite (http://localhost:5173)            │
│                                                             │
│  ├─ Web Speech API (Microphone Dictation -> Textarea)       │
│  ├─ SpeechSynthesis API (Spoken AI Replies + Voice Selector)│
│  ├─ In-Memory React State (Dashboard, Check-ins, History)   │
│  └─ Chat UI (Transient conversation history capped at 10)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend Server (Node.js)                   │
│               Express (http://localhost:5002)               │
│                                                             │
│  ├─ Strict CORS (Whitelists CLIENT_URL + Vite dev ports)    │
│  ├─ Rate Limiter (30 requests / 15 min / IP)                │
│  ├─ Payload Limiter (max 50kb)                              │
│  ├─ Deterministic Crisis Safety Filter                      │
│  └─ aiService (@google/genai SDK + System Persona)          │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / Google Gen AI API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Google Hosted Gemma Open Model                  │
│                   gemma-4-26b-a4b-it                        │
└─────────────────────────────────────────────────────────────┘
```

### Repository Structure

```text
Private-Hostel-Students-Wellness-Checker/
├── index.html                   # HTML entrypoint with viewport & fonts
├── package.json                 # Frontend dependencies and scripts
├── vite.config.js               # Vite bundler configuration
├── src/
│   ├── main.jsx                 # React root renderer
│   ├── App.jsx                  # Main application shell & tab router
│   ├── App.css                  # Minimal app-level container styles
│   ├── index.css                # CSS entrypoint importing styles/index.css
│   ├── styles/
│   │   └── index.css            # Comprehensive design system & voice styles
│   ├── data/
│   │   └── mockData.js          # Mood definitions, scales, & 6 synthetic records
│   ├── utils/
│   │   └── dateUtils.js         # Dynamic date formatting & calculation helpers
│   └── components/
│       ├── layout/
│       │   ├── Navbar.jsx       # Header navigation bar with pending badge
│       │   └── Footer.jsx       # Accessible footer with crisis links
│       ├── dashboard/
│       │   └── Dashboard.jsx    # Metrics, rolling averages, & today's status
│       ├── checkin/
│       │   └── DailyCheckIn.jsx # Interactive 3-scale check-in form
│       ├── chat/
│       │   └── WellnessChat.jsx # AI Companion, voice input, voice playback
│       ├── history/
│       │   └── HistoryView.jsx  # Trends, mood breakdown, & timeline
│       ├── reflection/
│       │   └── ReflectionPrompts.jsx # Categorized student journal prompts
│       ├── resources/
│       │   └── SupportResources.jsx  # Verified 24/7 helpline cards
│       └── privacy/
│           └── PrivacyNotice.jsx     # Non-clinical & data privacy statement
└── server/
    ├── package.json             # Backend dependencies and scripts
    ├── .env.example             # Environment variable template
    ├── README.md                # Dedicated backend documentation
    └── src/
        ├── index.js             # Express app, CORS, rate limiter, & error handling
        ├── config.js            # Port, CORS, key validation, & Gemma model check
        ├── routes/
        │   ├── healthRoutes.js  # GET /api/health endpoint
        │   └── chatRoutes.js    # POST /api/chat endpoint
        ├── services/
        │   └── aiService.js     # @google/genai client invocation & timeout
        └── utils/
            ├── safetyFilter.js  # Deterministic crisis keyword screening
            └── systemPrompt.js  # Grounded, hostel-aware Gemma system persona
```

---

## 💾 Data Storage, Privacy & Boundaries

HostelWell is engineered with a strict **privacy-first, zero-retention boundary**:

| Component | Storage Mechanism | Persistence Lifecycle & Privacy Boundaries |
| :--- | :--- | :--- |
| **Check-In Logs** | React Component State (`useState` in `App.jsx`) | **In-Memory Only.** Check-ins exist only in the browser's active RAM. Refreshing the browser, navigating away, or closing the tab **resets all newly logged check-ins**. No database, disk file, or browser `localStorage` is used. |
| **Past History & Trends** | 6 Synthetic Demo Records (`src/data/mockData.js`) | **Demonstration Data.** Pre-seeded with 6 realistic past entries (`isSynthetic: true`) so students can preview visual trends immediately upon first opening the app. |
| **Chat Conversation** | React Memory in `WellnessChat.jsx` | **Ephemeral Session.** The chat interface holds the active conversation in React state, capped to the last 10 messages for context. Resetting the chat clears the session. |
| **Backend Chat Messages** | Transient Express Request Lifecycle | **Zero Server Storage.** Messages are processed in RAM to assemble the prompt for Gemma. The backend has **no database, no log files, and no persistent caches**. |
| **API Keys & Credentials** | Loaded via `dotenv` into `process.env` | **Server-Side Only.** `GEMINI_API_KEY` is never sent to the browser or embedded in client bundles. Protected from Git by `.gitignore`. |

### Important Privacy & Security Disclosures
- **Sensitive Wellness Data:** Check-in entries and personal notes reflect your private emotional state. Because data is stored in memory, do not rely on HostelWell as a permanent personal health journal.
- **Browser Speech-to-Text Privacy:** When using voice dictation via the browser's Web Speech API (`SpeechRecognition`), transcription is handled natively by your web browser. In some browsers (such as Google Chrome), audio is transmitted to the browser vendor's speech recognition servers in accordance with their privacy policies.
- **Third-Party AI Inference:** Chat messages sent to the AI Companion are transmitted via encrypted HTTPS through your local Express backend to Google's hosted Gemini API for Gemma model inference. Do not include passwords, academic registration numbers, or identifying personal information in reflection messages.
- **No User Accounts:** HostelWell currently does not implement user authentication, passwords, or tracking cookies.

---

## ⚙️ Prerequisites

Ensure you have the following installed before running the project:

1. **Node.js:** Version 18.0.0 or higher (verify with `node -v`).
2. **npm:** Version 9.0.0 or higher (verify with `npm -v`).
3. **Google AI Studio API Key:** A free API key from [Google AI Studio](https://aistudio.google.com/app/apikey) to query hosted Gemma models.

---

## 📦 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Dhruv269/Private-Hostel-Students-Wellness-Checker.git
cd Private-Hostel-Students-Wellness-Checker
```

### 2. Install frontend dependencies
From the repository root:
```bash
npm install
```

### 3. Install backend dependencies
Navigate to the `server/` directory and install:
```bash
cd server
npm install
cd ..
```

---

## 🔐 Environment Configuration

The backend requires a `server/.env` file to configure port settings, authorized origins, and your Google AI Studio credentials.

1. **Copy the example environment template:**
   ```bash
   cp server/.env.example server/.env
   ```

2. **Open `server/.env` and supply your actual Gemini API key:**
   ```ini
   # Server Port (Default is 5002 to avoid macOS AirPlay Receiver port 5000 collision)
   PORT=5002

   # Allowed Frontend Origin for CORS
   CLIENT_URL=http://localhost:5173

   # Google Gemini API Key for accessing hosted Gemma models
   GEMINI_API_KEY=your_actual_api_key_here

   # Gemma Model Identifier (Mandatory Gemma family model)
   GEMMA_MODEL_ID=gemma-4-26b-a4b-it
   ```

### Configuration Parameters

| Parameter | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5002` | Port on which the Express server listens. |
| `CLIENT_URL` | `http://localhost:5173` | Authorized frontend origin for CORS. |
| `GEMINI_API_KEY` | *(Empty)* | Private API key from Google AI Studio. |
| `GEMMA_MODEL_ID` | `gemma-4-26b-a4b-it` | Mandatory Gemma family model identifier. |

> **Security Rule:** Never commit `server/.env` or share your API key. It is automatically ignored by `.gitignore`.

---

## 🚀 Running the Application

To run the full stack locally, open **two separate terminal windows**:

### Terminal 1 — Frontend (Vite)
From the repository root:
```bash
npm run dev
```
- Available at: **`http://localhost:5173`** (or `http://localhost:5174` if port 5173 is occupied)
- Features instant Hot Module Replacement (HMR).

### Terminal 2 — Backend (Express)
From the repository root:
```bash
cd server
npm run dev
```
- Available at: **`http://localhost:5002`**
- Uses Node's built-in file watcher (`node --watch src/index.js`) to restart automatically when backend code changes.
- Alternatively, use `npm start` for standard execution without watch mode.

---

## 🤖 Gemma Model Integration

HostelWell is built exclusively around **Google's Gemma open models**. Non-Gemma model families (such as Gemini Pro, Llama, or GPT) are explicitly prohibited by project rules.

- **Active Model:** `gemma-4-26b-a4b-it` (Gemma 4 Mixture-of-Experts instruction-tuned model hosted on the Google Gen AI API).
- **Enforcement:** `server/src/config.js` verifies on server startup that `GEMMA_MODEL_ID` contains `"gemma"`. If an invalid model family is provided, the backend halts immediately with a clear error.
- **System Persona (`server/src/utils/systemPrompt.js`):** Instructs Gemma to act as a gentle, grounded hostel reflection companion. It focuses on practical hostel-scale coping strategies (having chai, washing one's face, taking a short corridor walk, opening a window) and avoids clinical diagnosis or toxic positivity.

---

## 🎙️ Voice & Speech Capabilities

HostelWell features accessible voice capabilities running directly through browser APIs without external audio processing services:

### 1. Voice Input (Speech-to-Text)
- **Activation:** Click the **"Voice"** microphone button beside the chat textarea.
- **Behavior:** Dictate your thoughts naturally. The browser transcribes your speech and places it into the textarea.
- **User Agency:** Voice transcription is **never automatically submitted**. You can read, edit, append, or delete your text before clicking Send.
- **Browser Compatibility:** Uses standard `SpeechRecognition` / `webkitSpeechRecognition`. Supported in Google Chrome, Microsoft Edge, and Apple Safari.

### 2. Spoken AI Replies (Text-to-Speech)
- **Activation:** Click the **"Listen"** button located in the metadata of any assistant message bubble.
- **Playback Control:** Clicking while playing acts as a **"Stop"** button. Speech immediately terminates if you send a new message or click "Reset Chat".
- **Zero Autoplay:** Replies are never spoken aloud without an explicit user click.

### 3. Voice Selection & Customization
- **System Voice Detection:** Automatically discovers available system voices using `window.speechSynthesis.getVoices()` and reacts to the `voiceschanged` event.
- **Intelligent Default:** Prioritizes natural Indian English (`en-IN`), followed by `en-US`, `en-GB`, and general English voices.
- **Voice Selector Dropdown:** Easily choose any system voice. Your choice is remembered for subsequent messages during your session.
- **Playback Speed Selector:** Choose from `0.8x`, `0.9x` (calibrated default), `1.0x`, or `1.1x` (with pitch fixed at `1.0`).
- **Preview Voice:** Click **"Preview Voice"** in the header to hear a short sample phrase with your selected voice and speed before reading long reflections.

---

## 📡 Backend API Reference

Base URL: `http://localhost:5002`

### 1. Health Check: `GET /api/health`
Verifies backend liveness, provider connectivity, configured model, and whether a valid API key is present.

- **Method:** `GET`
- **Headers:** None

#### Success Response (`200 OK`)
```json
{
  "status": "healthy",
  "timestamp": "2026-10-25T03:00:00.000Z",
  "provider": "google-genai",
  "model": "gemma-4-26b-a4b-it",
  "isConfigured": true
}
```
*(The `isConfigured` flag is `true` when a non-placeholder key is loaded; the API key itself is never revealed).*

#### Test with curl:
```bash
curl -s http://localhost:5002/api/health
```

---

### 2. Wellness Chat: `POST /api/chat`
Submits student reflection messages to the hosted Gemma companion.

- **Method:** `POST`
- **Headers:** `Content-Type: application/json`

#### Request Payload
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Feeling exhausted after back-to-back lectures and noisy hostel corridors."
    }
  ]
}
```

#### Field Specifications

| Field | Type | Required | Constraints |
| :--- | :--- | :--- | :--- |
| `messages` | Array of Objects | **Yes** | 1 to 10 messages. |
| `messages[i].role` | String | **Yes** | Must be `"user"` or `"assistant"`. Final message must be `"user"`. |
| `messages[i].content` | String | **Yes** | Non-empty string; max 1,000 characters per message. |

#### Standard Response (`200 OK`)
```json
{
  "reply": "It sounds like you've had a demanding day between your classes and the noise around your room...",
  "model": "gemma-4-26b-a4b-it",
  "safetyAlert": false
}
```

#### Crisis Screening Interception Response (`200 OK`)
If acute self-harm or crisis patterns are detected, the server bypasses Gemma inference and returns emergency resources:
```json
{
  "reply": "I hear how much pain and exhaustion you are carrying right now, but please know you do not have to be alone through this. HostelWell is only a reflection companion and cannot provide emergency help...",
  "model": "gemma-4-26b-a4b-it",
  "safetyAlert": true,
  "resources": [
    {
      "name": "Tele-MANAS (Govt of India 24/7 Mental Health)",
      "phone": "14416",
      "altPhone": "1800 891 4416",
      "cost": "Free & Toll-Free",
      "languages": "20+ Indian Languages"
    },
    {
      "name": "KIRAN Mental Health Helpline (Govt of India)",
      "phone": "1800-599-0019",
      "cost": "Free & Toll-Free",
      "languages": "Hindi, English, and regional languages"
    },
    {
      "name": "National Emergency Response System",
      "phone": "112",
      "cost": "Free Emergency Toll-Free",
      "languages": "Nationwide All-in-One Emergency"
    }
  ]
}
```

#### Error Codes

| Status Code | Reason | Description |
| :--- | :--- | :--- |
| `400 Bad Request` | Validation failure | Missing `messages` array, invalid roles, or message exceeding 1,000 characters. |
| `403 Forbidden` | CORS rejected | Request originated from an unauthorized web origin. |
| `429 Too Many Requests` | Rate limit exceeded | IP exceeded 30 requests within 15 minutes. |
| `503 Service Unavailable` | Unconfigured key | `GEMINI_API_KEY` is missing or contains placeholder text. |
| `504 Gateway Timeout` | Upstream timeout | Google Gen AI request took longer than 20 seconds. |

#### Test with curl:
```bash
curl -X POST http://localhost:5002/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Had a long day studying in the hostel."}]}'
```

---

## 🔒 Security, CORS & Rate Limiting

- **Zero Secret Exposure:** `GEMINI_API_KEY` is kept exclusively on the server and is never passed to frontend bundles.
- **Dynamic CORS Policy:** Whitelists the configured `CLIENT_URL` as well as local Vite development ports (`http://localhost:5173` through `5189`). Non-browser direct requests (like curl) without an origin header are permitted for testing.
- **IP Rate Limiting:** Enforces a limit of **30 requests per 15 minutes per IP** on `/api/chat` with standard `RateLimit-*` headers.
- **Payload Size Capping:** Express JSON parser rejects payloads larger than **50kb**.
- **Inference Timeout:** Upstream API calls are capped at a **20-second timeout** to prevent hanging threads.
- **Sanitized Errors:** Error handlers catch internal errors and return sanitized client messages without stack traces.

---

## 🛡️ Safety Boundaries & Crisis Screening

HostelWell is built with strict ethical guidelines:

1. **Non-Clinical & Non-Diagnostic:** HostelWell is a supportive reflection companion, **not** a clinic, doctor, therapist, or emergency response service. It cannot diagnose conditions or prescribe treatments.
2. **Deterministic Safety Filter:** Keyword screening (`server/src/utils/safetyFilter.js`) catches acute crisis signals before the AI model is called and returns verified national helplines.
3. **Filter Limitations:** Keyword matching can have false positives and false negatives. It cannot replace human empathy or professional psychological assessment.
4. **Emergency Guidance:** If you or someone you know is in acute danger, please contact local emergency authorities (**112 in India**) or inform your hostel warden immediately.

---

## 🔧 Troubleshooting

### 1. `Error: listen EADDRINUSE: address already in use :::5002`
- **Cause:** Another process or previous server instance is already running on port 5002.
- **Solution:** Identify and terminate the process:
  ```bash
  # Find PID:
  lsof -i :5002
  # Terminate process:
  kill -9 <PID>
  ```
- *Note for macOS users:* Do not configure port `5000` because macOS Monterey and newer reserve port 5000 for AirPlay Receiver (`ControlCenter`).

### 2. Frontend Starts on Port 5174 Instead of 5173
- **Cause:** Another local dev server is using port 5173.
- **Resolution:** The backend's CORS configuration automatically authorizes local Vite ports `5173` through `5189`, so the app will connect normally without needing manual CORS changes.

### 3. `503 Service Unavailable: GEMINI_API_KEY is not configured`
- **Cause:** `server/.env` is missing or contains the placeholder string `replace_with_your_own_key`.
- **Solution:** Verify `server/.env` exists and contains your actual key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 4. Browser Speech Input (Voice) Is Unavailable or Disabled
- **Cause:** Web Speech API is not supported in the active browser, or microphone permissions were denied.
- **Solution:** Use Google Chrome, Microsoft Edge, or Apple Safari. When prompted by the browser address bar, grant microphone permissions. Firefox does not implement native Web Speech speech recognition by default. Text chat remains fully functional in all browsers.

### 5. No Voices Heard During Text-to-Speech Playback
- **Cause:** System voices load asynchronously in Chromium-based browsers, or the operating system has no voice synthesizers installed.
- **Solution:** Wait a moment for voices to populate in the dropdown. Ensure your system volume is unmuted. If no speech synthesizers exist, text chat continues to work seamlessly.

### 6. `[CONFIG ERROR] Non-Gemma model requested`
- **Cause:** `GEMMA_MODEL_ID` in `server/.env` was modified to a non-Gemma model.
- **Solution:** Use an approved Gemma model ID, such as `gemma-4-26b-a4b-it` or `gemma-2-9b-it`.

---

## 🧑‍💻 Development & Quality Commands

From the project root:

```bash
# Start frontend development server (Vite on http://localhost:5173)
npm run dev

# Run frontend static analysis and linting (Oxlint)
npm run lint

# Build frontend production bundle
npm run build

# Preview production build locally
npm run preview
```

From the `server/` directory:

```bash
# Start backend in watch mode (Express on http://localhost:5002)
npm run dev

# Start backend in standard production mode
npm start

# Run syntax check across all backend files
node --check src/config.js src/index.js src/routes/chatRoutes.js src/routes/healthRoutes.js src/services/aiService.js src/utils/safetyFilter.js src/utils/systemPrompt.js
```

---

## 📄 License

This repository currently does not include an open-source license. All rights are reserved by the repository owner until a formal open-source license is added.
