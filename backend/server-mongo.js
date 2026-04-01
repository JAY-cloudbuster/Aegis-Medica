/**
 * Aegis Medical — Main Server Entry Point
 * ==========================================
 * Express server with comprehensive cybersecurity hardening:
 *
 * ┌──────────────────────────────────────────┐
 * │ Security Layer                            │
 * ├──────────────────────────────────────────┤
 * │ 1. Helmet       — Secure HTTP headers     │
 * │ 2. CORS         — Origin whitelisting     │
 * │ 3. Rate Limiter — Brute-force protection  │
 * │ 4. Body Parser  — Payload size limits     │
 * │ 5. XSS          — Input sanitization      │
 * │ 6. JWT          — Stateless sessions      │
 * │ 7. bcrypt       — Password hashing        │
 * │ 8. AES-256-CBC  — Data encryption         │
 * │ 9. RSA-2048     — Digital signatures      │
 * │ 10. HMAC        — Integrity verification  │
 * │ 11. Account Lock— After 3 failed attempts │
 * │ 12. MFA/OTP     — Two-factor auth         │
 * │ 13. RBAC        — Role-based access ctrl  │
 * │ 14. Audit Log   — Security event tracking │
 * └──────────────────────────────────────────┘
 */

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connectDB, disconnectDB } = require('./mongoose/db');
const { ensureKeys } = require('./mongoose/keys');
const routes = require('./mongoose/routes');
const logger = require('./mongoose/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// ╔══════════════════════════════════════════════════════════════╗
// ║              SECURITY MIDDLEWARE STACK                        ║
// ╚══════════════════════════════════════════════════════════════╝

// ── 1. Helmet: Secure HTTP Headers ──
// Sets X-Content-Type-Options, X-Frame-Options, X-XSS-Protection,
// Strict-Transport-Security, Content-Security-Policy, etc.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow Vite dev proxy
}));

// ── 2. CORS: Origin Whitelisting ──
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://aegis-medica.vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── 3. Global Rate Limiter ──
const globalLimiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// ── 4. Stricter Rate Limiter for Auth Endpoints ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message: { error: 'Too many authentication attempts. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip, // Rate limit by IP
});
app.use('/api/login', authLimiter);
app.use('/api/verify-otp', authLimiter);
app.use('/api/register', authLimiter);

// ── 5. Body Parser with Size Limits ──
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// ── 6. Request Logging Middleware ──
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`, {
        ip: req.ip,
      });
    }
  });
  next();
});

// ── 7. Security Headers (additional) ──
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'Aegis-Medica');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Request-Id', require('crypto').randomUUID());
  next();
});

// ╔══════════════════════════════════════════════════════════════╗
// ║                      API ROUTES                              ║
// ╚══════════════════════════════════════════════════════════════╝

app.use('/api', routes);

// ── Health check endpoint ──
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    security: {
      encryption: 'AES-256-CBC',
      signatures: 'RSA-SHA256',
      hashing: 'bcrypt (10 rounds)',
      auth: 'JWT + OTP (MFA)',
      headers: 'Helmet',
      rateLimiting: 'Active',
    },
  });
});

// ── 404 handler ──
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ── Error handler ──
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

// ╔══════════════════════════════════════════════════════════════╗
// ║                      STARTUP                                 ║
// ╚══════════════════════════════════════════════════════════════╝

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize RSA key pair
    await ensureKeys();

    // Start Express server
    app.listen(PORT, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════════════════════╗');
      console.log('║                                                              ║');
      console.log('║   🌿  AEGIS MEDICAL — Cyber-Secure Backend                  ║');
      console.log(`║   🌐  Server running on http://localhost:${PORT}               ║`);
      console.log('║                                                              ║');
      console.log('║   Security Stack:                                            ║');
      console.log('║   ├─ 🔒 Helmet (HTTP security headers)                      ║');
      console.log('║   ├─ 🚦 Rate Limiting (brute-force protection)              ║');
      console.log('║   ├─ 🔑 AES-256-CBC (medical data encryption)               ║');
      console.log('║   ├─ ✍️  RSA-2048 (digital signatures)                       ║');
      console.log('║   ├─ 🔐 bcrypt (password hashing, 10 rounds)                ║');
      console.log('║   ├─ 📱 MFA/OTP (two-factor authentication)                 ║');
      console.log('║   ├─ 🛡️  RBAC (admin / doctor / patient)                     ║');
      console.log('║   ├─ 🧹 XSS sanitization                                   ║');
      console.log('║   ├─ 🔏 HMAC-SHA256 (data integrity)                        ║');
      console.log('║   └─ 📝 Audit logging (Winston)                             ║');
      console.log('║                                                              ║');
      console.log('╚══════════════════════════════════════════════════════════════╝');
      console.log('');
    });

  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

// ── Graceful shutdown ──
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down...');
  await disconnectDB();
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

startServer();
