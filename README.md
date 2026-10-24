# HostelWell 🏡

**A student wellness check-in experience for hostel life.**

HostelWell is a React-based web application designed to help hostel students reflect on their daily well-being through simple check-ins, mood tracking, reflection prompts, and access to support resources.

The goal is to make daily self-reflection approachable, private, and easy to use, while creating a foundation for future AI-powered wellness support.

## ✨ Current Features

- **Daily wellness check-in** — Record your mood, stress level, energy level, and an optional personal note.
- **Wellness dashboard** — View a summary of your check-in information.
- **History and trends** — Explore wellness patterns using the current demonstration data and available check-in state.
- **Reflection prompts** — Use guided prompts to reflect on your day.
- **Support resources** — View wellness and support information provided by the application.
- **Privacy-conscious design** — Keep the interface focused on personal reflection and make privacy an important part of future development.
- **Responsive interface** — Use the application across different screen sizes.

## 🛠️ Tech Stack

- **React** — Component-based user interface
- **Vite** — Development server and build tooling
- **JavaScript** — Application logic
- **CSS** — Styling and responsive layouts
- **Lucide React** — Interface icons
- **Oxlint** — Code linting

## 🚀 Getting Started

### Prerequisites

Install a current, compatible version of Node.js and npm.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Dhruv269/Private-Hostel-Students-Wellness-Checker.git
   ```

2. Open the project directory:

   ```bash
   cd Private-Hostel-Students-Wellness-Checker
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL shown in your terminal, usually `http://localhost:5173`.

## 🧑‍💻 Development Commands

Run these commands from the project directory:

```bash
npm run dev
```

Starts the local development server.

```bash
npm run lint
```

Checks the code for linting issues.

```bash
npm run build
```

Builds the frontend for production.

## 📍 Current Project Status

**Current milestone: Frontend prototype.**

The current version focuses on the user interface and core wellness check-in experience.

Important implementation details:

- Check-ins are currently stored in application memory and are not guaranteed to persist after refreshing the page.
- History and trend displays may use synthetic demonstration data rather than a student's complete saved history.
- User authentication and a persistent database have not yet been implemented.
- AI chat and voice interaction are planned features, not currently available functionality.
- Counsellor contact and live handoff capabilities must be verified and implemented before they can be advertised as available services.

This version is a prototype and should not be treated as a clinical assessment or a replacement for professional support.

## 🔒 Privacy and Safety Principles

HostelWell is intended to support personal reflection, not to diagnose mental health conditions or replace a qualified professional.

Future development will prioritize:

- Collecting and sharing only the information necessary for each feature.
- Explaining clearly how personal information is handled.
- Protecting sensitive information through appropriate security controls.
- Avoiding unsupported medical or mental health claims.
- Providing reliable, verified human-support information.
- Giving students clear choices about using optional features.

Do not enter highly sensitive personal information into the current prototype, as persistent storage, authentication, and production-level privacy protections have not yet been implemented.

## 🗺️ Roadmap

Development will proceed incrementally:

- [x] Build the initial React frontend.
- [x] Add the daily check-in experience, dashboard, history view, reflection prompts, and support-resource interface.
- [x] Improve code readability and add explanatory comments.
- [ ] Review and finalize frontend documentation.
- [ ] Test and refine the existing frontend experience.
- [ ] Plan secure user authentication and persistent check-in storage.
- [ ] Design an AI text-chat prototype with appropriate privacy and safety safeguards.
- [ ] Integrate an AI model that satisfies the project's requirements.
- [ ] Add verified human-support contact information.
- [ ] Explore voice interaction after text chat is working reliably.
- [ ] Evaluate deployment readiness and production security.

Roadmap items are plans, not claims that those features are already implemented.

## 🤝 Contributing

This is an evolving project. Improvements to accessibility, usability, documentation, code readability, privacy, and safety are welcome.

Before contributing, run the available lint and build commands to check your changes.

## 📄 License

A license has not yet been specified. Until one is added to the repository, do not assume that the project is released under an open-source license.
