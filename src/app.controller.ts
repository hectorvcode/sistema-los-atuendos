import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health Check')
@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Verifica que la API está funcionando correctamente',
  })
  @ApiResponse({
    status: 200,
    description: 'API funcionando correctamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'API Los Atuendos funcionando correctamente',
        },
        version: { type: 'string', example: '1.0.0' },
        timestamp: { type: 'string', example: '2025-01-14T10:30:00.000Z' },
        status: { type: 'string', example: 'healthy' },
      },
    },
  })
  getHello() {
    return {
      message: this.appService.getHello(),
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      status: 'healthy',
    };
  }
}
