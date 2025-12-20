import env from './env.js';

const serverConfig = {
  port: env.PORT || 3000,
  host: env.HOST || '127.0.0.1',
  rateLimit: {
    windowMs: Number(env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    maxRequests: Number(env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
};

export default serverConfig;
