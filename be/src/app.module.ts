import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { HistoryModule } from './history/history.module';
import { PaymentModule } from './payment/payment.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { LivestreamModule } from './livestream/livestream.module';
import { AuthModule } from './auth/auth.module';
import { ToolModule } from './tool/tool.module';
import { PlatformServiceModule } from './platform-service/platform-service.module';
import { UsePlatformModule } from './use-platform/use-platform.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    OrderModule,
    HistoryModule,
    PaymentModule,
    PrismaModule,
    LivestreamModule,
    AuthModule,
    ToolModule,
    PlatformServiceModule,
    UsePlatformModule,
    // NmsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
