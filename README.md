# Codeflies Portfolio Search & Link Directory 🚀

A high-velocity, responsive enterprise portfolio search engine and link directory for Codeflies showcase projects. Built with **Next.js (App Router)**, **React 19**, **Tailwind CSS**, **Prisma ORM**, and **PostgreSQL (Neon ready)**.

Designed according to the **Kinetic Slate** design system for ultra-crisp ergonomics, instantaneous search filtering, and 1-click batch multi-copy for sales engineers and account executives.

---

## ✨ Features

- **⚡ Instant 60 FPS Search & Filtering**: Client-side fuzzy search across project titles, live URLs, tech architecture badges, and hashtags with zero typing latency.
- **📋 Bulk Multi-Copy Engine**:
  - One-click **Copy All / Copy Selected** with dedicated formatting:
    - **WhatsApp Pitch Format** (clean bullet points, bold titles, emoji, and stack details)
    - **Markdown Deck Format** (`- [Title](url) — Tech Stack`)
    - **Client Proposal Email Format**
    - **Clean Plain URLs**
  - Individual row live link copy and sales pitch blurb copy.
- **🏷️ Dynamic Pitch Tags & Architecture Badges**:
  - Filter pills for quick industry presets (`#Fintech`, `#ECommerce`, `#SaaS`, `#Mobile`, `#WebGL`, `#Healthcare`, `#Logistics`).
  - Inline "+ Tag" dialog to attach new hashtags on the fly.
- **🔐 Role-Based Access Control (Admin & Normal Users)**:
  - **Admin Users**: Full control to add, edit, and delete portfolio projects, manage user permissions, and grant or revoke access.
  - **Normal Users (Members)**: Fast search, link preview, and multi-copy capabilities.
  - **Access Revocation**: When an administrator revokes a user's access, the user is immediately restricted from viewing any projects or links.
- **🔑 Google OAuth + Zero-Friction Demo Sign-In**:
  - Google OAuth 2.0 integration for enterprise team sign-ins.
  - Quick test logins for testing Admin, Member, and Revoked user states without needing OAuth credentials.
- **🗄️ Neon & Prisma PostgreSQL**:
  - Prisma ORM schema ready for Neon Serverless Postgres or Supabase.
  - Resilient hybrid storage: seamless fallback in-memory cache so builds and staging previews never crash even before database credentials are configured.
- **🌐 Production Ready for `folio.codeflies.com` on Vercel**.

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/bhindabawa-dev/codeflies-folio.git
cd codeflies-folio
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your configuration in `.env`:
```env
# Neon / Prisma PostgreSQL Database Connection String
DATABASE_URL="postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require"

# NextAuth / Auth Session Secret
AUTH_SECRET="folio_super_secret_session_jwt_key_32chars_min_length_2026"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Optional for local test accounts, required for Google sign-in)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Default Admin Account
ADMIN_DEFAULT_EMAIL="info@codeflies.com"
ADMIN_DEFAULT_PASSWORD="admin123"
```

### 3. Initialize Prisma (Optional if using Neon Postgres)
```bash
npx prisma db push
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `⌘K` or `/` | Focus search command bar |
| `C` | Copy all selected portfolio links to clipboard |
| `A` | Toggle Select All / Deselect All |
| `Esc` | Clear search or close modals |

---

## ☁️ Hosting on Vercel & Linking to `folio.codeflies.com`

### Step 1: Push Repository to GitHub
The project is connected to `https://github.com/bhindabawa-dev/codeflies-folio`.

### Step 2: Import into Vercel
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** -> **"Project"**.
3. Select your GitHub repository: `bhindabawa-dev/codeflies-folio`.
4. Framework Preset will auto-detect as **Next.js**.

### Step 3: Add Environment Variables in Vercel
In the Vercel project settings under **Environment Variables**, add:
- `DATABASE_URL`: Your Neon Postgres connection string (e.g. from [neon.tech](https://neon.tech)).
- `AUTH_SECRET`: A secure 32+ character random secret string (e.g. generated via `openssl rand -base64 32`).
- `NEXTAUTH_URL`: `https://folio.codeflies.com` (or your Vercel deployment URL).
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID (from Google Cloud Console).
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret.
- `ADMIN_DEFAULT_EMAIL`: `info@codeflies.com`

### Step 4: Click "Deploy"
Vercel will build and deploy the application in under 60 seconds.

### Step 5: Link Domain `folio.codeflies.com`
1. In your Vercel project dashboard, go to **Settings** -> **Domains**.
2. Type `folio.codeflies.com` and click **Add**.
3. In your DNS provider for `codeflies.com` (e.g. Cloudflare, GoDaddy, Route 53):
   - Add a `CNAME` record:
     - **Name / Host**: `folio`
     - **Value / Target**: `cname.vercel-dns.com`
4. Once DNS propagates (usually 1-5 minutes), Vercel automatically generates a free SSL certificate and the app will be live at **https://folio.codeflies.com**!

---

## 🔒 Google Cloud Console OAuth Setup (for Google Login)

To enable "Continue with Google":
1. Visit [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services** -> **Credentials**.
3. Click **Create Credentials** -> **OAuth Client ID**.
4. Application Type: **Web application**.
5. Authorized JavaScript origins:
   - `http://localhost:3000`
   - `https://folio.codeflies.com`
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://folio.codeflies.com/api/auth/callback/google`
7. Copy the **Client ID** and **Client Secret** into your `.env` or Vercel Environment Variables.

---

## 📂 Project Structure

```
├── prisma/
│   └── schema.prisma         # PostgreSQL schema (User, Account, Project)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/         # Login, logout, session, Google OAuth callback
│   │   │   ├── projects/     # Project list, creation, update, delete
│   │   │   └── users/        # Admin user access & revocation management
│   │   ├── globals.css       # Tailwind v4 theme & typography styling
│   │   ├── layout.tsx        # Root HTML layout with Google Fonts
│   │   └── page.tsx          # Main high-velocity portfolio search interface
│   ├── components/
│   │   ├── Header.tsx        # Top navigation with user pill & admin buttons
│   │   ├── SearchHero.tsx    # Command bar with instant search & filter pills
│   │   ├── BatchActionBar.tsx# Sticky bulk copy bar with format choices
│   │   ├── ProjectTable.tsx  # Crystalline table with links, tags, & actions
│   │   ├── ProjectModal.tsx  # Add/edit project dialog
│   │   ├── TagModal.tsx      # Quick inline hashtag dialog
│   │   ├── AdminUsersModal.tsx # Admin access grant/revoke modal
│   │   ├── AuthModal.tsx     # Google login & instant demo switch
│   │   ├── AccessDeniedView.tsx # Screen displayed when user access is revoked
│   │   └── Toast.tsx         # Telemetry toast notification system
│   └── lib/
│       ├── auth.ts           # Cookie-based session & Google OAuth helpers
│       ├── prisma.ts         # Prisma client singleton
│       ├── store.ts          # Resilient data layer (Prisma Postgres + fallback cache)
│       └── types.ts          # TypeScript interfaces
```

---

© Codeflies • Portfolio Showcase