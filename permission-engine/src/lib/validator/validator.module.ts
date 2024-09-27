import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ValidatorProcessor } from './validator.processor';
import { ValidatorService } from './validator.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'validator',
    }),
  ],
  providers: [ValidatorProcessor, ValidatorService],
  exports: [ValidatorService],
})
export class ValidatorModule {}
