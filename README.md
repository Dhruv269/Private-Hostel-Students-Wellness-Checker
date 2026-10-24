# HostelWell 🏡🌱
**A Privacy-Conscious Wellness Check-In & Reflection Companion for Hostel Students**

HostelWell is a web application designed specifically for college students living in shared and private hostels. Living away from home presents unique challenges—academic pressure, roommate friction, erratic sleep cycles, mess food fatigue, and homesickness. HostelWell provides an approachable, private space for daily wellness check-ins, trend tracking, guided reflection prompts, verified emergency resources, and an AI reflection companion powered by Google's hosted **Gemma** open models.

---

## 📋 Table of Contents
- [Current Features](#-current-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Data Storage & Persistence Boundaries](#-data-storage--persistence-boundaries)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [Gemma Model Integration](#-gemma-model-integration)
- [Backend API Reference](#-backend-api-reference)
  - [1. Health Check (`GET /api/health`)](#1-health-check-get-apihealth)
  - [2. Wellness Chat (`POST /api/chat`)](#2-wellness-chat-post-apichat)
- [Security, CORS & Rate Limiting](#-security-cors--rate-limiting)
- [Safety Boundaries & Guardrails](#-safety-boundaries--guardrails)
- [Troubleshooting](#-troubleshooting)
- [Development Commands](#-development-commands)
- [License](#-license)

---

## ✨ Current Features

- **Daily Wellness Check-In:** Record daily mood (1–5 scale with expressive avatars), stress levels (1–5 scale), energy levels (1–5 scale), and an optional personal reflection note.
- **Wellness Dashboard:** View today's check-in status, quick metrics, and rolling 7-day averages for mood, stress, and energy.
- **History & Trends:** Interactive visual trend charts tracking stress and energy variations across recent days, mood distribution breakdown, and a chronological check-in timeline.
- **Guided Reflection Prompts:** Hostel-specific journaling and self-reflection prompts categorized by focus areas (roommate dynamics, exam anxiety, sleep routines, gratitude, and homesickness).
- **Verified Support Resources:** Directory of verified, free, 24/7 Indian mental health helplines and emergency numbers with direct dialing information.
- **Gemma-Powered AI Reflection API:** Secure Node.js & Express backend integrating Google's hosted `gemma-4-26b-a4b-it` model via the `@google/genai` SDK, offering grounded, empathetic emotional reflection.
- **Crisis Screening Layer:** Server-side deterministic pattern filter that immediately provides verified emergency contacts when acute distress indicators are detected.
- **Responsive Layout:** Clean vanilla CSS design system optimized for mobile phones, tablets, and desktop displays.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** [React 19](https://react.dev/) (`^19.3.1`)
- **Build Tool & Dev Server:** [Vite 8](https://vitejs.dev/) (`^8.3.4`)
- **Styling:** Vanilla CSS with custom CSS variables, responsive CSS Grid and Flexbox layouts.
- **Icons:** [Lucide React](https://lucide.dev/) (`^1.61.0`)
- **Linter:** [Oxlint](https://oxc.rs/) (`^1.88.0`)

### Backend
- **Runtime:** [Node.js](https://nodejs.org/) (v18.0.0 or later; ES Modules)
- **Web Framework:** [Express](https://expressjs.com/) (`^4.21.2`)
- **AI SDK:** [@google/genai](https://www.npmjs.com/package/@google/genai) (`^2.31.0`) official Google Gen AI SDK
- **CORS:** [cors](https://www.npmjs.com/package/cors) (`^2.8.5`)
- **Rate Limiting:** [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) (`^7.5.0`)
- **Configuration:** [dotenv](https://www.npmjs.com/package/dotenv) (`^16.4.7`)

---

## 🏗️ System Architecture

```text
┌──────────────────────────────────────────────┐
│        Frontend Client (Browser)             │
│   React 19 + Vite (http://localhost:5173)    │
└──────────────────────┬───────────────────────┘
                       │ HTTP / JSON
                       ▼
┌──────────────────────────────────────────────┐
│         Backend Server (Node.js)             │
│       Express (http://localhost:5001)        │
│                                              │
│  ├─ Strict CORS (Whitelists CLIENT_URL)     │
│  ├─ Rate Limiter (30 req / 15 min / IP)      │
│  ├─ Payload Limiter (max 50kb)               │
│  ├─ Deterministic Crisis Safety Filter       │
│  └─ aiService (@google/genai SDK)            │
└──────────────────────┬───────────────────────┘
                       │ HTTPS / Google Gen AI API
                       ▼
┌──────────────────────────────────────────────┐
│      Google Hosted Gemma Open Model          │
│          gemma-4-26b-a4b-it                  │
└──────────────────────────────────────────────┘
```

---

## 💾 Data Storage & Persistence Boundaries

To ensure complete clarity regarding what data is saved and what is not:

| Component | Storage Mechanism | Lifecycle & Persistence |
| :--- | :--- | :--- |
| **Frontend Check-Ins** | React Component State (`useState` in `App.jsx`) | **In-Memory Only.** Resets upon browser reload or navigation away. Does not persist to disk, browser `localStorage`, or external database. |
| **History & Trends** | Synthetic Demo Data (`src/data/mockData.js`) + active session check-ins | **Demonstration Data.** Provides realistic mock entries so students can preview visual trends immediately. |
| **Chat Messages** | Transient Express Request Lifecycle | **Zero Retention.** Messages are processed in-memory to build the prompt for Gemma. Messages are **never saved** to a database, file, cache, or log. |
| **API Keys & Secrets** | Loaded via `dotenv` into `process.env` | **Server-Side Only.** `GEMINI_API_KEY` is never exposed to browser bundles or network payloads. Kept out of Git via `.gitignore`. |

*Note: User authentication and persistent databases (e.g. PostgreSQL, MongoDB, SQLite) have not been added in this milestone.*

---

## ⚙️ Prerequisites

Before getting started, make sure you have:
1. **Node.js:** Version 18.0.0 or higher (verify with `node -v`).
2. **npm:** Version 9.0.0 or higher (bundled with Node.js; verify with `npm -v`).
3. **Google AI Studio API Key:** A free API key from [Google AI Studio](https://aistudio.google.com/app/apikey) to access hosted Gemma models.

---

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Dhruv269/Private-Hostel-Students-Wellness-Checker.git
   cd Private-Hostel-Students-Wellness-Checker
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   cd ..
   ```

---

## 🔐 Environment Configuration

The backend requires a `server/.env` file to configure ports, client origins, and the Google AI Studio credentials.

1. **Copy the example environment file:**
   ```bash
   cp server/.env.example server/.env
   ```

2. **Open `server/.env` and supply your actual API key:**
   ```ini
   # Server Port (Default is 5001 to prevent macOS AirPlay port 5000 collision)
   PORT=5001

   # Allowed Frontend Origin for CORS
   CLIENT_URL=http://localhost:5173

   # Google Gemini API Key for accessing hosted Gemma models
   GEMINI_API_KEY=your_actual_api_key_here

   # Gemma Model Identifier (Mandatory Gemma family model)
   GEMMA_MODEL_ID=gemma-4-26b-a4b-it
   ```

### Environment Variables Breakdown

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5001` | The local port the Express server listens on. *Note: Port 5000 is reserved on macOS by AirPlay Receiver.* |
| `CLIENT_URL` | `http://localhost:5173` | The frontend origin authorized by CORS. |
| `GEMINI_API_KEY` | *(None)* | Your private Google AI Studio API key used by `@google/genai` to query Gemma. |
| `GEMMA_MODEL_ID` | `gemma-4-26b-a4b-it` | The exact Gemma model used for inference. Must be a Gemma family model. |

> **Security Reminder:** Never commit `server/.env` or paste your API key into issues, pull requests, or chat. `server/.env` is ignored by `.gitignore`.

---

## 🚀 Running the Application

To run the full stack locally, open **two separate terminal windows**:

### Terminal 1 — Frontend (Vite)
From the repository root:
```bash
npm run dev
```
- Local URL: **`http://localhost:5173`**
- Provides hot module replacement (HMR) for frontend components.

### Terminal 2 — Backend (Express)
From the repository root:
```bash
cd server
npm run dev
```
- Local URL: **`http://localhost:5001`**
- Runs `node --watch src/index.js` for automatic server reloads on code edits.
- Alternatively, run `npm start` for standard production execution.

---

## 🤖 Gemma Model Integration

This project strictly utilizes **Google's Gemma open model family**. Non-Gemma models (such as Gemini Pro, Llama, or GPT) are not used for student chat.

### Model Details
- **Active Model:** `gemma-4-26b-a4b-it`
- **Architecture:** Instruction-tuned Mixture-of-Experts (MoE) hosted via the Google Gen AI API.
- **SDK:** `@google/genai` (`^2.31.0`)
- **Server Guard:** `server/src/config.js` verifies on boot that `GEMMA_MODEL_ID` contains `"gemma"`. If an invalid model family is provided, the process terminates immediately with an error.

### How Credentials Are Handled
- `GEMINI_API_KEY` is loaded exclusively into memory by the Node.js backend.
- The key is passed directly to the `GoogleGenAI` client instance inside `server/src/services/aiService.js`.
- Neither the key nor any provider authentication headers are ever exposed to the client or returned in API responses.

---

## 📡 Backend API Reference

Base URL: `http://localhost:5001`

### 1. Health Check: `GET /api/health`

Performs a lightweight liveness check and verifies whether a valid API key is configured.

- **URL:** `/api/health`
- **Method:** `GET`
- **Headers:** None required

#### Success Response (`200 OK`)
```json
{
  "status": "healthy",
  "timestamp": "2026-10-24T19:42:23.865Z",
  "provider": "google-genai",
  "model": "gemma-4-26b-a4b-it",
  "isConfigured": true
}
```
*Note: `isConfigured` is a boolean flag (`true` if a non-placeholder key is set, `false` otherwise). The key itself is never revealed.*

#### Test with curl:
```bash
curl -s http://localhost:5001/api/health
```

---

### 2. Wellness Chat: `POST /api/chat`

Submits student reflection messages to the hosted Gemma companion for supportive, non-clinical processing.

- **URL:** `/api/chat`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`

#### Request Payload Specification

| Field | Type | Required | Constraints |
| :--- | :--- | :--- | :--- |
| `messages` | Array of Objects | **Yes** | 1 to 10 messages. |
| `messages[i].role` | String | **Yes** | Must be `"user"` or `"assistant"`. Final message must have role `"user"`. |
| `messages[i].content` | String | **Yes** | Non-empty string; maximum 1,000 characters per message. |

#### Example Request:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "I am feeling exhausted after back-to-back classes and exam preparation in my hostel room."
    }
  ]
}
```

#### Standard Success Response (`200 OK`)
```json
{
  "reply": "It sounds like you’ve put in a lot of hard work this evening. It is completely natural to feel drained after focusing so intently, especially when you've been in the same hostel room for several hours...",
  "model": "gemma-4-26b-a4b-it",
  "safetyAlert": false
}
```

#### Crisis Screening Interception Response (`200 OK`)
If the message contains acute crisis indicators (e.g. self-harm or suicidal intent), the server bypasses AI generation and returns immediate emergency guidance with verified national helpline details:
```json
{
  "reply": "I hear how much pain and exhaustion you are carrying right now, but please know you do not have to be alone through this. HostelWell is only a reflection companion and cannot provide emergency help or reach out on your behalf. Please reach out right now to a roommate, hostel warden, trusted family member, or a trained counselor who can be there for you.",
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

#### Error Responses

| Status Code | Error Message / Condition | Explanation |
| :--- | :--- | :--- |
| `400 Bad Request` | `{"error": "Invalid request: \"messages\" array cannot be empty."}` | The `messages` array was missing or empty. |
| `400 Bad Request` | `{"error": "Invalid request: Message at index N has unsupported role \"admin\"..."}` | An unsupported role was provided. |
| `400 Bad Request` | `{"error": "Invalid request: Message at index N exceeds maximum length of 1000 characters."}` | Message content exceeded the 1,000 character limit. |
| `429 Too Many Requests` | `{"error": "Too many requests. Please pause for a few minutes before checking in again."}` | IP exceeded the 30 requests per 15-minute quota. |
| `500 Internal Server Error` | `{"error": "CORS blocked: Origin \"...\" is not authorized."}` | Request sent from an unapproved web origin. |
| `503 Service Unavailable` | `{"error": "GEMINI_API_KEY is not configured or contains placeholder text..."}` | Missing or placeholder API key in `server/.env`. |
| `504 Gateway Timeout` | `{"error": "AI inference request timed out after 20 seconds. Please try again."}` | Google Gen AI upstream connection timed out. |

#### Test with curl:
```bash
curl -X POST http://localhost:5001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Had a long day studying in my hostel room."}]}'
```

---

## 🔒 Security, CORS & Rate Limiting

- **Zero Secret Exposure:** API keys are never bundled into client JS code or sent over HTTP headers to the browser.
- **Restricted CORS Policy:** Cross-Origin Resource Sharing is locked down to `CLIENT_URL` (default: `http://localhost:5173`). Browser requests from any other origin are rejected. (Direct curl or server-to-server requests with no origin header are permitted for operational testing).
- **IP Rate Limiting:** Enforced via `express-rate-limit` allowing a maximum of **30 requests per 15 minutes per IP** on `/api/chat`. Standard headers (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`) are sent with each response.
- **Payload Limits:** Express JSON parser rejects request bodies larger than **50kb**.
- **Inference Timeout:** Upstream API calls to Gemma are capped at a strict **20-second timeout** to prevent hanging connections.
- **Sanitized Errors:** Error handlers catch internal exceptions and return generic messages to clients, preventing stack traces or configuration dumps.

---

## 🛡️ Safety Boundaries & Guardrails

HostelWell is designed around strict ethical and safety principles:

1. **Non-Clinical & Non-Diagnostic:**
   - HostelWell is a student reflection tool, **not** a clinic, hospital, therapist, doctor, or emergency response service.
   - It cannot diagnose psychiatric or medical conditions, prescribe medication, or formulate treatment plans.
2. **Server-Controlled System Persona:**
   - The system prompt (`server/src/utils/systemPrompt.js`) strictly instructs Gemma to remain grounded, warm, and low-risk, recommending realistic hostel-scale coping strategies (e.g., splashing water on one's face, having chai, taking a short corridor walk, stepping outside).
   - Prevents toxic positivity, minimizing student concerns, or making medical claims.
3. **Deterministic Safety Screening:**
   - Keyword and regex pattern screening (`server/src/utils/safetyFilter.js`) acts as a first line of defense before invoking the AI model.
   - If acute self-harm or suicidal intent is detected, verified 24/7 toll-free Indian helplines (**Tele-MANAS: 14416**, **KIRAN: 1800-599-0019**, and **National Emergency: 112**) are provided immediately.
4. **Safety Limitations:**
   - Keyword matching can have false positives and false negatives. It cannot replace human empathy or professional psychological assessment.
   - If you or someone you know is in acute danger or experiencing a medical crisis, please contact local emergency authorities (112 in India) or reach out to a hostel warden immediately.

---

## 🔧 Troubleshooting

### 1. `Error: listen EADDRINUSE: address already in use :::5001`
- **Cause:** Another process or previous server instance is already running on port 5001.
- **Solution:** Find the process holding port 5001 and terminate it:
  ```bash
  # Find PID:
  lsof -i :5001
  # Terminate process:
  kill -9 <PID>
  ```
- *Note for macOS users:* Do not use port `5000` on macOS Monterey or newer, as it is occupied by system AirPlay Receiver (`ControlCenter`).

### 2. `503 Service Unavailable: GEMINI_API_KEY is not configured`
- **Cause:** The `server/.env` file is missing or still contains the placeholder `replace_with_your_own_key`.
- **Solution:** Ensure `server/.env` exists and contains a valid key from [Google AI Studio](https://aistudio.google.com/app/apikey):
  ```ini
  GEMINI_API_KEY=AIzaSy...
  ```

### 3. `CORS blocked: Origin "..." is not authorized`
- **Cause:** The frontend is running on a port different from `CLIENT_URL` (for example, Vite started on `http://localhost:5174` because `5173` was busy).
- **Solution:** Update `CLIENT_URL` in `server/.env` to match the exact frontend URL, then restart the backend:
  ```ini
  CLIENT_URL=http://localhost:5174
  ```

### 4. `[CONFIG ERROR] Non-Gemma model requested`
- **Cause:** `GEMMA_MODEL_ID` in `server/.env` was set to a non-Gemma model.
- **Solution:** Use an approved Gemma model ID, such as `gemma-4-26b-a4b-it` or `gemma-2-9b-it`.

### 5. `429 Too Many Requests`
- **Cause:** You have made more than 30 requests in a 15-minute window from the same IP address.
- **Solution:** Wait for the rate limit window to reset (inspect the `RateLimit-Reset` header for seconds remaining).

---

## 🧑‍💻 Development Commands

From the project root:

```bash
# Start frontend dev server (Vite on http://localhost:5173)
npm run dev

# Run frontend static analysis (Oxlint)
npm run lint

# Build frontend production bundle
npm run build

# Preview production build locally
npm run preview
```

From the `server/` directory:

```bash
# Start backend in watch mode (Express on http://localhost:5001)
npm run dev

# Start backend in standard mode
npm start

# Run syntax check on all server files
node --check src/config.js src/index.js src/routes/chatRoutes.js src/routes/healthRoutes.js src/services/aiService.js src/utils/safetyFilter.js src/utils/systemPrompt.js
```

---

## 📄 License

This repository does not currently include an open-source license. All rights are reserved by the repository owner until a formal license is added.
