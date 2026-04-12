# TalentOS — Frontend

> AI-powered recruitment platform frontend. Built with Next.js 14, TypeScript, and Tailwind CSS.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Real-time | WebSocket (native browser API) |
| Auth | Google OAuth via backend (HttpOnly cookie session) |
| HTTP | Fetch API with `credentials: 'include'` |

---

## Features

- 💬 **Real-time AI chat** — WebSocket connection with live status indicator
- 🧵 **Thread management** — create and switch between chat threads
- 👤 **Google SSO** — secure login via Google OAuth
- 📋 **Hiring request tracking** — view and manage open roles
- 📅 **Scheduling** — interview slot management
- 🎯 **Offer management** — offer generation and approval flow
- ⚙️ **Admin panel** — user management and audit logs

---

## Prerequisites

- Node.js 18+
- npm or yarn
- TalentOS backend running at `http://localhost:8000`

---

## Setup

### 1. Clone & install dependencies

```bash
git clone https://github.com/Mohammed-Dayyan/talentos-frontend.git
cd talentos-frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### 3. Start the development server

```bash
npm run dev
```

App runs at **http://localhost:3000**

---

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

That's it. Auth is handled via HttpOnly cookies set by the backend — no tokens stored in the frontend.

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/          # Login page (Google SSO)
│   └── (platform)/
│       ├── layout.tsx       # Sidebar + thread list
│       ├── chat/
│       │   ├── page.tsx     # Default chat landing
│       │   └── [threadId]/
│       │       └── page.tsx # Chat thread view (WebSocket)
│       ├── hiring-requests/ # Hiring request management
│       ├── scheduling/      # Interview scheduling
│       ├── settings/        # Templates, audit logs
│       └── admin/           # Admin panel
├── components/
│   └── chat/                # Reusable chat components
└── lib/                     # Utility functions
middleware.ts                # Auth redirect middleware
```

---

## Key Pages

| Route | Description |
|-------|-------------|
| `/login` | Google SSO login |
| `/chat` | Default — redirects to most recent thread |
| `/chat/{threadId}` | AI recruitment chat thread |
| `/hiring-requests` | Active hiring requests |
| `/hiring-requests/{id}` | Hiring request detail |
| `/scheduling` | Interview schedule view |
| `/settings/templates` | Message templates |
| `/settings/audit` | Audit log |
| `/admin` | Admin — user management |

---

## WebSocket

The chat page maintains a persistent WebSocket connection to the backend:

```
ws://localhost:8000/ws/chat/{threadId}
```

Authentication is handled automatically via the `talentos_session` HttpOnly cookie. The connection shows a **Live** / **Reconnecting** / **Disconnected** status pill in the chat header.

Messages from the AI agent are pushed in real-time via Redis pub/sub → WebSocket → UI, with no polling required.

---

## Available Scripts

```bash
npm run dev        # Start development server (http://localhost:3000)
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

---

## Production Build

```bash
npm run build
npm run start
```

Or with Docker:

```bash
docker build -t talentos-frontend .
docker run -p 3000:3000 talentos-frontend
```

---

## License

Private — Webknot Technologies
