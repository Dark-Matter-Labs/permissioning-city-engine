// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class AppController {
  constructor() {}

  @Get('health')
  health() {
    return true;
  }
}
