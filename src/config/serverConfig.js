import env from './env.js';

// Helper parsing number aman
const safeParseInt = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
};

// Helper parsing origins
const parseAllowedOrigins = () => {
  // 🚫 Jangan pernah pakai "*" jika credentials aktif
  if (env.CORS_ALLOWED_ORIGINS === '*') {
    return env.NODE_ENV === 'production'
      ? ['https://your-frontend-domain.com'] // ⛔ HARUS DIGANTI
      : [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://localhost:5174',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:5174',
        ];
  }

  try {
    if (env.CORS_ALLOWED_ORIGINS?.startsWith('[')) {
      return JSON.parse(env.CORS_ALLOWED_ORIGINS);
    }

    if (env.CORS_ALLOWED_ORIGINS) {
      return env.CORS_ALLOWED_ORIGINS
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }

    // Default fallback
    return env.NODE_ENV === 'production'
      ? ['https://your-frontend-domain.com'] // ⛔ HARUS DIGANTI
      : [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://localhost:5174',
        ];
  } catch {
    console.warn('⚠️ Invalid CORS_ALLOWED_ORIGINS. Using safe defaults.');
    return [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
    ];
  }
};

const serverConfig = {
  /* =====================
     ENV
  ===================== */

  env: env.NODE_ENV || 'development',
  isProduction: env.NODE_ENV === 'production',

  /* =====================
     SERVER
  ===================== */

  port: safeParseInt(env.PORT, 3000),
  host: env.HOST || '0.0.0.0', // ✅ lebih fleksibel

  /* =====================
     RATE LIMIT
  ===================== */

  rateLimit: {
    windowMs: safeParseInt(env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    maxRequests: safeParseInt(env.RATE_LIMIT_MAX_REQUESTS, 100),
  },

  /* =====================
     CORS
  ===================== */

  cors: {
    allowedOrigins: parseAllowedOrigins(),
    credentials: env.CORS_CREDENTIALS !== 'false', // default true
  },

  /* =====================
     API
  ===================== */

  apiBasePath: env.API_BASE_PATH || '/api/v1',
};

export default serverConfig;
