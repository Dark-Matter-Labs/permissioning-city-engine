import { Module } from '@nestjs/common';
import { RuleController } from './rule.controller';
import { RuleService } from './rule.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rule } from 'src/database/entity/rule.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Rule])],
  controllers: [RuleController],
  providers: [RuleService],
})
export class RuleModule {}
