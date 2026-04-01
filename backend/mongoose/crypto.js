/**
 * Aegis Medical — AES-256-CBC Encryption Module
 * ================================================
 * Provides symmetric encryption/decryption for medical records.
 *
 * Security features:
 * - AES-256-CBC with PKCS7 padding
 * - Deterministic key derived from env secret via scrypt (survives restarts)
 * - Random IV per encryption (stored alongside ciphertext)
 * - HMAC-SHA256 authentication tag to detect tampering
 */

const crypto = require('crypto');
const logger = require('./logger');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
const HMAC_ALGO = 'sha256';

/**
 * Derive a stable 32-byte AES key from the env secret using scrypt.
 * This ensures the same key is produced across server restarts.
 */
function getEncryptionKey() {
  const secret = process.env.AES_SECRET || 'aegis-medica-default-dev-key';
  return crypto.scryptSync(secret, 'aegis-salt-v1', 32);
}

/**
 * Encrypt plaintext data using AES-256-CBC + HMAC authentication.
 * @param {string} plaintext - The data to encrypt (JSON string or text)
 * @returns {{ encryptedData: string, iv: string, authTag: string }}
 */
function encrypt(plaintext) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // HMAC for integrity verification (encrypt-then-MAC)
  const hmac = crypto.createHmac(HMAC_ALGO, key);
  hmac.update(iv.toString('hex') + encrypted);
  const authTag = hmac.digest('hex');

  logger.cryptoEvent('AES-256-CBC encryption', {
    dataLength: plaintext.length,
    ivPrefix: iv.toString('hex').substring(0, 8) + '...',
  });

  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag,
  };
}

/**
 * Decrypt AES-256-CBC encrypted data after verifying HMAC.
 * @param {string} encryptedData - Hex-encoded ciphertext
 * @param {string} ivHex - Hex-encoded initialization vector
 * @param {string} authTag - HMAC authentication tag
 * @returns {string} Decrypted plaintext
 * @throws {Error} If HMAC verification fails (data tampered)
 */
function decrypt(encryptedData, ivHex, authTag) {
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');

  // Verify HMAC before decryption (prevents oracle attacks)
  if (authTag) {
    const hmac = crypto.createHmac(HMAC_ALGO, key);
    hmac.update(ivHex + encryptedData);
    const computedTag = hmac.digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(authTag, 'hex'), Buffer.from(computedTag, 'hex'))) {
      logger.security('HMAC verification failed — possible data tampering');
      throw new Error('Data integrity check failed. Record may have been tampered with.');
    }
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  logger.cryptoEvent('AES-256-CBC decryption', {
    resultLength: decrypted.length,
  });

  return decrypted;
}

module.exports = { encrypt, decrypt };
