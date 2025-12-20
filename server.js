import http from 'http';
import app from './src/app.js';
import initConfig from './src/config/index.js';
import serverConfig from './src/config/serverConfig.js';

const startServer = async () => {
  try {
    await initConfig();

    const server = http.createServer(app);

    server.listen(serverConfig.port, serverConfig.host, () => {
      console.log(`Server running at http://${serverConfig.host}:${serverConfig.port}`);
      console.log(`Swagger available at http://${serverConfig.host}:${serverConfig.port}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
