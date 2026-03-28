# 🔗 LinkSumm AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React%2018-blue?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)](https://www.python.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel)](https://vercel.com/)

> **AI-Powered Short Video Summarizer — Paste a Link, Get the Summary**

LinkSumm AI is a production-ready application designed to save you time by summarizing short-form video content from YouTube Shorts, Instagram Reels, and Facebook Reels. Using state-of-the-art AI models, it transcribes audio and generates structured, actionable summaries in seconds.

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🚀 Platform Support](#-platform-support)
- [🛠️ Tech Stack](#️-tech-stack)
- [📐 Architecture](#-architecture)
- [🚦 Getting Started](#-getting-started)
- [📡 API Documentation](#-api-documentation)
- [🔒 Environment Variables](#-environment-variables)
- [⚠️ Limitations](#️-limitations)
- [🔮 Future Roadmap](#-future-roadmap)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)
- [🙌 Credits](#-credits)

---

## ✨ Features

### Core Capabilities
- **Multi-Platform Support:** Works seamlessly with YouTube Shorts, Instagram Reels, and Facebook Reels.
- **AI Transcription:** Real-time audio-to-text conversion using **Groq Whisper (whisper-large-v3)**.
- **Smart Summarization:** Generates structured summaries using **Google Gemini (gemini-1.5-flash)**.
- **Structured Output:** Every summary includes a One-line summary, Key points, Action items, and relevant Tags.
- **File Upload Fallback:** If a link is blocked by anti-scraping measures, you can upload the video file directly (100% success rate).

### User Experience
- **Authentication:** Secure Google OAuth login via Supabase.
- **History & Search:** Keep track of all your previous summaries with a searchable history.
- **Public Sharing:** Generate unique short links to share summaries with anyone.
- **Social Integration:** One-click sharing to Twitter, WhatsApp, LinkedIn, and Telegram.
- **Responsive Design:** Beautiful dark-mode UI with glassmorphism effects, optimized for mobile and desktop.
- **Real-time Tracking:** View count tracking for shared summaries and processing time statistics.

### Technical Excellence
- **4-Layer Instagram Fallback:** Advanced scraping strategy (yt-dlp → instaloader → direct URL → gallery-dl).
- **Validation:** File size and format validation to ensure high-quality transcription.
- **Performance:** Optimized for free-tier deployment with efficient resource management.

---

## 🚀 Platform Support

| Platform | Success Rate | Status | Notes |
| :--- | :--- | :--- | :--- |
| **YouTube Shorts** | **95%** | ✅ Recommended | Fastest and most reliable. |
| **Instagram Reels** | **60%** | 🧪 Experimental | Subject to aggressive anti-scraping. |
| **Facebook Reels** | **50%** | 🏗️ Beta | Works best with public reels. |
| **Manual Upload** | **100%** | 🛠️ Fallback | Works for any video/audio file < 25MB. |

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js (TypeScript)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Markdown:** React Markdown
- **Auth:** Supabase Auth (Google OAuth)
- **Deployment:** Vercel

### Backend
- **Framework:** Python 3.11+ with FastAPI
- **Scraping:** yt-dlp, Instaloader, gallery-dl
- **Transcription:** Groq Whisper API (`whisper-large-v3`)
- **Summarization:** Google Gemini API (`gemini-1.5-flash`)
- **Deployment:** Render

### Database
- **Provider:** Supabase (PostgreSQL)
- **Features:** Row Level Security (RLS), Real-time view tracking.

---

## 📐 Architecture

### User Flow
1. **Input:** User pastes a video link or uploads a file.
2. **Detection:** Backend validates the URL and detects the platform.
3. **Extraction:** Audio is extracted using the most efficient strategy for that platform.
4. **Transcription:** Audio is sent to Groq Whisper for high-accuracy text conversion.
5. **Summarization:** The transcript is processed by Google Gemini to create a structured summary.
6. **Storage:** Summary is saved to the database (if logged in).
7. **Delivery:** The structured result is returned to the frontend for display.

### API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Health check |
| `POST` | `/api/summarize` | Summarize from a URL |
| `POST` | `/api/summarize-upload` | Summarize from a file upload |
| `POST` | `/api/save-summary` | Save summary to user history |
| `GET` | `/api/history/{user_id}` | Retrieve user's summary history |
| `DELETE` | `/api/summary/{id}` | Delete a specific summary |
| `POST` | `/api/save-public-summary` | Generate a shareable public link |
| `GET` | `/api/shared/{share_id}` | Retrieve a public summary |

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- [Groq API Key](https://console.groq.com)
- [Gemini API Key](https://aistudio.google.com/apikey)
- [Supabase Project](https://supabase.com)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/infoamitkumar42-ai/linksumm-ai.git
   cd linksumm-ai
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running Locally

1. **Start Backend:**
   ```bash
   cd backend
   uvicorn main:app --reload --port 8000
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

---

## 🔒 Environment Variables

### Backend (`backend/.env`)
```env
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
```

### Frontend (`frontend/.env`)
```env
VITE_BACKEND_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## ⚠️ Limitations

1. **Instagram Blocking:** Success rates vary due to Instagram's anti-scraping measures. Use the upload fallback if needed.
2. **Cold Starts:** On Render's free tier, the backend may take 30-50 seconds to "wake up" after inactivity.
3. **File Size:** Limited to 25MB per file (Groq Whisper API constraint).
4. **Rate Limits:** 
   - Groq: 14,400 requests/day.
   - Gemini: 1,500 requests/day.

---

## 🔮 Future Roadmap

- [ ] Support for Twitter/X and TikTok videos.
- [ ] Longer video support via chunked processing.
- [ ] Batch processing for multiple links.
- [ ] Customizable summary styles (Formal, Casual, Bullet-only).
- [ ] Multi-language translation support.
- [ ] Export summaries as PDF or TXT files.
- [ ] Audio podcast summarization.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Report Bugs:** Open an issue with a clear description and steps to reproduce.
2. **Feature Requests:** Open an issue to discuss new ideas.
3. **Pull Requests:** 
   - Fork the repo.
   - Create a feature branch (`git checkout -b feature/AmazingFeature`).
   - Commit your changes (`git commit -m 'Add AmazingFeature'`).
   - Push to the branch (`git push origin feature/AmazingFeature`).
   - Open a Pull Request.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙌 Credits

- **Developer:** [@infoamitkumar42-ai](https://github.com/infoamitkumar42-ai)
- **AI Models:** [Groq Whisper](https://groq.com/), [Google Gemini](https://ai.google.dev/)
- **Tools:** [yt-dlp](https://github.com/yt-dlp/yt-dlp), [FastAPI](https://fastapi.tiangolo.com/), [React](https://reactjs.org/)

---

<p align="center">Built with ❤️ for the AI community</p>
