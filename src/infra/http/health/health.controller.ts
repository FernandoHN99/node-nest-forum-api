import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { Public } from '@/infra/auth/public'

@ApiTags('Health')
@Controller('health')
@Public()
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Returns the current liveness status of the API.' })
  @ApiResponse({ status: 200, description: 'The API is up and running.' })
  check() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }
  }
}
