import dotenv from 'dotenv';
import connectDB from './db.js';
import serverConfig from './serverConfig.js';

dotenv.config();

const initConfig = async () => {
  await connectDB();
  console.log('Server configuration:', serverConfig);
};

export default initConfig;
export { serverConfig, connectDB };