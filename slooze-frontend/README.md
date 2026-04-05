# 🍽️ Slooze Frontend

> Role-based food ordering web app built with Next.js 14 · TypeScript · Tailwind CSS · Apollo Client

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **GraphQL Client**: Apollo Client 3
- **Auth**: JWT stored in cookies
- **Deployment**: Vercel

---

## Features

- 🔐 JWT-based login with predefined users
- 🎭 Role-aware UI — buttons/pages shown based on role
- 🌍 Country-aware — restaurant data filtered by country (ReBAC)
- 🛒 Full cart flow — add items, place order, checkout, cancel
- 💳 Payment management (Admin only)
- 📱 Responsive — works on mobile and desktop

---

## Pages

| Route | Description | Access |
|-------|-------------|--------|
| `/login` | Login with username + password | Public |
| `/dashboard` | Overview + stats + recent orders | All |
| `/restaurants` | Browse restaurants + order | All |
| `/orders` | View, checkout, cancel orders | All (actions restricted by role) |
| `/payments` | Manage payment methods | Admin only |

---

## Local Setup

### Prerequisites
- Node.js 18+
- Slooze Backend running (see backend repo)

### 1. Clone & Install

```bash
git clone https://github.com/SantoshMalana/slooze-frontend.git
cd slooze-frontend
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```

### 3. Run

```bash
npm run dev
```

App running at: http://localhost:3000

---

## Demo Credentials

| User | Username | Role | Country |
|------|----------|------|---------|
| Nick Fury | `nick_fury` | Admin | All |
| Captain Marvel | `captain_marvel` | Manager | 🇮🇳 India |
| Captain America | `captain_america` | Manager | 🇺🇸 America |
| Thanos | `thanos` | Member | 🇮🇳 India |
| Thor | `thor` | Member | 🇮🇳 India |
| Travis | `travis` | Member | 🇺🇸 America |

**Password for all**: `password123`

> Quick login buttons are available on the login page.

---

## Project Structure

```
src/
├── app/
│   ├── (protected)/          # Auth-guarded routes
│   │   ├── layout.tsx        # Shared layout with Navbar
│   │   ├── dashboard/
│   │   ├── restaurants/
│   │   ├── orders/
│   │   └── payments/
│   ├── login/
│   ├── globals.css
│   ├── layout.tsx            # Root layout with providers
│   └── page.tsx              # Redirect to /dashboard or /login
├── components/
│   ├── AuthGuard.tsx         # Redirects unauthenticated users
│   └── Navbar.tsx            # Role-aware navigation
├── context/
│   └── AuthContext.tsx       # Auth state + RBAC can() helper
└── lib/
    ├── apollo-client.ts      # Apollo setup with auth headers
    └── graphql/
        └── operations.ts     # All GQL queries and mutations
```

---

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "feat: initial slooze frontend"
git remote add origin https://github.com/SantoshMalana/slooze-frontend.git
git push -u origin main
```

### 2. Deploy on Vercel

- Go to [vercel.com](https://vercel.com) → Import Git Repository
- Select `slooze-frontend`
- Set environment variable:

```
NEXT_PUBLIC_GRAPHQL_URL=https://your-railway-backend-url.up.railway.app/graphql
```

- Click Deploy

### 3. Update Backend CORS

In your backend `.env` on Railway, add:

```
FRONTEND_URL=https://your-vercel-app.vercel.app
```

---

## Common Issues

| Issue | Fix |
|-------|-----|
| Blank page after login | Check `NEXT_PUBLIC_GRAPHQL_URL` is set correctly |
| CORS error | Update `FRONTEND_URL` in backend Railway env vars |
| `Network error` in Apollo | Ensure backend is running and URL is correct |
| Payments page redirects | Only Admin can access — login as `nick_fury` |
