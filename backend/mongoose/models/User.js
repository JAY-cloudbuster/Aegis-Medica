/**
 * Aegis Medical — User Model
 * ============================
 * Mongoose schema for user accounts with security features:
 * - bcrypt password hashing (10 rounds)
 * - Account locking after failed attempts
 * - MFA (OTP) support
 * - Email verification tokens
 * - Role-Based Access Control (admin, doctor, patient)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = 10;
const MAX_FAILED_ATTEMPTS = parseInt(process.env.MAX_FAILED_ATTEMPTS) || 3;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [50, 'Username must be under 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  role: {
    type: String,
    required: true,
    enum: {
      values: ['admin', 'doctor', 'patient'],
      message: 'Role must be admin, doctor, or patient',
    },
    default: 'patient',
  },

  // ── Email Verification ──
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: null },

  // ── MFA / OTP ──
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },

  // ── Account Locking ──
  failedAttempts: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false },
  lockedAt: { type: Date, default: null },

  // ── Session Tracking ──
  lastLogin: { type: Date, default: null },
  lastLoginIP: { type: String, default: null },

}, {
  timestamps: true, // adds createdAt, updatedAt
});

// ── Pre-save: Hash password with bcrypt ──
userSchema.pre('save', async function (next) {
  // Only hash if password was modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ── Instance method: Compare password ──
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: Increment failed attempts & lock if needed ──
userSchema.methods.incrementFailedAttempts = async function () {
  this.failedAttempts += 1;
  if (this.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    this.isLocked = true;
    this.lockedAt = new Date();
  }
  await this.save();
};

// ── Instance method: Reset failed attempts on successful login ──
userSchema.methods.resetFailedAttempts = async function () {
  this.failedAttempts = 0;
  this.isLocked = false;
  this.lockedAt = null;
  await this.save();
};

// ── Instance method: Unlock account (admin action) ──
userSchema.methods.unlockAccount = async function () {
  this.failedAttempts = 0;
  this.isLocked = false;
  this.lockedAt = null;
  await this.save();
};

// ── Remove sensitive fields from JSON output ──
userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  delete obj.verificationToken;
  delete obj.__v;
  return obj;
};

// ── Index for performance ──
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isLocked: 1 });

module.exports = mongoose.model('User', userSchema);
