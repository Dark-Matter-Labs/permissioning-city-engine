import { Module } from '@nestjs/common';
import { SpaceEventService } from './space-event.service';
import { SpaceEventController } from './space-event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpaceEvent } from 'src/database/entity/space-event.entity';
import { UserService } from '../user/user.service';
import { User } from 'src/database/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SpaceEvent, User])],
  controllers: [SpaceEventController],
  providers: [SpaceEventService, UserService],
})
export class SpaceEventModule {}
