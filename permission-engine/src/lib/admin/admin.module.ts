import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from 'src/config/configuration';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { UserNotification } from 'src/database/entity/user-notification.entity';
import { User } from 'src/database/entity/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    TypeOrmModule.forFeature([User, UserNotification]),
    import('@adminjs/nestjs').then(({ AdminModule }) =>
      AdminModule.createAdminAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => {
          const { default: AdminJS } = await import('adminjs');
          const { Adapter, Database, Resource } = await import('@adminjs/sql');

          AdminJS.registerAdapter({ Database, Resource });

          const host = configService.get('DATABASE_HOST');
          const port = configService.get<number>('DATABASE_PORT');
          const database = configService.get('POSTGRES_DATABASE');
          const password = configService.get('POSTGRES_PASSWORD');
          const user = configService.get('POSTGRES_USER');
          const db = await new Adapter('postgresql', {
            connectionString: `postgres://${user}:${password}@${host}:${port}/${database}`,
            database: configService.get('POSTGRES_DATABASE'),
          }).init();

          if (!process.env.ADMIN_EMAIL || process.env.ADMIN_EMAIL == '') {
            throw new Error('ADMIN_EMAIL is not set');
          }

          const authenticate = async (
            email: string,
            password: string,
            ctx: any,
          ) => {
            const cookies = cookie.parse(ctx.req.headers.cookie || '');
            const token = cookies.accessToken;

            if (!token) {
              return null; // No token present, deny access
            }

            try {
              // Verify the token using the JWT secret
              const decoded = jwt.verify(token, process.env.JWT_SECRET);

              if (typeof decoded === 'string') {
                throw new Error('Invalid token');
              }
              const domain = decoded.email.split('@')[1];

              if (domain !== process.env.ADMIN_DOMAIN) {
                throw new Error('Invalid token');
              }

              if (decoded.email !== email) {
                throw new Error('Invalid token');
              }

              // Return the decoded user if the token is valid
              return {
                email: decoded.email,
              };
            } catch (error) {
              // Token is invalid or expired
              console.error('JWT verification failed:', error.message);
              return null;
            }
          };

          return {
            adminJsOptions: {
              rootPath: '/admin',
              resources: db.tables(),
            },
            auth: {
              authenticate,
              cookieName: 'adminjs',
              cookiePassword: process.env.JWT_SECRET,
            },
            sessionOptions: {
              resave: true,
              saveUninitialized: true,
              secret: process.env.JWT_SECRET,
            },
          };
        },
      }),
    ),
  ],
})
export class AdminModule {}
