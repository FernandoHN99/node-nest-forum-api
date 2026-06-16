import { Module } from '@nestjs/common'

import { EnvModule } from '@/infra/env/env.module'
import { HomeController } from './home.controller'
import { HomeService } from './home.service'

@Module({
  imports: [EnvModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
