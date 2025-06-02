import { Test, TestingModule } from '@nestjs/testing';
import { PlatformServiceService } from './platform-service.service';

describe('PlatformServiceService', () => {
  let service: PlatformServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlatformServiceService],
    }).compile();

    service = module.get<PlatformServiceService>(PlatformServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
