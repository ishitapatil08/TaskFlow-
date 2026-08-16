import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import openapiSpec from './docs/openapi.json';

const app = express();

// Security middleware — allow Swagger UI to load inline scripts/styles
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS — allow all origins so Swagger UI and external clients can call the API
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root redirect to Swagger UI
app.get('/', (_req, res) => {
  res.redirect('/api-docs');
});

// Swagger UI API Documentation endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

// Healthcheck endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', routes);

// Global error handler
app.use(errorHandler);

export default app;
