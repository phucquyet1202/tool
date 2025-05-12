import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StreamModule } from './stream/stream.module';
// import { RtmpService } from './rtmp/rtmp.service';
import { FfmpegService } from './ffmpeg/ffmpeg.service';
import { FfmpegGateway } from './ffmpeg/ffmpeg.gateway';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { HistoryModule } from './history/history.module';
import { PaymentModule } from './payment/payment.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    StreamModule,
    UserModule,
    OrderModule,
    HistoryModule,
    PaymentModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    FfmpegService,
    FfmpegGateway,
    //  RtmpService
  ],
})
export class AppModule {}
