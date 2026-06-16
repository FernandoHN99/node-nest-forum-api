import { Controller, Get, Header } from '@nestjs/common'

import { Public } from '@/infra/auth/public'
import { HomeService } from './home.service'

@Controller()
@Public()
export class HomeController {
  constructor(private home: HomeService) {}

  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  handle(): string {
    return this.home.render()
  }
}
