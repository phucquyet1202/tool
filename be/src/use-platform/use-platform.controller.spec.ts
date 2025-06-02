import { Test, TestingModule } from '@nestjs/testing';
import { UsePlatformController } from './use-platform.controller';
import { UsePlatformService } from './use-platform.service';

describe('UsePlatformController', () => {
  let controller: UsePlatformController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsePlatformController],
      providers: [UsePlatformService],
    }).compile();

    controller = module.get<UsePlatformController>(UsePlatformController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
