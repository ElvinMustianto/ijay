import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import serverConfig from './config/serverConfig.js';
import registerRoutes from './routes/index.js';

const app = express();

/* =====================
   CORS (PALING AWAL)
===================== */

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (serverConfig.cors.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

/* =====================
   MIDDLEWARE
===================== */

app.use(express.json());

app.use(rateLimit({
  windowMs: serverConfig.rateLimit.windowMs,
  max: serverConfig.rateLimit.maxRequests,
}));

/* =====================
   SWAGGER
===================== */

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation using Swagger',
    },
    servers: [
      { url: `http://${serverConfig.host}:${serverConfig.port}` },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

registerRoutes(app);

app.get('/', (req, res) => {
  res.send('API is running 🚀');
});

export default app;
