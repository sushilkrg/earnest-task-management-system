import app from './app';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/database';

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`📍 API URL: http://localhost:${env.PORT}/api`);
    });

    const gracefulShutdown = async () => {
      console.log('\n⏳ Shutting down gracefully...');
      
      server.close(async () => {
        await disconnectDB();
        console.log('✅ Server closed');
        process.exit(0);
      });

      setTimeout(() => {
        console.error('⚠️ Forced shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
