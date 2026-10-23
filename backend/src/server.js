import { createApp } from './app.js';
import { env } from './config/env.js';
import { database } from './config/database.js';

const app = createApp();
const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌾 GramSetu (ग्रामसेतु) Backend Server`);
  console.log(`🚀 Running at: http://localhost:${PORT}`);
  console.log(`🩺 Health API: http://localhost:${PORT}${env.API_PREFIX}/health`);
  console.log(`💾 Database Mode: [${database.mode.toUpperCase()}]`);
  console.log(`🛡️  Demo Mode: ${env.DEMO_MODE ? 'ACTIVE' : 'DISABLED'}`);
  console.log(`=======================================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Closing HTTP server gracefully...');
  server.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received. Shutting down...');
  server.close(() => {
    process.exit(0);
  });
});

export default server;
