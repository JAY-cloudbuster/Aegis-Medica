/**
 * Aegis Medical — Medical Record Model
 * =======================================
 * Stores encrypted medical data with digital signatures.
 *
 * Each record has:
 * - AES-256-CBC encrypted data
 * - HMAC authentication tag (integrity)
 * - RSA-SHA256 digital signature (authenticity)
 * - References to doctor (creator) and patient
 */

const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Record title is required'],
    trim: true,
    maxlength: [200, 'Title must be under 200 characters'],
  },
  category: {
    type: String,
    required: true,
    enum: ['diagnosis', 'prescription', 'lab-result', 'imaging', 'notes'],
    default: 'notes',
  },

  // ── Encrypted Data ──
  encryptedData: {
    type: String,
    required: true,
  },
  iv: {
    type: String,
    required: true,
  },
  authTag: {
    type: String,
    required: true,
  },

  // ── Digital Signature ──
  digitalSignature: {
    type: String,
    required: true,
  },

  // ── Metadata ──
  isEncrypted: {
    type: Boolean,
    default: true,
  },

  // ── Relationships ──
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

}, {
  timestamps: true,
});

// ── Indexes ──
medicalRecordSchema.index({ patientId: 1 });
medicalRecordSchema.index({ doctorId: 1 });
medicalRecordSchema.index({ category: 1 });
medicalRecordSchema.index({ createdAt: -1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
