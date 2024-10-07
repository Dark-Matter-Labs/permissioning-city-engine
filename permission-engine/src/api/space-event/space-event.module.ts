import { Module } from '@nestjs/common';
import { SpaceEventService } from './space-event.service';
import { SpaceEventController } from './space-event.controller';

@Module({
  controllers: [SpaceEventController],
  providers: [SpaceEventService],
})
export class SpaceEventModule {}
