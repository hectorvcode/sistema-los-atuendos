// src/patterns/structural/adapter/adapter.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Services
import { AdapterService } from './services/adapter-service';

// Adapters
import { AdaptadorBDRelacional } from './adapters/adaptador-bd-relacional.adapter';

@Module({
  imports: [ConfigModule],
  providers: [AdapterService, AdaptadorBDRelacional],
  exports: [AdapterService, AdaptadorBDRelacional],
})
export class AdapterModule {}
