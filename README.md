# 💭 Half-Formed

> **A quiet, bounded space for ideas that aren't ready yet.**

Half-Formed is a pseudonymous, topic-bound Web application designed to eliminate the fear-tax on sharing unrefined thoughts. Unlike traditional social media with public scoreboards and vanity metrics, Half-Formed provides small, room-capped pods where the interface actively enforces good-faith discussion.

---

## ✨ Features

- 🫧 **Bounded Conversation Pods**: Rooms auto-cap (6–12 members) to preserve intimacy and high-signal discourse.
- 🛡️ **Steelman-First Interaction**: Interface modes force respondents to articulate the best version of an argument before offering counterpoints.
- 👤 **Pseudonymous Identities**: Users participate via handles and display names without public profiling or tracking.
- 🎨 **Cover Photos & Art Lab**: Pod creators can upload custom banner photos. Built-in pixel halftone and ASCII art generator converts images into retro art.
- 🔍 **Search & Discover**: Filter pods by topic verticals (*Sociology, Psychology, Politics, Philosophy*) or query title & prompt text.
- 📜 **Pod Archives**: Concluded conversations decay into AI-summarized points of consensus and divergence.
- 💎 **Dark Glassmorphic UI**: High-blur translucent panels over an impressionist landscape backdrop with full mobile responsiveness.

---

## 🛠️ Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom Glassmorphism CSS Tokens
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend / Database**: Supabase (PostgreSQL with Row-Level Security, Auth, Realtime, & Storage)
- **Deployment**: Vercel ready

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn
- A [Supabase](https://supabase.com) account

### 2. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd Half\ -\ formed
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in your Supabase credentials in `.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
> ⚠️ **Security Warning**: Never commit `.env` to Git. `.env` is listed in `.gitignore`.

### 4. Database Setup
1. In your Supabase Dashboard, navigate to **SQL Editor** -> **New Query**.
2. Copy and run the SQL schema located at `supabase/schema.sql`.
3. Go to **Authentication** -> **Providers** -> **Email** and enable Email Auth with Magic Links.

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ☁️ Deploying to Vercel

1. Push your code to your GitHub repository.
2. Import the project into [Vercel](https://vercel.com).
3. In Vercel Project Settings, add the Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**. Vercel will automatically use `vercel.json` for SPA routing.

---

## 📁 Repository Structure

```
├── public/                 # Static assets
├── src/
│   ├── components/         # Navigation, CommonsMap, SplashScreen, ImageArtLab
│   ├── hooks/              # useAuth, usePods, usePodMessages, useImageUpload, etc.
│   ├── lib/                # Supabase client setup
│   ├── views/              # DiscoverView, PodRoomView, ArchiveView, ProfileView, OnboardingView
│   ├── App.jsx             # Main Router & view manager
│   ├── main.jsx            # Entry point
│   └── index.css           # Tailwind & glassmorphism theme tokens
├── supabase/
│   └── schema.sql          # Complete PostgreSQL schema & RLS policies
├── .gitignore              # Ignores node_modules, .env, etc.
├── vercel.json             # Vercel SPA rewrite config
└── README.md
```

---

## 🔒 Security & Privacy

- All database tables enforce Row Level Security (RLS).
- User emails are stored securely in Supabase Auth and never exposed in public tables.
- Media uploads are stored in an authenticated Supabase Storage bucket.
