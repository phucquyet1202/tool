// nest-app/src/livestream/livestream.module.ts
import { Module } from '@nestjs/common';
import { LivestreamController } from './livestream.controller';
import { LivestreamService } from './livestream.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [LivestreamController],
  providers: [LivestreamService],
  exports: [LivestreamService],
})
export class LivestreamModule {}
