import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Xuất PrismaService để sử dụng ở các module khác
})
export class PrismaModule {}
