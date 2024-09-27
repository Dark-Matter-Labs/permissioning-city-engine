import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { Logger } from '../lib/logger/logger.service';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  providers: [DatabaseService, Logger],
  exports: [DatabaseService],
})
export class DatabaseModule {}
