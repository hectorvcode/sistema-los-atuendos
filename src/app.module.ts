import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { CreationalPatternsModule } from './patterns/creational/creational-patterns.module';
import { PrendasModule } from './modules/prendas/prendas.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { EmpleadosModule } from './modules/empleados/empleados.module';
import { ServiciosModule } from './modules/servicios/servicios.module';
import { LavanderiaModule } from './modules/lavanderia/lavanderia.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    CreationalPatternsModule,
    PrendasModule, // Módulo de gestión de prendas
    ClientesModule, // Módulo de gestión de clientes
    EmpleadosModule, // Módulo de gestión de empleados
    ServiciosModule, // Módulo de servicios de alquiler (Builder + Singleton)
    LavanderiaModule, // Módulo de gestión de lavandería (Decorator)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
