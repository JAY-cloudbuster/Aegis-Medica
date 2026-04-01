/**
 * Aegis Medical — System Key Model
 * ===================================
 * Stores RSA key pairs with the private key encrypted at rest.
 */

const mongoose = require('mongoose');

const systemKeySchema = new mongoose.Schema({
  keyId: {
    type: String,
    required: true,
    unique: true,
  },
  publicKey: {
    type: String,
    required: true,
  },
  encryptedPrivateKey: {
    type: String,
    required: true,
  },
  privateKeyIV: {
    type: String,
    required: true,
  },
  privateKeyAuthTag: {
    type: String,
    required: true,
  },
  algorithm: {
    type: String,
    default: 'RSA-2048',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SystemKey', systemKeySchema);
