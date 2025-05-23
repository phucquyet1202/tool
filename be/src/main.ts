import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/fillter/all-exceptions.filter';
import cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: true, // hoặc ['http://localhost:3000'] nếu frontend localhost 3000
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
