import http from 'http';
import app from './src/app.js';
import initConfig from './src/config/index.js';
import serverConfig from './src/config/serverConfig.js';

// ✅ 1. Import cors (pastikan sudah diinstall: npm install cors)
import cors from 'cors';

// ✅ 2. Terapkan CORS ke Express app *sebelum* server dibuat
// Letakkan ini DI LUAR startServer, atau pastikan dijalankan sebelum `http.createServer`
app.use(cors({
  origin: [
    'http://localhost:5173', // Vite default
    'http://localhost:3000', // jika ada frontend lain
  ],
  credentials: true, // jika pakai cookie/auth
  optionsSuccessStatus: 200 // untuk legacy browser
}));

const startServer = async () => {
  try {
    await initConfig();

    const server = http.createServer(app);

    server.listen(serverConfig.port, serverConfig.host, () => {
      console.log(`✅ Server running at http://${serverConfig.host}:${serverConfig.port}`);
      console.log(`📘 Swagger available at http://${serverConfig.host}:${serverConfig.port}/api-docs`);
      console.log(`🌐 CORS enabled for: http://localhost:5173`);
    });

    // ✅ Graceful shutdown
    const signals = ['SIGINT', 'SIGTERM'];
    signals.forEach(signal => {
      process.on(signal, () => {
        console.log(`\nReceived ${signal}, shutting down gracefully...`);
        server.close(() => {
          console.log('✅ Server closed.');
          process.exit(0);
        });
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();