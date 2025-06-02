import { Test, TestingModule } from '@nestjs/testing';
import { UsePlatformService } from './use-platform.service';

describe('UsePlatformService', () => {
  let service: UsePlatformService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsePlatformService],
    }).compile();

    service = module.get<UsePlatformService>(UsePlatformService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
