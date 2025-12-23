/**
 * E2E Test Setup for Auth Service
 */

import { INestApplication } from '@nestjs/common';

let app: INestApplication | undefined;

beforeAll(async () => {
  // Create test application here when ready
  // const moduleFixture = await Test.createTestingModule({
  //   imports: [AppModule],
  // }).compile();
  // app = moduleFixture.createNestApplication();
  // await app.init();
});

afterAll(async () => {
  if (app) {
    await app.close();
  }
});

export { app };
