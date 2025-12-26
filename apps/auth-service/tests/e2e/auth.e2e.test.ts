import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthModule } from '../../src/auth.module';
import {
  UserRepository,
  SessionRepository,
  PasswordEncoder,
  TokenService,
} from '../../src/domain/ports/repositories';
import { PasswordResetTokenRepository } from '../../src/domain/ports/password-reset-token.repository';
import { MfaService } from '../../src/domain/ports/mfa.service';
import { PrismaService } from '../../src/infrastructure/config/prisma.service';
import { EventPublisher } from '../../src/domain/ports/event-publisher';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  // Mock repositories
  const mockUserRepository = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockSessionRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    deleteById: jest.fn(),
    deleteByUserId: jest.fn(),
  };

  const mockPasswordResetTokenRepository = {
    save: jest.fn(),
    findByToken: jest.fn(),
    delete: jest.fn(),
  };

  const mockMfaService = {
    generateSecret: jest.fn(),
    generateQrCode: jest.fn(),
    verify: jest.fn(),
  };

  const mockPrismaService = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  const mockEventPublisher = {
    publishUserCreated: jest.fn(),
    publishForgotPassword: jest.fn(),
    publishPasswordChanged: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(UserRepository)
      .useValue(mockUserRepository)
      .overrideProvider(SessionRepository)
      .useValue(mockSessionRepository)
      .overrideProvider(PasswordResetTokenRepository)
      .useValue(mockPasswordResetTokenRepository)
      .overrideProvider(MfaService)
      .useValue(mockMfaService)
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(EventPublisher)
      .useValue(mockEventPublisher)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a user successfully', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        role: 'user',
      });
      mockSessionRepository.create.mockResolvedValue({});

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should fail if email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({ id: 'existing' });

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(409);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login successfully', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        role: 'user',
      });
      // Mock PasswordEncoder.compare to return true
      const passwordEncoder = app.get(PasswordEncoder);
      jest.spyOn(passwordEncoder, 'compare').mockResolvedValue(true);

      mockSessionRepository.create.mockResolvedValue({});

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        })
        .expect(200); // Controller uses @HttpCode(HttpStatus.OK)

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });
  });

  describe('Protected Routes', () => {
    let accessToken: string;

    beforeEach(() => {
      const tokenService = app.get(TokenService);
      accessToken = tokenService.generateAccessToken({
        sub: 'user-id',
        email: 'test@example.com',
        role: 'user',
      });
    });

    describe('/auth/logout (POST)', () => {
      it('should logout successfully', async () => {
        mockSessionRepository.deleteByUserId.mockResolvedValue(undefined);

        await request(app.getHttpServer())
          .post('/auth/logout')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(mockSessionRepository.deleteByUserId).toHaveBeenCalledWith(
          'user-id',
        );
      });
    });

    describe('/auth/mfa/enable (POST)', () => {
      it('should return MFA secret and QR code', async () => {
        mockMfaService.generateSecret.mockResolvedValue({
          secret: 'secret',
          otpauthUrl: 'url',
        });
        mockMfaService.generateQrCode.mockResolvedValue('qr-data');
        mockUserRepository.findById.mockResolvedValue({
          id: 'user-id',
          email: 'test@example.com',
        });
        mockUserRepository.update.mockResolvedValue({});

        const response = await request(app.getHttpServer())
          .post('/auth/mfa/enable')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(201);

        expect(response.body).toHaveProperty('secret');
        expect(response.body).toHaveProperty('qrCode');
      });
    });

    describe('/auth/mfa/verify (POST)', () => {
      it('should verify MFA successfully', async () => {
        mockUserRepository.findById.mockResolvedValue({
          id: 'user-id',
          mfaSecret: 'secret',
          mfaEnabled: false,
        });
        mockMfaService.verify.mockReturnValue(true);
        mockUserRepository.update.mockResolvedValue({});

        await request(app.getHttpServer())
          .post('/auth/mfa/verify')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ code: '123456' })
          .expect(201);

        expect(mockMfaService.verify).toHaveBeenCalled();
      });
    });
  });

  describe('/auth/forgot-password (POST)', () => {
    it('should initiate forgot password flow', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
      });
      mockPasswordResetTokenRepository.save.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'test@example.com' })
        .expect(201);

      expect(mockPasswordResetTokenRepository.save).toHaveBeenCalled();
    });
  });

  describe('/auth/reset-password (POST)', () => {
    it('should reset password successfully', async () => {
      mockPasswordResetTokenRepository.findByToken.mockResolvedValue(
        'test@example.com',
      );
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
      });
      mockUserRepository.update.mockResolvedValue({});
      mockSessionRepository.deleteByUserId.mockResolvedValue(undefined);
      mockPasswordResetTokenRepository.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: 'test-token', newPassword: 'NewPassword123!' })
        .expect(201);

      expect(mockUserRepository.update).toHaveBeenCalled();
      expect(mockSessionRepository.deleteByUserId).toHaveBeenCalledWith(
        'user-id',
      );
    });
  });
});
