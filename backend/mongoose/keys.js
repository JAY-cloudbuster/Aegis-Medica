/**
 * Aegis Medical — RSA-2048 Key Management
 * ==========================================
 * Generates, stores, and manages RSA key pairs for digital signatures.
 *
 * Security features:
 * - RSA-2048 key pair generated at startup
 * - Private key encrypted with AES-256-GCM before storage
 * - RSA-SHA256 signatures on every medical record
 * - Keys stored in MongoDB (survives restarts with persistent DB)
 */

const crypto = require('crypto');
const SystemKey = require('./models/SystemKey');
const logger = require('./logger');

const RSA_MODULUS_LENGTH = 2048;
const SIGNATURE_ALGORITHM = 'RSA-SHA256';

/**
 * Get or create the system RSA key pair.
 * Private key is stored AES-256-GCM encrypted in the database.
 */
async function ensureKeys() {
  let keyDoc = await SystemKey.findOne({ keyId: 'system-rsa-primary' });

  if (keyDoc) {
    logger.cryptoEvent('RSA key pair loaded from database');
    return keyDoc;
  }

  // Generate fresh RSA-2048 key pair
  logger.cryptoEvent('Generating new RSA-2048 key pair...');
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: RSA_MODULUS_LENGTH,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  // Encrypt private key with AES-256-GCM before storing
  const encryptedPrivate = encryptPrivateKey(privateKey);

  keyDoc = await SystemKey.create({
    keyId: 'system-rsa-primary',
    publicKey,
    encryptedPrivateKey: encryptedPrivate.encrypted,
    privateKeyIV: encryptedPrivate.iv,
    privateKeyAuthTag: encryptedPrivate.authTag,
    algorithm: 'RSA-2048',
    createdAt: new Date(),
  });

  logger.cryptoEvent('RSA-2048 key pair generated and stored', {
    keyId: keyDoc.keyId,
    algorithm: 'RSA-2048',
  });

  return keyDoc;
}

/**
 * Encrypt the RSA private key using AES-256-GCM.
 */
function encryptPrivateKey(privateKeyPem) {
  const passphrase = process.env.RSA_PASSPHRASE || 'aegis-rsa-dev-passphrase';
  const key = crypto.scryptSync(passphrase, 'aegis-rsa-salt-v1', 32);
  const iv = crypto.randomBytes(12); // GCM uses 12-byte IV
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(privateKeyPem, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag,
  };
}

/**
 * Decrypt the stored RSA private key.
 */
function decryptPrivateKey(encryptedHex, ivHex, authTagHex) {
  const passphrase = process.env.RSA_PASSPHRASE || 'aegis-rsa-dev-passphrase';
  const key = crypto.scryptSync(passphrase, 'aegis-rsa-salt-v1', 32);
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Get the decrypted private key PEM string.
 */
async function getPrivateKey() {
  const keyDoc = await ensureKeys();
  return decryptPrivateKey(
    keyDoc.encryptedPrivateKey,
    keyDoc.privateKeyIV,
    keyDoc.privateKeyAuthTag
  );
}

/**
 * Get the public key PEM string.
 */
async function getPublicKey() {
  const keyDoc = await ensureKeys();
  return keyDoc.publicKey;
}

/**
 * Sign data using RSA-SHA256 with the system private key.
 * @param {string} data - The data to sign (JSON string)
 * @returns {string} Base64-encoded digital signature
 */
async function signData(data) {
  const privateKeyPem = await getPrivateKey();
  const sign = crypto.createSign(SIGNATURE_ALGORITHM);
  sign.update(data);
  sign.end();
  const signature = sign.sign(privateKeyPem, 'base64');

  logger.cryptoEvent('RSA-SHA256 signature created', {
    dataLength: data.length,
    signatureLength: signature.length,
  });

  return signature;
}

/**
 * Verify an RSA-SHA256 digital signature.
 * @param {string} data - The original data
 * @param {string} signature - Base64-encoded signature to verify
 * @returns {boolean} True if signature is valid
 */
async function verifySignature(data, signature) {
  const publicKeyPem = await getPublicKey();
  const verify = crypto.createVerify(SIGNATURE_ALGORITHM);
  verify.update(data);
  verify.end();

  const isValid = verify.verify(publicKeyPem, signature, 'base64');

  logger.cryptoEvent('RSA-SHA256 signature verification', {
    valid: isValid,
  });

  return isValid;
}

module.exports = { ensureKeys, signData, verifySignature, getPublicKey };
