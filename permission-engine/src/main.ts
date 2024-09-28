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
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Permissioning Engine API')
    .setDescription('API documentation of permissioning engine')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(process.env.GOOGLE_CALLBACK_DOMAIN)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PERMISSION_ENGINE_PORT);
}
bootstrap();
