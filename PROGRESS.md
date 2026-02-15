# Aegis Medical — Development Progress & Reference

> Last updated: **Feb 15, 2026**

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

---

## Project Structure

```
secure-login-system/
├── backend/
│   ├── mongoose/                 ← NEW (MongoDB layer)
│   │   ├── db.js                 (connection + in-memory fallback)
│   │   ├── crypto.js             (AES-256-CBC encrypt/decrypt)
│   │   ├── keys.js               (RSA keygen, sign, verify)
│   │   ├── routes.js             (all API routes)
│   │   └── models/
│   │       ├── User.js           (username, email, role, MFA, lock)
│   │       ├── MedicalRecord.js  (encrypted data + signature)
│   │       └── SystemKey.js      (encrypted RSA key pair)
│   ├── server-mongo.js           ← NEW entry point
│   ├── server.js                 (old SQLite entry — kept for ref)
│   ├── auth.js                   (old SQLite routes — kept for ref)
│   └── ...other old files
├── client/                       ← NEW (React frontend)
│   ├── src/
│   │   ├── context/AuthContext.jsx   (JWT session, API helper)
│   │   ├── components/Layout.jsx     (navbar, sidebar, security badge)
│   │   └── pages/
│   │       ├── Login.jsx             (username + password → OTP)
│   │       ├── Register.jsx          (role selector: patient/doctor/admin)
│   │       ├── OTPVerify.jsx         (6-digit code with auto-focus)
│   │       ├── VerifyRegistration.jsx(email token activation)
│   │       ├── Dashboard.jsx         (role-based cards + stats)
│   │       ├── Records.jsx           (create, encrypt, decrypt, verify sig)
│   │       └── AdminUsers.jsx        (user table, unlock accounts)
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
| **Account Locking** | 3 failed attempts = locked | `routes.js` → login handler |

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

## Design System

- **Primary**: Teal-600 (`#0D9488`) — trust, healing
- **Accent**: Sky-500 (`#0EA5E9`) — action buttons
- **Background**: Slate-50 (`#F8FAFC`) — clinical clean
- **Error**: Rose-500 (`#F43F5E`)
- **Glass effect**: `glass` CSS class (blur + transparency)
- **Animations**: `animate-fade-in`, `animate-pulse-glow`

---

## What's Done ✅

- [x] React app with Vite + Tailwind CSS
- [x] MongoDB backend with Mongoose models
- [x] Full auth flow: Register → Verify Email → Login → OTP → Dashboard
- [x] RBAC with 3 roles (admin, doctor, patient)
- [x] Medical records with AES-256 encryption + RSA signatures
- [x] Glassmorphism UI with medical theme
- [x] In-memory MongoDB (zero-install dev experience)

## What's Next (Ideas) 🔜

- [ ] Connect real MongoDB Atlas for persistent data
- [ ] Send OTP via actual email (configure `mailer.js`)
- [ ] Add patient profile page with medical history
- [ ] Add data export (PDF prescriptions)
- [ ] Deploy to Vercel (frontend) + Render (backend)
- [ ] Add dark mode toggle
- [ ] Add real-time notifications (Socket.io)
