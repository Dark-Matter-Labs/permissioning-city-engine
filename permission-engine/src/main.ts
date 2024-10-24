import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from './lib/logger/logger.service';
import helmet from 'helmet';
import compression from 'compression';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new Logger(),
  });

  app.enableCors({
    origin: process.env.GOOGLE_CALLBACK_DOMAIN,
    credentials: true,
  });
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'", 'https://accounts.google.com'],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://accounts.google.com',
          ],
        },
      },
    }),
  );
  app.use(compression());
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Permissioning Engine API')
    .setDescription('API documentation of permissioning engine')
    .setVersion('1.0')
    .addOAuth2({
      type: 'oauth2',
      flows: {
        authorizationCode: {
          authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token',
          scopes: {
            profile: 'Access user profile',
            email: 'Access user email',
          },
        },
      },
    })
    .addCookieAuth('accessToken')
    .addServer(process.env.GOOGLE_CALLBACK_DOMAIN)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      initOAuth: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
      oauth2RedirectUrl: `${process.env.GOOGLE_CALLBACK_DOMAIN}/api/v1/auth/google/callback`,
    },
  });

  // Graceful shutdown for SIGINT or SIGTERM
  process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing application...');
    await app.close().then(() => process.exit(0));
  });

  process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing application...');
    await app.close().then(() => process.exit(0));
  });

  await app.listen(process.env.PERMISSION_ENGINE_PORT);
}
bootstrap();
