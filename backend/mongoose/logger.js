/**
 * Aegis Medical — Audit Logger
 * ==============================
 * Winston-based logger with structured JSON output.
 * Logs security events, auth attempts, and crypto operations.
 */

const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  })
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Console output (always)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
    // File output — general logs
    new winston.transports.File({
      filename: path.join(__dirname, '..', 'logs', 'combined.log'),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    // File output — errors only
    new winston.transports.File({
      filename: path.join(__dirname, '..', 'logs', 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3,
    }),
    // File output — security audit trail
    new winston.transports.File({
      filename: path.join(__dirname, '..', 'logs', 'security.log'),
      level: 'info',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 10,
    }),
  ],
});

// ── Security-specific log helpers ──
logger.security = (event, details = {}) => {
  logger.info(`[SECURITY] ${event}`, { security: true, ...details });
};

logger.authEvent = (event, details = {}) => {
  logger.info(`[AUTH] ${event}`, { auth: true, ...details });
};

logger.cryptoEvent = (event, details = {}) => {
  logger.info(`[CRYPTO] ${event}`, { crypto: true, ...details });
};

module.exports = logger;
