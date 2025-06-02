import { Test, TestingModule } from '@nestjs/testing';
import { PlatformServiceController } from './platform-service.controller';
import { PlatformServiceService } from './platform-service.service';

describe('PlatformServiceController', () => {
  let controller: PlatformServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlatformServiceController],
      providers: [PlatformServiceService],
    }).compile();

    controller = module.get<PlatformServiceController>(PlatformServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
