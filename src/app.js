import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors'; // ⬅️ tambahkan ini
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import serverConfig from './config/serverConfig.js';
import registerRoutes from './routes/index.js';

const app = express();

/* =====================
   MIDDLEWARE
===================== */

// ⬇️ Tambahkan CORS — letakkan paling awal
const corsOptions = {
  origin: serverConfig.cors.allowedOrigins, // array string atau boolean (misal: ['https://web.example.com'])
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // aktifkan jika butuh cookie/sesi
};

app.use(cors(corsOptions));

app.use(express.json());

const limiter = rateLimit({
  windowMs: serverConfig.rateLimit.windowMs,
  max: serverConfig.rateLimit.maxRequests,
});
app.use(limiter);

/* =====================
   SWAGGER CONFIG
===================== */
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation',
    version: '1.0.0',
    description: 'API documentation using Swagger',
  },
  servers: [
    {
      url: `http://${serverConfig.host}:${serverConfig.port}`,
    },
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
};

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

registerRoutes(app);
app.get('/', (req, res) => {
  res.send('API is running 🚀');
});

export default app;