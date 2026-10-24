# HostelWell Backend Server 🏡🌱

This is the secure Node.js & Express backend for **HostelWell — Private Hostel Students Wellness Checker**, providing non-clinical AI reflection capabilities powered by Google's hosted **Gemma** open models.

---

## 🔒 Security & Privacy Guarantees

1. **Zero Key Leakage:** Your `GEMINI_API_KEY` is loaded exclusively by the Node server from `server/.env`. It is **never** accessible to browser code, never bundled into frontend assets, and never returned in API payloads.
2. **Zero Chat Retention:** Student messages are processed in memory during the request lifecycle. They are **never stored** in a database, log file, or cache.
3. **Restricted CORS:** Only requests originating from the configured frontend (`http://localhost:5173` by default) are permitted.
4. **Rate Limiting:** Prevents key quota depletion with automatic IP-based request throttling.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Node.js version 18 or newer (tested on Node v26).

### 2. Install Dependencies
From the repository root:
```bash
cd server
npm install
```

### 3. Configure Your Environment File
Copy the provided template to create your local `.env`:
```bash
cp .env.example .env
```

Open `server/.env` in your text editor and supply your Google AI Studio API key:
```ini
PORT=5001
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_actual_google_ai_studio_key_here
GEMMA_MODEL_ID=gemma-4-26b-a4b-it
```

> **Where to get a key:** Obtain a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).  
> **Important:** Never commit your `.env` file or paste your API key into chat. The root `.gitignore` protects `server/.env` automatically.

### 4. Start the Server
```bash
# Development mode with automatic file reload:
npm run dev

# Or standard production start:
npm start
```

You should see:
```text
======================================================
🌱 HostelWell Backend Server running
📡 URL: http://localhost:5001
🔒 Allowed Client Origin: http://localhost:5173
🤖 Configured Model: gemma-4-26b-a4b-it
🔑 Key Configured: Yes (Active)
======================================================
```

---

## 📡 API Endpoints

### 1. Health Check: `GET /api/health`
Checks if the backend is running and whether an API key has been provided.

**Test with curl:**
```bash
curl -s http://localhost:5001/api/health
```

**Sample Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-10-25T00:25:00.000Z",
  "provider": "google-genai",
  "model": "gemma-4-26b-a4b-it",
  "isConfigured": true
}
```

---

### 2. Wellness Chat: `POST /api/chat`
Sends student reflection notes for empathetic, non-clinical processing by Gemma.

**Test with curl:**
```bash
curl -X POST http://localhost:5001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Had a long day with back-to-back classes. Feeling exhausted in my hostel room."
      }
    ]
  }'
```

**Sample Response:**
```json
{
  "reply": "Hostel rooms can feel especially cramped after a marathon day of classes. When your energy battery is that low, giving yourself permission to put your textbooks aside for even thirty minutes can make a real difference. Have you taken off your study shoes and had a glass of water yet?",
  "model": "gemma-4-26b-a4b-it",
  "safetyAlert": false
}
```

---

## 🛡️ Safety & Crisis Boundaries

- **Not a Clinic or Emergency Dispatcher:** This service cannot dispatch emergency services, call campus wardens, or diagnose mental health disorders.
- **Built-in Safety Layer:** If acute crisis phrases (e.g. self-harm or suicidal intent) are detected, the server returns immediate empathetic guidance accompanied by verified 24/7 Indian crisis contacts (**Tele-MANAS: 14416**, **National Emergency: 112**), rather than relying solely on AI model generation.
