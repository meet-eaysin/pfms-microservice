import request from 'supertest';

describe('API Gateway E2E', () => {
  const GATEWAY_URL = 'http://localhost:8000';

  describe('Health Checks', () => {
    // We test service health endpoints exposed via Gateway
    it('should return 200 OK for auth-service health', async () => {
      // Mapped to auth-service /api/v1/health
      await request(GATEWAY_URL).get('/api/v1/auth/health').expect(200);
    });

    it('should return 200 OK for user-service health', async () => {
      // Mapped to user-service /api/v1/user/health
      await request(GATEWAY_URL).get('/api/v1/user/health').expect(200);
    });
  });

  describe('Authentication', () => {
    it('should block unauthorized access to protected routes', async () => {
      // user-service profile route is protected by JWT plugin
      await request(GATEWAY_URL).get('/api/v1/user/profile').expect(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should include rate limit headers', async () => {
      const response = await request(GATEWAY_URL).get('/api/v1/auth/health');
      expect(response.headers['x-ratelimit-remaining-minute']).toBeDefined();
    });
  });
});
