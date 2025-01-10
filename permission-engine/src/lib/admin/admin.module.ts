import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from 'src/config/configuration';
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

          if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD == '') {
            throw new Error('ADMIN_PASSWORD is not set');
          }

          const DEFAULT_ADMIN = {
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
          };

          const authenticate = async (email: string, password: string) => {
            if (
              email === DEFAULT_ADMIN.email &&
              password === DEFAULT_ADMIN.password
            ) {
              return Promise.resolve(DEFAULT_ADMIN);
            }
            return null;
          };

          return {
            adminJsOptions: {
              rootPath: '/admin',
              resources: db.tables(),
            },
            auth: {
              authenticate,
              cookieName: 'adminjs',
              cookiePassword: 'secret',
            },
            sessionOptions: {
              resave: true,
              saveUninitialized: true,
              secret: 'secret',
            },
          };
        },
      }),
    ),
  ],
})
export class AdminModule {}
