import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from './common/dto/api-response';

@Controller()
export class AppController {
  @Get('/health')
  getHealth() {
    return ApiResponse.message('OK');
  }
}
