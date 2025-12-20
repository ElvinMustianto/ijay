import express from 'express';
import rateLimit from 'express-rate-limit';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import serverConfig from './config/serverConfig.js';
import registerRoutes from './routes/index.js'; // ⬅️ PENTING

const app = express();

/* =====================
   MIDDLEWARE
===================== */
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
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // auth.routes.js, product.routes.js, dll
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

registerRoutes(app); // ⬅️ INI KUNCINYA
app.get('/', (req, res) => {
  res.send('API is running 🚀');
});

export default app;
