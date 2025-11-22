import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicioAlquiler } from '../../../modules/servicios/entities/servicio-alquiler.entity';
import { ReportGenerationService } from './report-generation.service';
import {
  JsonReportGenerator,
  CsvReportGenerator,
  HtmlReportGenerator,
} from './generators';

/**
 * Módulo que implementa el patrón Template Method
 * para la generación de reportes de servicios en diferentes formatos
 */
@Module({
  imports: [TypeOrmModule.forFeature([ServicioAlquiler])],
  providers: [
    ReportGenerationService,
    JsonReportGenerator,
    CsvReportGenerator,
    HtmlReportGenerator,
  ],
  exports: [ReportGenerationService],
})
export class TemplateMethodModule {}