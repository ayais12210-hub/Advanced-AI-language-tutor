
# Linguamate.ai - AI Language Learning Ecosystem

<div align="center">
  <img src="https://storage.googleapis.com/aistudio-marketplace/project-logo/linguamate_logo.svg" alt="Linguamate.ai Logo" width="120">
  <h1>Linguamate.ai</h1>
  <p><strong>An advanced, AI-driven language learning ecosystem powered exclusively by the Google Gemini API.</strong></p>
</div>

---

**Linguamate.ai** is a sophisticated, single-page application designed to provide a personalized and immersive language learning experience. It combines conversational AI, cultural immersion, and powerful generative features into a seamless, responsive, and aesthetically pleasing user interface.

While the UI offers a familiar multi-provider selection experience (simulating models from OpenAI and Anthropic, and services like ElevenLabs), the entire application is powered by a unified backend: **Google's Gemini API**. This architectural choice ensures maximum performance, security, and consistency across all features.

## Table of Contents

1.  [Project Overview](#project-overview)
2.  [Core Features](#core-features)
    *   [Core Learning Tools](#core-learning-tools)
    *   [Creative & Immersive Tools](#creative--immersive-tools)
    *   [Productivity & Analysis](#productivity--analysis)
    *   [User Progression & Customization](#user-progression--customization)
3.  [Technology Stack](#technology-stack)
4.  [Architectural Decisions](#architectural-decisions)
    *   [Unified AI Backend: The Gemini-First Approach](#unified-ai-backend-the-gemini-first-approach)
    *   [Client-Centric SPA](#client-centric-spa)
    *   [Zero Build-Step Development](#zero-build-step-development)
5.  [Core Concepts Deep Dive](#core-concepts-deep-dive)
    *   [Multi-Provider Simulation Strategy](#multi-provider-simulation-strategy)
    *   [Persistent State Management](#persistent-state-management)
    *   [Subscription Tier Gating](#subscription-tier-gating)
6.  [Getting Started](#getting-started)
7.  [Project Structure](#project-structure)

## Project Overview

Linguamate.ai is not just another language app; it's an integrated ecosystem designed to tackle language acquisition from multiple angles. It leverages state-of-the-art AI to act as a conversational partner, a creative muse, a pronunciation coach, and a cultural guide. The application is built as a pure client-side Single Page Application (SPA), emphasizing modern web standards, performance, and a high-quality user experience.

## Core Features

### Core Learning Tools

*   **Practice Conversation (`Chat.tsx`):** Engage in dynamic, AI-powered conversations with Lumi, a language tutor. Features real-time feedback, grammar correction, cultural insights, and smart suggestions.
*   **AI Translator (`Translator.tsx`):** An advanced "AI Language Coach" that provides not just translations, but a deep analysis of pronunciation (IPA), grammar, cultural context, and alternative phrasings.
*   **Live Tutoring (`LiveConvo.tsx`):** A real-time, low-latency voice conversation with Gemini. Features live transcription for both user and AI, and an integrated "Fluency Coach" for on-the-spot feedback.
*   **Pronunciation Practice (`TTS.tsx`):** Utilizes Gemini's text-to-speech models to voice any text, helping users master pronunciation with a choice of high-quality voices.
*   **Interactive Lessons (`Lessons.tsx`):** A structured, gamified learning path with units covering everything from the alphabet to complex grammar, complete with quizzes and interactive exercises.
*   **Learning Hub (`MasteryHub.tsx`):** A skill-based progression system that allows users to target specific areas of mastery, from "Phonetics" to "Cognitive Flexibility."

### Creative & Immersive Tools

*   **Visual Vocabulary (`ImageGen.tsx`):** Generates high-quality images from text prompts using Imagen, helping users build visual associations with vocabulary.
*   **Cultural Context (`ImageEdit.tsx`):** Edits user-uploaded images based on text prompts, allowing for creative exploration of cultural and linguistic concepts.
*   **Immersive Scenarios (`VideoGen.tsx`):** Creates short video clips from text prompts and an initial image using Veo, designed for immersive storytelling and scenario practice.
*   **Explore & Discover (`Grounding.tsx`):** An AI chat grounded with Google Search and Maps, enabling users to ask questions about the real world and receive up-to-date, sourced answers.

### Productivity & Analysis

*   **Content Analyzer (`Analyzer.tsx`):** A powerful "notebook" system where users can add sources (text, URLs) and use AI to generate summaries, key points, FAQs, and even an audio overview. Includes a built-in chat to query the provided sources.

### User Progression & Customization

*   **Comprehensive Settings (`Settings.tsx`):** Centralized control over learning preferences, default AI models, voice providers, notifications, and more.
*   **User Profile (`Profile.tsx`):** Tracks user stats like total chats, streaks, words learned, and XP. Includes a personal journal, achievement badges, and mock social features (friends, leaderboard).
*   **Onboarding (`Onboarding.tsx`):** A guided setup process to personalize the user's learning path based on experience, goals, and interests.
*   **Premium Tiers (`Premium.tsx`):** A mock subscription page that controls access to advanced features via the `LockedFeatureGate` component.

## Technology Stack

*   **Frontend Framework:** React 19
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (via CDN)
*   **AI Engine:** Google Gemini API (`@google/genai` library)
    *   **Text & Chat:** `gemini-2.5-pro`, `gemini-2.5-flash`
    *   **Image Generation:** `imagen-4.0-generate-001`
    *   **Image Editing:** `gemini-2.5-flash-image`
    *   **Video Generation:** `veo-3.1-fast-generate-preview`
    *   **Text-to-Speech:** `gemini-2.5-flash-preview-tts`
    *   **Live Conversation:** `gemini-2.5-flash-native-audio-preview-09-2025`
*   **Build System:** None. The project uses modern browser features (`importmap`, ES Modules) to run without a package manager or build step.
*   **Markdown Rendering:** `react-markdown`

## Architectural Decisions

### Unified AI Backend: The Gemini-First Approach

The decision to exclusively use the Google Gemini API, while simulating other providers in the UI, is a core architectural principle.
*   **Consistency & Performance:** A single, highly optimized API endpoint ensures predictable latency, consistent safety filtering, and uniform response structures.
*   **Security & Simplicity:** Managing a single API key and SDK simplifies the codebase and reduces the security surface area. There is no need to handle different authentication methods or error patterns from multiple vendors.
*   **Cost Management:** All API calls are consolidated under a single Google Cloud project, simplifying billing and usage tracking.
*   **User Experience:** By presenting a familiar "multi-provider" UI, the application caters to users who may be accustomed to other services, while still delivering the benefits of a unified Gemini backend.

### Client-Centric SPA

The application is a pure Single Page Application.
*   **No Server Backend:** All business logic resides on the client. This simplifies deployment, as the entire application can be served from a static file host.
*   **Local Persistence:** User data, settings, and progress are persisted in the browser's `localStorage` via the `usePersistentState` custom hook, ensuring a seamless experience across sessions without requiring a database.

### Zero Build-Step Development

The project is intentionally configured to avoid complex JavaScript tooling like Webpack, Vite, or `npm`.
*   **Simplicity:** By using an `importmap` in `index.html`, we can import packages like React and `@google/genai` directly from a CDN as standard ES Modules.
*   **Rapid Prototyping:** This setup allows for immediate feedback—simply edit a file and refresh the browser. It's ideal for environments like AI Studio where a complex build process is unnecessary.

## Core Concepts Deep Dive

### Multi-Provider Simulation Strategy

This is the most critical concept to understand. The UI is an abstraction layer over the Gemini API.

#### Model Mapping

The user's choice in the settings UI is mapped to a specific Gemini model in the backend logic, primarily within `Chat.tsx` and `Settings.tsx`.

| UI Selection (Simulated)    | Provider    | Actual Gemini Model          | Rationale                                        |
| --------------------------- | ----------- | ---------------------------- | ------------------------------------------------ |
| **GPT-5, Opus 4.1**         | OpenAI, Anthropic | `gemini-2.5-pro`             | Mapped to the most powerful reasoning model.     |
| **Gemini 2.5 Pro**          | Google      | `gemini-2.5-pro`             | Direct mapping.                                  |
| **GPT-4o, Sonnet 4.5**      | OpenAI, Anthropic | `gemini-2.5-flash`           | Mapped to the best general-purpose, fast model.  |
| **Gemini 2.5 Flash**        | Google      | `gemini-2.5-flash`           | Direct mapping.                                  |
| **Haiku 4.5**               | Anthropic   | `gemini-flash-lite-latest`   | Mapped to the fastest available model.           |

#### Thinking Time Simulation

For the simulated "GPT-5" model, the UI offers "Thinking Time" presets. These map directly to Gemini's `thinkingConfig` property to control the model's reasoning budget, demonstrating a powerful native feature in a familiar context.

| UI Preset         | `thinkingConfig`            |
| ----------------- | --------------------------- |
| **Instant**       | `{ "thinkingBudget": 0 }`   |
| **Thinking mini** | `{ "thinkingBudget": 8192 }`|
| **Thinking**      | `{ "thinkingBudget": 32768 }`|
| **Auto**          | (undefined)                 |

#### Voice & Speech Simulation (TTS/STT)

*   **TTS (Text-to-Speech):** When the user selects "ElevenLabs" as the `TtsProvider`, the application calls the Gemini TTS API but requests a specific, expressive voice (`Zephyr`) instead of the default (`Kore`), simulating a different provider's vocal style.
*   **STT (Speech-to-Text):** The STT provider selection ("Whisper", "Deepgram") is purely cosmetic. All real-time transcription is handled natively and efficiently by the Gemini Live API (`gemini-2.5-flash-native-audio-preview-09-2025`), which is a requirement for the live conversation feature.

### Persistent State Management

The custom hook `usePersistentState(key, defaultValue)` in `App.tsx` is a simple wrapper around `React.useState`. It automatically reads the initial state from `localStorage` and writes back to it whenever the state changes. This provides effortless persistence for user settings, progress, and journal entries.

### Subscription Tier Gating

The `LockedFeatureGate.tsx` component is a wrapper that conditionally renders its children based on the user's `subscriptionTier`. It compares the `currentTier` against a `requiredTier` using a numeric level system (`tierLevels`), providing a clean and reusable way to manage access to premium features like Live Tutoring and Video Generation.

## Getting Started

This project is designed to run without any build tools.

1.  **Prerequisites:** A modern web browser (Chrome, Firefox, Edge) and a local web server.
2.  **API Key:** The application requires a Google AI API key. It is designed to be run in an environment where the key is provided as the `process.env.API_KEY` environment variable (e.g., Google AI Studio).
3.  **Run Locally:**
    *   Clone or download the project files.
    *   Navigate to the project directory in your terminal.
    *   Start a simple local web server. For example, with Python:
        ```bash
        python -m http.server
        ```
    *   Open your browser and navigate to `http://localhost:8000` (or the address provided by your server).

## Project Structure

The project follows a flat, component-based structure.

```
/
├── index.html            # Entry point, includes importmap and Tailwind CSS setup
├── index.tsx             # Main React render entry point
├── App.tsx               # Root component, handles global state and routing
├── Sidebar.tsx           # Main navigation component
├── types.ts              # Centralized TypeScript types and interfaces
│
├── components/           # (Conceptual grouping of files)
│   ├── Chat.tsx          # Practice Conversation feature
│   ├── Translator.tsx    # AI Language Coach feature
│   ├── LiveConvo.tsx     # Live Tutoring feature
│   ├── Lessons.tsx       # Interactive Lessons feature
│   ├── MasteryHub.tsx    # Learning Hub feature
│   ├── ImageGen.tsx      # Visual Vocabulary (Image Generation)
│   ├── ImageEdit.tsx     # Cultural Context (Image Editing)
│   ├── VideoGen.tsx      # Immersive Scenarios (Video Generation)
│   ├── Analyzer.tsx      # Content Analyzer feature
│   ├── Grounding.tsx     # Explore & Discover feature
│   ├── TTS.tsx           # Pronunciation Practice feature
│   ├── Settings.tsx      # Main settings page
│   ├── Profile.tsx       # User profile, stats, and achievements
│   ├── Premium.tsx       # Subscription plans page
│   ├── Help.tsx          # FAQ and support page
│   ├── ... (other UI and helper components)
│
└── data/                 # (Conceptual grouping of files)
    ├── languages.ts      # List of supported languages
    ├── lessonData.ts     # Data for the "Interactive Lessons" path
    ├── masteryPathData.ts# Data for the "Learning Hub" path
    └── ... (other static data files)
```
