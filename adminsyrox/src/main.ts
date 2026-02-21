import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: 'http://localhost:3000' }); // URL del frontend Next.js

  await app.listen(5000);
  console.log('🚀 Backend corriendo en http://localhost:5000');
}

bootstrap();
