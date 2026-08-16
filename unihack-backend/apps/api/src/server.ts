/**
 * Fastify Server Entry Point
 * Starts HTTP server and registers graceful shutdown handlers
 */

import { buildApp } from './app';
import { env } from './config/env';

async function startServer(): Promise<void> {
  try {
    const app = await buildApp();

    const address = await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    app.log.info(`UniHack API Server listening at: ${address}`);
    app.log.info(`Swagger API Documentation available at: ${address}/api/docs`);
    app.log.info(`Environment: ${env.NODE_ENV}`);

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      app.log.info(`Received ${signal}. Starting graceful shutdown...`);
      try {
        await app.close();
        app.log.info('Server closed successfully.');
        process.exit(0);
      } catch (err) {
        app.log.error(err, 'Error during graceful shutdown.');
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    process.on('unhandledRejection', (reason) => {
      app.log.error(reason, 'Unhandled Promise Rejection detected:');
    });

    process.on('uncaughtException', (err) => {
      app.log.fatal(err, 'Uncaught Exception detected:');
      process.exit(1);
    });
  } catch (err) {
    console.error('Fatal error during server startup:', err);
    process.exit(1);
  }
}

// Start server on execution
startServer();

export { startServer };
