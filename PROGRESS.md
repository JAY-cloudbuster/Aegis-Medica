# Aegis Medical — Development Progress & Reference

> Last updated: **Feb 15, 2026 — 11:39 PM**

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React + Vite | `client/` folder |
| Styling | Tailwind CSS v4 | `@tailwindcss/vite` plugin |
| Backend | Node.js + Express | `backend/server-mongo.js` |
| Database | MongoDB (Mongoose) | In-memory dev server (no install needed) |
| Auth | JWT + OTP (MFA) | 30min sessions, 2min OTP expiry |
| Icons | Lucide React | Tree-shakeable icon library |
| Font | Inter (Google Fonts) | Loaded in `client/index.html` |

---

## How to Run

```bash
# Terminal 1 — Backend (port 3000)
cd backend
node server-mongo.js

# Terminal 2 — Frontend (port 5173, proxies /api → :3000)
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

> MongoDB starts automatically in-memory. No install needed.
> To use external MongoDB, set `MONGO_URI` env var before starting backend.

### Demo Mode (No Backend Needed)

When `DEMO_MODE = true` in `client/src/context/AuthContext.jsx`:
- Login page shows **role selector** (Admin / Doctor / Patient)
- Click a role → instantly enter the full app with mock data
- Mock API returns sample records, users, patients, and decryption results
- **No backend server required** — perfect for UI exploration

> Set `DEMO_MODE = false` in `AuthContext.jsx` to restore real backend auth.

---

## Project Structure

```
secure-login-system/
├── backend/
│   ├── mongoose/                 ← MongoDB layer
│   │   ├── db.js                 (connection + in-memory fallback)
│   │   ├── crypto.js             (AES-256-CBC encrypt/decrypt)
│   │   ├── keys.js               (RSA keygen, sign, verify)
│   │   ├── routes.js             (all API routes)
│   │   └── models/
│   │       ├── User.js           (username, email, role, MFA, lock)
│   │       ├── MedicalRecord.js  (encrypted data + signature)
│   │       └── SystemKey.js      (encrypted RSA key pair)
│   ├── server-mongo.js           ← Main entry point
│   ├── server.js                 (old SQLite entry — kept for ref)
│   ├── auth.js                   (old SQLite routes — kept for ref)
│   └── ...other old files
├── client/                       ← React frontend
│   ├── src/
│   │   ├── context/AuthContext.jsx   (JWT session, API helper, demo mode)
│   │   ├── components/Layout.jsx     (navbar, sidebar, security card)
│   │   └── pages/
│   │       ├── Login.jsx             (role selector → instant demo entry)
│   │       ├── Register.jsx          (2-step: role pick → account form)
│   │       ├── OTPVerify.jsx         (6-digit code + countdown timer)
│   │       ├── VerifyRegistration.jsx(email token activation)
│   │       ├── Dashboard.jsx         (animated counters, wellness meter)
│   │       ├── Records.jsx           (create, encrypt, decrypt, verify sig)
│   │       └── AdminUsers.jsx        (user cards, search, unlock)
│   ├── index.html
│   └── vite.config.js (Tailwind plugin + API proxy)
└── frontend/                     (old static HTML — can be archived)
```

---

## Cybersecurity Topic Mapping

| Topic | Where It Lives | Key File |
|-------|---------------|----------|
| **Single-Factor Auth** | Username + Password login | `routes.js` → `POST /api/login` |
| **Multi-Factor Auth** | OTP sent after password check | `routes.js` → `POST /api/verify-otp` |
| **RBAC (3 roles)** | admin, doctor, patient | `routes.js` → `roleGuard()` middleware |
| **AES-256-CBC** | Medical records encrypted | `crypto.js` → `encrypt()` / `decrypt()` |
| **RSA-2048 Key Exchange** | Key pairs generated at startup | `keys.js` → `ensureKeys()` |
| **RSA-SHA256 Signatures** | Doctor signs every record | `keys.js` → `signData()` / `verifySignature()` |
| **bcrypt (10 rounds)** | Password hashing in User model | `User.js` → `pre('save')` hook |
| **Key Encryption** | Private key stored AES-256-GCM encrypted | `keys.js` → `getPrivateKey()` |
| **Account Locking** | 3 failed attempts = locked (checks BEFORE bcrypt) | `routes.js` → login handler |

---

## API Endpoints

| Method | Route | Auth | Role(s) | Purpose |
|--------|-------|------|---------|---------|
| POST | `/api/register` | — | — | Create account |
| POST | `/api/verify-registration` | — | — | Activate via token |
| POST | `/api/login` | — | — | Password check → sends OTP |
| POST | `/api/verify-otp` | — | — | OTP check → returns JWT |
| GET | `/api/me` | JWT | any | Get current user |
| POST | `/api/records` | JWT | doctor, admin | Create encrypted record |
| GET | `/api/records` | JWT | any | List records (filtered by role) |
| POST | `/api/records/:id/decrypt` | JWT | any | Decrypt + verify signature |
| GET | `/api/users` | JWT | admin | List all users |
| POST | `/api/users/:id/unlock` | JWT | admin | Unlock locked account |
| GET | `/api/patients` | JWT | doctor, admin | List patient users |

---

## Design System — "Nostalgic & Fresh" Theme

| Element | Value | Vibe |
|---------|-------|------|
| **Primary** | Sage Green `#617050` → `#94a37e` | Calm, organic, trustworthy |
| **Accent** | Warm Amber `#d4a24e` → `#e8a849` | Friendly, inviting |
| **Surface** | Cream `#faf8f4` → `#f0ece4` | Warm paper-like feel |
| **Text** | Warm Dark `#3d3a35` | Soft, not harsh black |
| **Error** | Dusty Rose `#d46a6a` | Gentle, not alarming |
| **Glassmorphism** | `glass` CSS class — warm blur + amber tints | |
| **Background** | Watercolor blobs (`.blob-1`, `.blob-2`, `.blob-3`) | Soft, organic shapes |
| **Texture** | Grain overlay (`.grain`) | Nostalgic, paper-like |
| **Branding** | Leaf 🌿 icon instead of shield | Fresh, natural |

### Key Animations
| Name | Effect | Used On |
|------|--------|---------|
| `animate-fade-in-up` | Slide up + fade | Page entries |
| `animate-bounce-soft` | Gentle bounce-in | Logo icons |
| `animate-breathe` | Slow scale pulse | Heart indicators |
| `animate-pulse-soft` | Soft ring glow | Icon borders |
| `animate-slide-left` | Slide from left | Timeline items |
| `hover-lift` | `-4px` lift + shadow | Cards on hover |
| `.delay-1` to `.delay-7` | Staggered entry | Sequential elements |
| Wellness Meter | SVG ring fill animation | Dashboard security score |
| Animated Counter | Count-up to target value | Dashboard stat numbers |

---

## Bugs Fixed Today 🐛

1. **`crypto.js` — AES key was random on every restart**
   - Old: `crypto.randomBytes(32)` → new key each restart → old data lost forever
   - Fix: `crypto.scryptSync(stableSecret, 'aegis-salt', 32)` → key persists

2. **`routes.js` — Login checked locked status after bcrypt**
   - Old: Ran expensive `bcrypt.compare()` even on locked accounts
   - Fix: `isLocked` check moved BEFORE password comparison

3. **`index.css` — Global `*` transition broke animations**
   - Old: `* { transition: ... }` overrode spin, fade-in, pulse
   - Fix: Scoped to `a, button, input, select, textarea` only

---

## What's Done ✅

- [x] React app with Vite + Tailwind CSS
- [x] MongoDB backend with Mongoose models
- [x] Full auth flow: Register → Verify Email → Login → OTP → Dashboard
- [x] RBAC with 3 roles (admin, doctor, patient)
- [x] Medical records with AES-256 encryption + RSA signatures
- [x] In-memory MongoDB (zero-install dev experience)
- [x] Demo mode (explore UI without backend)
- [x] Bug fixes (AES key stability, login order, CSS animations)
- [x] Premium UI v1 (electronic theme — teal/sky/gradients)
- [x] **Premium UI v2 (nostalgic theme — cream/sage/amber/watercolor)**
  - Watercolor blobs, grain texture, warm glassmorphism
  - Animated counters, SVG wellness meter, breathing animations
  - Leaf branding, role selector login, hover-lift cards
  - Decryption animation (fake terminal text), staggered page entries
  - Password strength meter, OTP countdown timer with urgency coloring

## What's Next (Ideas) 🔜

- [ ] Connect real MongoDB Atlas for persistent data
- [ ] Send OTP via actual email (configure `mailer.js`)
- [ ] Add patient profile page with medical history
- [ ] Add data export (PDF prescriptions)
- [ ] Deploy to Vercel (frontend) + Render (backend)
- [ ] Add dark mode toggle
- [ ] Add real-time notifications (Socket.io)

---

## Git Branches

| Branch | Purpose |
|--------|---------|
| `main` | Latest code (nostalgic theme + demo mode) |
| `frontend-design` | Snapshot before UI redesign |
