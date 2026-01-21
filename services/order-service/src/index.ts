import { createServiceLogger } from '@delivery/shared/logging';

import { createApp } from './app';
import { env } from './infrastructure/config';
import { connectDatabase, disconnectDatabase } from './infrastructure/database';

const logger = createServiceLogger('order-service');

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Order Service running on port ${env.PORT}`);
      logger.info(`📚 API available at http://localhost:${env.PORT}${env.API_PREFIX}`);
      logger.info(`🔧 Environment: ${env.NODE_ENV}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        await disconnectDatabase();
        logger.info('Database connection closed');

        process.exit(0);
      });

      // Force close after 30 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
