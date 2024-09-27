import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { Logger } from '../logger/logger.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  providers: [S3Service, Logger],
  exports: [S3Service],
})
export class S3Module {}
