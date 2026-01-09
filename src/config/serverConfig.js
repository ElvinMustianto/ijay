import env from './env.js';

// Helper untuk parsing angka aman
const safeParseInt = (value, fallback) => {
  const parsed = Number(value);
  return isNaN(parsed) || parsed < 0 ? fallback : parsed;
};

// Daftar origin yang diizinkan — bisa berupa string[] atau '*' (hanya dev!)
const allowedOrigins = (() => {
  if (env.CORS_ALLOWED_ORIGINS === '*') {
    // ⚠️ Hanya untuk development
    return env.NODE_ENV === 'production'
      ? ['https://your-frontend-domain.com'] // ← ganti sesuai domain frontend Anda (misal: https://thermometrics.hanya.id)
      : '*';
  }

  try {
    // Parse dari string JSON atau comma-separated
    if (env.CORS_ALLOWED_ORIGINS?.startsWith('[')) {
      return JSON.parse(env.CORS_ALLOWED_ORIGINS);
    }
    return env.CORS_ALLOWED_ORIGINS
      ? env.CORS_ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
      : env.NODE_ENV === 'production'
        ? ['https://your-frontend-domain.com'] // ← HARUS DIUBAH
        : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'];
  } catch (e) {
    console.warn('⚠️ Invalid CORS_ALLOWED_ORIGINS format. Falling back to dev defaults.');
    return ['http://localhost:3000', 'http://localhost:5173'];
  }
})();

const serverConfig = {
  // Environment
  env: env.NODE_ENV || 'development',
  isProduction: (env.NODE_ENV || 'development') === 'production',

  // Server
  port: safeParseInt(env.PORT, 3000),
  host: env.HOST || 'localhost', // ✅ lebih friendly daripada 127.0.0.1

  // Rate Limit
  rateLimit: {
    windowMs: safeParseInt(env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000), // 15 menit
    maxRequests: safeParseInt(env.RATE_LIMIT_MAX_REQUESTS, 100),
  },

  // CORS
  cors: {
    allowedOrigins,
    credentials: env.CORS_CREDENTIALS === 'true' || env.NODE_ENV !== 'production',
  },

  // Opsional: untuk Swagger & logging
  apiBasePath: env.API_BASE_PATH || '/api/v1',
};

export default serverConfig;