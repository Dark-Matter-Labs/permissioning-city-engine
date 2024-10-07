import { Module } from '@nestjs/common';
import { RuleController } from './rule.controller';
import { RuleService } from './rule.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rule } from 'src/database/entity/rule.entity';
import { User } from 'src/database/entity/user.entity';
import { UserService } from '../user/user.service';
import { RuleBlockService } from './rule-block/rule-block.service';
import { RuleBlock } from 'src/database/entity/rule-block.entity';
import { RuleBlockController } from './rule-block/rule-block.controller';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Rule, User, RuleBlock])],
  controllers: [RuleController, RuleBlockController],
  providers: [RuleService, UserService, RuleBlockService],
})
export class RuleModule {}
