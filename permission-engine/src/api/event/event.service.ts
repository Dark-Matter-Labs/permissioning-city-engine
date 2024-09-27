import { Injectable } from '@nestjs/common';
import { CreateEventDto, UpdateEventDto } from './dto';
import { Logger } from 'src/lib/logger/logger.service';

@Injectable()
export class EventService {
  private events = [];

  create(createEventDto: CreateEventDto) {
    const newEvent = { id: Date.now().toString(), ...createEventDto };
    this.events.push(newEvent);

    const logger = new Logger();
    logger.log(JSON.stringify(newEvent));

    return newEvent;
  }

  findAll() {
    return this.events;
  }

  findOne(id: string) {
    return this.events.find((event) => event.id === id);
  }

  update(id: string, updateEventDto: UpdateEventDto) {
    const eventIndex = this.events.findIndex((event) => event.id === id);
    if (eventIndex > -1) {
      this.events[eventIndex] = {
        ...this.events[eventIndex],
        ...updateEventDto,
      };
      return this.events[eventIndex];
    }
    return null;
  }

  remove(id: string) {
    const eventIndex = this.events.findIndex((event) => event.id === id);
    if (eventIndex > -1) {
      const removedEvent = this.events.splice(eventIndex, 1);
      return removedEvent[0];
    }
    return null;
  }
}
