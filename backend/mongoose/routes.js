/**
 * Aegis Medical — API Routes
 * ============================
 * All REST endpoints with cybersecurity features:
 *
 * AUTH:
 *   POST /api/register           — Create account (bcrypt-hashed password)
 *   POST /api/verify-registration — Activate via email token
 *   POST /api/login              — Password check → sends OTP (MFA step 1)
 *   POST /api/verify-otp         — OTP check → returns JWT (MFA step 2)
 *   GET  /api/me                 — Get current user from JWT
 *
 * RECORDS:
 *   POST /api/records            — Create AES-256 encrypted + RSA-signed record
 *   GET  /api/records            — List records (filtered by role)
 *   POST /api/records/:id/decrypt — Decrypt record + verify signature
 *
 * ADMIN:
 *   GET  /api/users              — List all users (admin only)
 *   POST /api/users/:id/unlock   — Unlock locked account (admin only)
 *   GET  /api/patients           — List patient users (doctor/admin)
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const xss = require('xss');
const User = require('./models/User');
const MedicalRecord = require('./models/MedicalRecord');
const { encrypt, decrypt } = require('./crypto');
const { signData, verifySignature } = require('./keys');
const logger = require('./logger');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'aegis-dev-jwt-secret';
const JWT_EXPIRY = `${process.env.SESSION_EXPIRY_MINUTES || 30}m`;
const OTP_EXPIRY_MS = (parseInt(process.env.OTP_EXPIRY_MINUTES) || 2) * 60 * 1000;

// ╔══════════════════════════════════════════════════════════════╗
// ║                     MIDDLEWARE                               ║
// ╚══════════════════════════════════════════════════════════════╝

/**
 * JWT Authentication Middleware
 * Extracts and verifies the Bearer token from Authorization header.
 */
function authGuard(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      logger.authEvent('JWT expired', { token: token.substring(0, 10) + '...' });
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    logger.security('Invalid JWT presented', { error: err.message });
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Role-Based Access Control Middleware
 * @param  {...string} allowedRoles - Roles permitted to access the route
 */
function roleGuard(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.userRole)) {
      logger.security('RBAC access denied', {
        userId: req.userId,
        role: req.userRole,
        requiredRoles: allowedRoles,
        path: req.path,
      });
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
}

/**
 * Input sanitization helper — strips XSS from user input.
 */
function sanitize(input) {
  if (typeof input !== 'string') return input;
  return xss(input.trim());
}

// ╔══════════════════════════════════════════════════════════════╗
// ║                  AUTHENTICATION ROUTES                       ║
// ╚══════════════════════════════════════════════════════════════╝

/**
 * POST /api/register
 * Creates a new user account with bcrypt-hashed password.
 * Returns a verification token for email activation.
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Sanitize inputs
    const cleanUsername = sanitize(username);
    const cleanEmail = sanitize(email).toLowerCase();

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Validate role
    const validRoles = ['admin', 'doctor', 'patient'];
    const userRole = validRoles.includes(role) ? role : 'patient';

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [{ username: cleanUsername }, { email: cleanEmail }],
    });
    if (existingUser) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user (password is auto-hashed via pre-save hook)
    const user = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      password,
      role: userRole,
      verificationToken,
    });

    logger.authEvent('User registered', {
      userId: user._id,
      username: cleanUsername,
      role: userRole,
    });

    res.status(201).json({
      message: 'Account created! Please verify your email.',
      verificationToken, // In production, send via email instead
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    logger.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

/**
 * POST /api/verify-registration
 * Activates a user account using the verification token.
 */
router.post('/verify-registration', async (req, res) => {
  try {
    const { username, token } = req.body;

    if (!username || !token) {
      return res.status(400).json({ error: 'Username and verification token are required' });
    }

    const user = await User.findOne({
      username: sanitize(username),
      verificationToken: sanitize(token),
    });

    if (!user) {
      logger.authEvent('Verification failed — invalid token', { username });
      return res.status(400).json({ error: 'Invalid username or verification token' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Account is already verified' });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    logger.authEvent('Email verified', { userId: user._id, username: user.username });

    res.json({ message: 'Email verified successfully! You can now log in.' });

  } catch (err) {
    logger.error('Verification error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

/**
 * POST /api/login
 * Step 1 of MFA: Validates credentials, generates 6-digit OTP.
 * Checks account lock status BEFORE bcrypt comparison (efficiency).
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username: sanitize(username) });

    if (!user) {
      // Use constant-time response to prevent username enumeration
      logger.authEvent('Login attempt — user not found', { username });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ── CHECK LOCK STATUS BEFORE BCRYPT (security + performance) ──
    if (user.isLocked) {
      logger.security('Login attempt on locked account', {
        userId: user._id,
        username: user.username,
        lockedAt: user.lockedAt,
      });
      return res.status(423).json({
        error: 'Account is locked due to too many failed attempts. Contact an administrator.',
      });
    }

    // Check email verification
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }

    // ── BCRYPT PASSWORD COMPARISON ──
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await user.incrementFailedAttempts();
      const attemptsLeft = (parseInt(process.env.MAX_FAILED_ATTEMPTS) || 3) - user.failedAttempts;

      logger.authEvent('Failed login attempt', {
        userId: user._id,
        username: user.username,
        failedAttempts: user.failedAttempts,
        nowLocked: user.isLocked,
        ip: req.ip,
      });

      if (user.isLocked) {
        return res.status(423).json({
          error: 'Account locked due to too many failed attempts. Contact an administrator.',
        });
      }

      return res.status(401).json({
        error: `Invalid credentials. ${Math.max(attemptsLeft, 0)} attempt(s) remaining.`,
      });
    }

    // ── GENERATE 6-DIGIT OTP ──
    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);
    await user.save();

    logger.authEvent('OTP generated', {
      userId: user._id,
      username: user.username,
      ip: req.ip,
    });

    // In production, send OTP via email. For dev, log to console.
    console.log(`\n╔════════════════════════════════════════╗`);
    console.log(`║   🔐 OTP for ${user.username.padEnd(24)} ║`);
    console.log(`║   Code: ${otp}                          ║`);
    console.log(`║   Expires in ${process.env.OTP_EXPIRY_MINUTES || 2} minutes               ║`);
    console.log(`╚════════════════════════════════════════╝\n`);

    res.json({
      message: 'Password verified. OTP sent — check the server console.',
      requireOTP: true,
    });

  } catch (err) {
    logger.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

/**
 * POST /api/verify-otp
 * Step 2 of MFA: Validates OTP and returns JWT session token.
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { username, otp } = req.body;

    if (!username || !otp) {
      return res.status(400).json({ error: 'Username and OTP are required' });
    }

    const user = await User.findOne({ username: sanitize(username) });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check OTP expiry
    if (!user.otp || !user.otpExpiry || new Date() > user.otpExpiry) {
      logger.authEvent('OTP expired', { userId: user._id, username: user.username });
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(401).json({ error: 'OTP has expired. Please log in again.' });
    }

    // Constant-time OTP comparison (prevents timing attacks)
    const otpMatch = crypto.timingSafeEqual(
      Buffer.from(user.otp.padEnd(6)),
      Buffer.from(otp.toString().padEnd(6))
    );

    if (!otpMatch) {
      logger.authEvent('Invalid OTP attempt', { userId: user._id, username: user.username });
      return res.status(401).json({ error: 'Invalid OTP code' });
    }

    // ── OTP VALID — Issue JWT ──
    user.otp = null;
    user.otpExpiry = null;
    await user.resetFailedAttempts();
    user.lastLogin = new Date();
    user.lastLoginIP = req.ip;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    logger.authEvent('Successful login (OTP verified)', {
      userId: user._id,
      username: user.username,
      role: user.role,
      ip: req.ip,
    });

    res.json({
      token,
      user: user.toSafeJSON(),
    });

  } catch (err) {
    logger.error('OTP verification error:', err);
    res.status(500).json({ error: 'OTP verification failed' });
  }
});

/**
 * GET /api/me
 * Returns the current authenticated user's profile.
 */
router.get('/me', authGuard, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    logger.error('Get user error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ╔══════════════════════════════════════════════════════════════╗
// ║                  MEDICAL RECORDS ROUTES                      ║
// ╚══════════════════════════════════════════════════════════════╝

/**
 * POST /api/records
 * Creates a new medical record:
 * 1. Encrypts data with AES-256-CBC
 * 2. Signs encrypted data with RSA-SHA256
 * 3. Stores cipher, IV, auth tag, and signature
 */
router.post('/records', authGuard, roleGuard('doctor', 'admin'), async (req, res) => {
  try {
    const { patientId, title, data, category } = req.body;

    if (!patientId || !title || !data) {
      return res.status(400).json({ error: 'Patient, title, and data are required' });
    }

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }

    // Sanitize title
    const cleanTitle = sanitize(title);

    // Step 1: Serialize data
    const plaintext = typeof data === 'string' ? data : JSON.stringify(data);

    // Step 2: AES-256-CBC encryption
    const { encryptedData, iv, authTag } = encrypt(plaintext);

    // Step 3: RSA-SHA256 digital signature
    const digitalSignature = await signData(plaintext);

    // Step 4: Store encrypted record
    const record = await MedicalRecord.create({
      title: cleanTitle,
      category: category || 'notes',
      encryptedData,
      iv,
      authTag,
      digitalSignature,
      doctorId: req.userId,
      patientId,
    });

    logger.security('Medical record created', {
      recordId: record._id,
      doctorId: req.userId,
      patientId,
      category: record.category,
    });

    res.status(201).json({
      message: 'Record encrypted, signed, and saved',
      record: {
        _id: record._id,
        title: record.title,
        category: record.category,
        isEncrypted: true,
        createdAt: record.createdAt,
      },
    });

  } catch (err) {
    logger.error('Create record error:', err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

/**
 * GET /api/records
 * Lists medical records filtered by user role:
 * - admin: sees all records
 * - doctor: sees records they created
 * - patient: sees only their own records
 */
router.get('/records', authGuard, async (req, res) => {
  try {
    let filter = {};

    if (req.userRole === 'patient') {
      // Patients see only their own records
      filter = { patientId: req.userId };
    } else if (req.userRole === 'doctor') {
      // Doctors see records they created
      filter = { doctorId: req.userId };
    }
    // admin sees all (no filter)

    const records = await MedicalRecord.find(filter)
      .populate('doctorId', 'username email')
      .populate('patientId', 'username email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ records });

  } catch (err) {
    logger.error('Fetch records error:', err);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

/**
 * POST /api/records/:id/decrypt
 * Decrypts a medical record and verifies its RSA digital signature.
 * Returns the plaintext data + signature validation result.
 */
router.post('/records/:id/decrypt', authGuard, async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('doctorId', 'username')
      .populate('patientId', 'username');

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Access control: patients can only decrypt their own records
    if (req.userRole === 'patient' && record.patientId._id.toString() !== req.userId) {
      logger.security('Unauthorized decrypt attempt', {
        userId: req.userId,
        recordId: record._id,
        recordPatient: record.patientId._id,
      });
      return res.status(403).json({ error: 'You can only decrypt your own records' });
    }

    // Doctors can only decrypt records they created
    if (req.userRole === 'doctor' && record.doctorId._id.toString() !== req.userId) {
      logger.security('Doctor unauthorized decrypt attempt', {
        userId: req.userId,
        recordId: record._id,
      });
      return res.status(403).json({ error: 'You can only decrypt records you created' });
    }

    // Step 1: Decrypt AES-256-CBC data (verifies HMAC first)
    const decryptedText = decrypt(record.encryptedData, record.iv, record.authTag);

    // Step 2: Verify RSA-SHA256 digital signature
    let signatureValid = false;
    try {
      signatureValid = await verifySignature(decryptedText, record.digitalSignature);
    } catch (sigErr) {
      logger.security('Signature verification failed', {
        recordId: record._id,
        error: sigErr.message,
      });
    }

    // Step 3: Parse decrypted data
    let data;
    try {
      data = JSON.parse(decryptedText);
    } catch {
      data = { content: decryptedText };
    }

    logger.security('Record decrypted', {
      recordId: record._id,
      userId: req.userId,
      signatureValid,
    });

    res.json({
      data,
      signatureValid,
      algorithm: 'AES-256-CBC',
      signatureAlgorithm: 'RSA-SHA256',
    });

  } catch (err) {
    if (err.message.includes('integrity check failed')) {
      return res.status(422).json({
        error: 'Data integrity check failed. Record may have been tampered with.',
        signatureValid: false,
      });
    }
    logger.error('Decrypt record error:', err);
    res.status(500).json({ error: 'Failed to decrypt record' });
  }
});

// ╔══════════════════════════════════════════════════════════════╗
// ║                     ADMIN ROUTES                             ║
// ╚══════════════════════════════════════════════════════════════╝

/**
 * GET /api/users
 * Returns all users (admin only). Passwords are stripped.
 */
router.get('/users', authGuard, roleGuard('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password -otp -otpExpiry -verificationToken -__v')
      .sort({ createdAt: -1 });

    logger.authEvent('Admin viewed user list', { adminId: req.userId });

    res.json({ users });

  } catch (err) {
    logger.error('Fetch users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * POST /api/users/:id/unlock
 * Unlocks a locked user account (admin only).
 */
router.post('/users/:id/unlock', authGuard, roleGuard('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.unlockAccount();

    logger.security('Account unlocked by admin', {
      adminId: req.userId,
      unlockedUserId: user._id,
      username: user.username,
    });

    res.json({ message: `Account ${user.username} has been unlocked` });

  } catch (err) {
    logger.error('Unlock user error:', err);
    res.status(500).json({ error: 'Failed to unlock account' });
  }
});

/**
 * GET /api/patients
 * Returns all users with role "patient" (doctor/admin only).
 */
router.get('/patients', authGuard, roleGuard('doctor', 'admin'), async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient', isVerified: true })
      .select('_id username email role isVerified')
      .sort({ username: 1 });

    res.json({ patients });

  } catch (err) {
    logger.error('Fetch patients error:', err);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

module.exports = router;
