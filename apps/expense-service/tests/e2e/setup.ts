/**
 * E2E Test Setup for Expense Service
 */

import { Express } from 'express';
import { Server } from 'http';

let app: Express | undefined;
let server: Server | undefined;

beforeAll(async () => {
  // Create test application here when ready
  // app = createApp();
});

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server!.close((err: Error | undefined) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
});

export { app, server };
