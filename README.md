# 🤖 AI Resume Shortlisting Engine (GenAI All-in-One)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-1.5_Pro-4285F4?style=for-the-badge&logo=google-gemini)](https://aistudio.google.com/)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3-orange?style=for-the-badge)](https://groq.com/)

A production-grade, hyper-intelligent recruitment platform that transforms resume screening into a precision science. Powered by a **Double-Redundant AI Architecture** (Google Gemini + Groq Llama 3), this engine doesn't just parse—it understands.

---

## 🧬 The "Intelligence First" Suite

### 1. 🛠️ AI JD Engine
Architect the perfect job description in seconds. Optimized for ATS and engagement, with defensive rendering to ensure high-quality output every time.

### 2. 🧠 Candidate Intelligence Center
*   **Culture Radar**: Benchmark candidates against 5 core company values with a visual radar chart.
*   **Success Roadmap**: Personalized 30-60-90 day onboarding plans generated instantly.
*   **Role Architect**: Non-obvious candidate? The AI suggests alternative high-impact roles where they might thrive.

### 3. 🔍 Deep Technical Research
*   **Portfolio/GitHub Analysis**: Deep-dive into public code repositories to assess technical depth beyond the resume.
*   **Video/Audio Analysis**: Transcript-based sentiment and technical accuracy tracking for interview recordings.

### 4. 💬 Ghost Chat & Outreach
*   **Candidate Ghost Chat**: Role-play with a virtual version of the candidate based strictly on their resume.
*   **Hyper-Personalized Outreach**: Generate LinkedIn/Email messages that reference specific candidate projects to boost conversion.

---

## 🛠️ Tech Stack & Redundancy

| Component | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, Framer Motion, ShadCN UI |
| **Visualization** | Recharts (Radar, Bar, Pie Charts) |
| **Primary AI** | Google Gemini 1.5 Pro |
| **Fallback AI** | Groq (Llama 3.3-70B Versatile) |
| **Database** | MongoDB (Mongoose) |
| **Auth** | NextAuth.js (Credentials + JWT) |
| **File Storage** | Vercel Blob |
| **Parsing** | pdf-parse-fork, mammoth (DOCX) |

> [!IMPORTANT]
> **Dual-Provider Architecture**: Every high-intelligence feature is backed by an automatic fallback mechanism. If Gemini hits a rate limit or 404, Groq takes over seamlessly to ensure 100% uptime.

---

## 📦 Getting Started

### Prerequisites
* Node.js 18+
* MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
* Gemini API Key
* Groq API Key (optional but recommended for fallback)
* Vercel Blob token (for resume and avatar uploads)

### Installation
1. **Clone the repo**
   ```bash
   git clone https://github.com/LakshyaAhlawat/ai-resume-engine.git
   cd ai-resume-engine
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy `.env.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

   Required variables:
   ```env
   MONGODB_URI=mongodb+srv://...
   NEXTAUTH_SECRET=your-secret-here
   GEMINI_API_KEY=your_gemini_api_key
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   ```

   Optional:
   ```env
   GROQ_API_KEY=your_groq_api_key
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run Dev Server**
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000), create an account, and start uploading resumes.

---

## 🎨 Design Philosophy
*   **Glassmorphism**: A sleek, dark-themed UI that feels like an enterprise OS.
*   **Micro-Animations**: Powered by Framer Motion for a "premium" tactile feel.
*   **Inclusive UX**: Accessibility-first components using Radix UI primitives.

---

## 👨‍💻 Author
**Lakshya Ahlawat**  
Transforming recruitment with Agentic AI.

---

## 📄 License
MIT © [Lakshya Ahlawat](https://github.com/LakshyaAhlawat)
