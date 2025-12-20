import express from 'express';
import rateLimit from 'express-rate-limit';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import serverConfig from './config/serverConfig.js';

const app = express();

// Middleware
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: serverConfig.rateLimit.windowMs,
  max: serverConfig.rateLimit.maxRequests,
});
app.use(limiter);

// Swagger definition
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
};

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.js'], // pastikan path ini BENAR
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Swagger endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check (debug helper)
app.get('/', (req, res) => {
  res.send('API is running 🚀');
});

export default app;
