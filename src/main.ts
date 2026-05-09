import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://marketplace-hzq3c1h9q-darkhan-bs-projects.vercel.app',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.getHttpAdapter().get('/', (req, res) => {
    res.send({
      status: 'ok',
      service: 'mini-marketplace-api',
    });
  });

  const config = new DocumentBuilder()
    .setTitle('Маркетплейс API')
    .setDescription('MarketPlace API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 8000;

  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Backend running on port ${port}`);
}

bootstrap();