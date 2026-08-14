import app from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 TaskFlow API server running on port ${PORT} [${env.NODE_ENV}]`);
});
