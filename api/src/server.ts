import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { clerkMiddleware, getAuth } from '@clerk/express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { appRouter } from './router';
import { db } from './db';
import { logger } from './common/logger';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins (adjust in production)
app.use(cors());

// Clerk authentication middleware
app.use(clerkMiddleware());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// tRPC endpoint
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req }) => {
      // Also see protectedProcedure in trpc.ts for auth enforcement
      const auth = getAuth(req);

      return {
        db,
        logger,
        auth: auth.userId ? auth : null,
      };
    },
  })
);

app.get('/panel', async (_, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).send('Not Found');
  }

  // Dynamically import renderTrpcPanel only in development
  const { renderTrpcPanel } = await import('trpc-ui');

  return res.send(
    renderTrpcPanel(appRouter, {
      url: `http://localhost:${PORT}/trpc`,
    })
  );
});

// Set up WebSocket server for subscriptions
const wss = new WebSocketServer({ server });
const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext: () => ({
    db,
    logger,
    auth: null, // Note: WebSocket auth is more complex, we'll handle this separately
  }),
});

wss.on('connection', () => {
  logger.info(`WebSocket connection established (${wss.clients.size} total)`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  handler.broadcastReconnectNotification();
  server.close();
});

server.listen(PORT, () => {
  logger.info(`🚀 tRPC API server running on http://localhost:${PORT}`);
  logger.info(`📡 tRPC endpoint: http://localhost:${PORT}/trpc`);
  logger.info(`🔌 WebSocket server ready for subscriptions`);
  logger.info(`❤️  Health check: http://localhost:${PORT}/health`);
});
