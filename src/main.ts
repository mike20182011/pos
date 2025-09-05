import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // habilitar CORS
  app.enableCors({
    origin: 'http://localhost:4200', // tu frontend Angular
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.listen(process.env.PORT ?? 3000);
}

//aqui se hicieron algunos  cambios  para probar el github, prueba y seguimos probando el backend
bootstrap();