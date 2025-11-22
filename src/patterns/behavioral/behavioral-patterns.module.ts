import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades necesarias para Command Pattern
import { ServicioAlquiler } from '../../modules/servicios/entities/servicio-alquiler.entity';
import { Prenda } from '../../modules/prendas/entities/prenda.entity';

// Strategy Pattern imports
import { PricingStrategyContext } from './strategy/pricing-context';
import { RegularPricingStrategy } from './strategy/strategies/regular-pricing.strategy';
import { VipPricingStrategy } from './strategy/strategies/vip-pricing.strategy';
import { SeasonalPricingStrategy } from './strategy/strategies/seasonal-pricing.strategy';
import { BulkPricingStrategy } from './strategy/strategies/bulk-pricing.strategy';
import { PromotionalPricingStrategy } from './strategy/strategies/promotional-pricing.strategy';

// State Pattern imports
import {
  ServicioStateContext,
  PendingState,
  ConfirmedState,
  DeliveredState,
  ReturnedState,
  CancelledState,
} from './state';

// Observer Pattern imports
import {
  ServicioSubject,
  EmailNotificationObserver,
  SmsNotificationObserver,
  AuditLogObserver,
  DashboardObserver,
  ReportGeneratorObserver,
} from './observer';

// Command Pattern imports
import {
  CommandInvoker,
  CommandHistory,
  CommandFactory,
} from './command';

// Chain of Responsibility Pattern
import { ChainOfResponsibilityModule } from './chain-of-responsibility/chain-of-responsibility.module';

// Template Method Pattern
import { TemplateMethodModule } from './template-method/template-method.module';

/**
 * BehavioralPatternsModule - Módulo de patrones de comportamiento
 *
 * Agrupa todos los patrones de comportamiento (Behavioral Patterns):
 * - Strategy Pattern para cálculo flexible de precios
 * - State Pattern para gestión del ciclo de vida
 * - Observer Pattern para notificaciones de eventos
 * - Command Pattern para encapsular operaciones con capacidad de undo/redo
 * - Chain of Responsibility Pattern para procesamiento de aprobaciones jerárquicas
 * - Template Method Pattern para generación de reportes en múltiples formatos
 */
@Module({
  imports: [
    // Importar entidades necesarias para Command Pattern
    TypeOrmModule.forFeature([ServicioAlquiler, Prenda]),
    // Chain of Responsibility Pattern module
    ChainOfResponsibilityModule,
    // Template Method Pattern module
    TemplateMethodModule,
  ],
  providers: [
    // Strategy Pattern providers
    PricingStrategyContext,
    RegularPricingStrategy,
    VipPricingStrategy,
    SeasonalPricingStrategy,
    BulkPricingStrategy,
    PromotionalPricingStrategy,

    // State Pattern providers
    ServicioStateContext,
    PendingState,
    ConfirmedState,
    DeliveredState,
    ReturnedState,
    CancelledState,

    // Observer Pattern providers
    ServicioSubject,
    EmailNotificationObserver,
    SmsNotificationObserver,
    AuditLogObserver,
    DashboardObserver,
    ReportGeneratorObserver,

    // Command Pattern providers
    CommandInvoker,
    CommandHistory,
    CommandFactory,
  ],
  exports: [
    // Strategy Pattern exports
    PricingStrategyContext,
    RegularPricingStrategy,
    VipPricingStrategy,
    SeasonalPricingStrategy,
    BulkPricingStrategy,
    PromotionalPricingStrategy,

    // State Pattern exports
    ServicioStateContext,
    PendingState,
    ConfirmedState,
    DeliveredState,
    ReturnedState,
    CancelledState,

    // Observer Pattern exports
    ServicioSubject,
    EmailNotificationObserver,
    SmsNotificationObserver,
    AuditLogObserver,
    DashboardObserver,
    ReportGeneratorObserver,

    // Command Pattern exports
    CommandInvoker,
    CommandHistory,
    CommandFactory,

    // Chain of Responsibility Pattern exports
    ChainOfResponsibilityModule,

    // Template Method Pattern exports
    TemplateMethodModule,
  ],
})
export class BehavioralPatternsModule {}