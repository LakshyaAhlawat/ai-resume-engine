# AI Resume Shortlisting Engine

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](#license)

A full-stack recruitment platform that uses LLMs to parse resumes, score candidates against a job description, and surface the analysis a hiring team actually needs — culture fit, onboarding plans, technical due diligence, and outreach — from a single dashboard.

Built solo with Next.js (App Router), MongoDB, and a dual-provider AI layer (Google Gemini with a Groq fallback) so that a single provider outage or rate limit doesn't take the app down.

![Scoring dashboard](public/docs_scoring_feature.png)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Roadmap](#roadmap)
- [License](#license)

---

## Features

**Resume parsing & scoring**
- Upload PDF/DOCX resumes (`pdf-parse-fork`, `mammoth`), extract structured candidate data, and score each candidate against a specific job description.
- Batch scoring for processing multiple candidates against the same role at once.

**Job description generation**
- Generate ATS-optimized job descriptions from a role title and a few inputs.

**Candidate intelligence**
- **Culture fit radar** — benchmarks a candidate against configurable company values on a radar chart (Recharts).
- **30/60/90-day onboarding roadmap** — generated from the candidate's resume and the target role.
- **Role Architect** — suggests alternative roles a candidate may be a stronger fit for, beyond the one they applied to.
- **Portfolio/GitHub analysis** — reviews public repositories to sanity-check claimed technical depth.
- **Interview video/audio analysis** — transcript-based scoring for recorded interviews.

**Engagement**
- **Candidate Ghost Chat** — a chat interface that role-plays as the candidate, grounded strictly in their resume, so a recruiter can "interview" the resume before scheduling a call.
- **Outreach generator** — drafts personalized LinkedIn/email outreach referencing specific candidate projects.

**Market & compensation**
- Salary prediction and market trend analysis endpoints to support offer decisions.

**Auth & access**
- Email/password auth plus optional GitHub/Google OAuth via NextAuth.js, with an internal API key path for server-to-server calls.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | Next.js 16 (App Router), React 19 |
| Styling / UI | Tailwind CSS 4, Radix UI primitives, ShadCN-style components, Framer Motion |
| Data viz | Recharts |
| 3D | React Three Fiber / drei |
| Database | MongoDB via Mongoose |
| Auth | NextAuth.js (Credentials + JWT, optional GitHub/Google OAuth) |
| AI (primary) | Google Gemini (`@google/generative-ai`) |
| AI (fallback) | Groq (Llama 3.3 70B via `groq-sdk`) |
| File storage | Vercel Blob |
| Resume parsing | `pdf-parse-fork`, `pdfjs-dist`, `mammoth` |

---

## Architecture

- **Dual-provider AI calls**: every AI-backed route tries Gemini first and automatically falls back to Groq on a rate limit or provider error, so a single vendor incident doesn't take a feature down.
- **Server Actions + Route Handlers**: mutations that are tightly coupled to a page (uploads, candidate updates) go through Next.js Server Actions in `src/actions`; standalone/programmatic endpoints live under `src/app/api`.
- **Auth guarding**: `src/lib/apiGuard.js` centralizes session checks (`requireAuth`) and an internal-service bypass (`requireAuthOrInternal`) for server-to-server calls authenticated with `API_SECRET`.
- **Versioned public API**: `src/app/api/v1/analyze` exposes a stable external entry point separate from the internal app routes, so the internal API surface can evolve without breaking integrations.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Google Gemini API key](https://aistudio.google.com/)
- A [Groq API key](https://groq.com/) (optional, enables the AI fallback)
- A [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) read/write token (for resume and avatar uploads)

### Installation

```bash
git clone https://github.com/LakshyaAhlawat/ai-resume-engine.git
cd ai-resume-engine
npm install
```

### Environment setup

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required:

```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=generate-a-strong-secret-here
GEMINI_API_KEY=your_gemini_api_key
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

Optional:

```env
GROQ_API_KEY=your_groq_api_key          # enables AI fallback
NEXTAUTH_URL=http://localhost:3000
GITHUB_ID=
GITHUB_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
API_SECRET=your_api_secret              # for internal/server-to-server API calls
```

### Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and start uploading resumes.

---

## Project Structure

```
src/
├── actions/          # Next.js Server Actions (uploads, candidates, user)
├── app/
│   ├── api/           # Route handlers — scoring, generation, analysis, auth, market data
│   ├── candidates/    # Candidate list, detail, compare, mapping views
│   ├── dashboard/      # Main recruiter dashboard
│   ├── jd-engine/      # Job description generator UI
│   ├── analytics/      # Market analytics views
│   └── (auth, settings, docs, legal pages)
├── components/
│   ├── landing/        # Marketing/landing page components
│   ├── layout/          # App shell, navigation
│   └── ui/               # Reusable UI primitives (Radix/ShadCN-based)
├── lib/                # Auth config, DB connection, API guards, market trends helpers
└── models/             # Mongoose schemas (User, Candidate)
```

---

## API Overview

All routes live under `src/app/api` and are session-authenticated unless noted.

| Route | Purpose |
| :--- | :--- |
| `POST /api/parsing` | Extract structured data from an uploaded resume |
| `POST /api/scoring` | Score a single candidate against a job description |
| `POST /api/scoring/batch` | Score multiple candidates in one request |
| `POST /api/generate/jd` | Generate a job description |
| `POST /api/analyze/onboarding` | Generate a 30/60/90-day onboarding plan |
| `POST /api/analyze/role-architect` | Suggest alternative-fit roles for a candidate |
| `POST /api/analyze/portfolio` | Analyze a candidate's public GitHub/portfolio |
| `POST /api/analyze/video` | Analyze interview video/audio transcripts |
| `POST /api/chat/candidate` | Ghost Chat — converse with an AI grounded in a candidate's resume |
| `POST /api/outreach` | Generate personalized outreach messages |
| `GET /api/market/trends` | Market trend data for a role |
| `POST /api/predict/salary` | Salary range prediction |
| `POST /api/recommendations` | Candidate recommendations |
| `POST /api/embeddings` | Generate embeddings for semantic search |
| `POST /api/v1/analyze` | Versioned, external-facing analysis endpoint |

---

## Roadmap

- [ ] Automated test coverage (unit + integration)
- [ ] Semantic candidate search backed by the embeddings endpoint
- [ ] Team/org accounts with role-based access control
- [ ] CI pipeline (lint, build, deploy checks)

---

## License

MIT © [Lakshya Ahlawat](https://github.com/LakshyaAhlawat)
