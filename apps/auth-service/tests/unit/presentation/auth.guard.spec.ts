import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '../../../src/presentation/guards/auth.guard';
import { AuthApplicationService } from '../../../src/application/services/auth.application.service';
import { User, Session } from '../../../src/domain/entities/user.entity';

// Mock better-auth before importing the adapter
jest.mock('better-auth', () => ({
  betterAuth: jest.fn(() => ({
    handler: jest.fn(),
    api: {
      getSession: jest.fn(),
      signOut: jest.fn(),
    },
  })),
}));

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: jest.Mocked<AuthApplicationService>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    emailVerified: true,
    name: 'Test User',
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSession: Session = {
    id: 'session-123',
    userId: 'user-123',
    token: 'token',
    expiresAt: new Date(),
    ipAddress: '127.0.0.1',
    userAgent: 'Test Agent',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: AuthApplicationService,
          useValue: {
            getSession: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get(AuthGuard);
    authService = module.get(AuthApplicationService);
  });

  const createMockContext = (
    headers: Record<string, string>,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
        }),
      }),
    } as ExecutionContext;
  };

  it('should allow access with valid session', async () => {
    authService.getSession.mockResolvedValue({
      user: mockUser,
      session: mockSession,
    });

    const context = createMockContext({
      cookie: 'better-auth-session=valid-token',
    });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(authService.getSession).toHaveBeenCalled();
  });

  it('should deny access without session', async () => {
    authService.getSession.mockResolvedValue(null);

    const context = createMockContext({});

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should deny access on authentication error', async () => {
    authService.getSession.mockRejectedValue(new Error('Auth failed'));

    const context = createMockContext({
      cookie: 'better-auth-session=invalid-token',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
