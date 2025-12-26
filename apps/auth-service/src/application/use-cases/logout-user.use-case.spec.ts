import { Test, TestingModule } from '@nestjs/testing';
import { LogoutUserUseCase } from './logout-user.use-case';
import { SessionRepository } from '../../domain/ports/repositories';

describe('LogoutUserUseCase', () => {
  let useCase: LogoutUserUseCase;
  let sessionRepository: jest.Mocked<SessionRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutUserUseCase,
        {
          provide: SessionRepository,
          useValue: {
            deleteByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<LogoutUserUseCase>(LogoutUserUseCase);
    sessionRepository = module.get(SessionRepository);
  });

  it('should delete sessions by user id', async () => {
    await useCase.execute('1');
    expect(sessionRepository.deleteByUserId).toHaveBeenCalledWith('1');
  });
});
