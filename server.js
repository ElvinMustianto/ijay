import http from 'http';
import app from './src/app.js';
import initConfig from './src/config/index.js';
import serverConfig from './src/config/serverConfig.js';

const startServer = async () => {
  try {
    await initConfig();

    const server = http.createServer(app);

    server.listen(serverConfig.port, serverConfig.host, () => {
      console.log(`✅ Server running at http://${serverConfig.host}:${serverConfig.port}`);
      console.log(`📘 Swagger available at http://${serverConfig.host}:${serverConfig.port}/api-docs`);
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
