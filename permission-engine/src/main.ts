import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from './lib/logger/logger.service';
import helmet from 'helmet';
import * as compression from 'compression';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new Logger(),
  });

  app.enableCors();
  app.use(helmet());
  app.use(compression());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Permissioning Engine API') // API 문서의 제목
    .setDescription('API documentation of permissioning engine') // API에 대한 설명
    .setVersion('1.0') // 버전 정보
    .addBearerAuth()
    .setBasePath('/api/v1')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      authAction: {
        BearerAuth: {
          name: 'Authorization',
          schema: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            description: 'Enter JWT Bearer token',
          },
          value: 'Bearer <your-token-here>',
        },
      },
    },
  });

  await app.listen(process.env.PERMISSION_ENGINE_PORT);
}
bootstrap();
