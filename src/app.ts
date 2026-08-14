import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import openapiSpec from './docs/openapi.json' assert { type: 'json' };

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
