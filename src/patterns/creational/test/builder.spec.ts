import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ServicioAlquilerBuilder } from '../builder/servicio-alquiler.builder';
import { ServicioAlquiler } from '../../../modules/servicios/entities/servicio-alquiler.entity';
import { Cliente } from '../../../modules/clientes/entities/cliente.entity';
import { Empleado } from '../../../modules/empleados/entities/empleado.entity';
import { Prenda } from '../../../modules/prendas/entities/prenda.entity';
import { GeneradorConsecutivo } from '../singleton/generador-consecutivo.singleton';
import { Consecutivo } from '../singleton/consecutivo.entity';
import { getDatabaseConfig } from '../../../config/database.config';
import { PricingStrategyContext } from '../../behavioral/strategy/pricing-context';

describe('Builder Pattern', () => {
  let module: TestingModule;
  let builder: ServicioAlquilerBuilder;
  let servicioRepository: Repository<ServicioAlquiler>;
  let dataSource: DataSource;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) =>
            getDatabaseConfig(configService),
        }),
        TypeOrmModule.forFeature([
          ServicioAlquiler,
          Cliente,
          Empleado,
          Prenda,
          Consecutivo,
        ]),
      ],
      providers: [
        ServicioAlquilerBuilder,
        GeneradorConsecutivo,
        {
          provide: PricingStrategyContext,
          useValue: {
            calcularMejorPrecio: jest.fn().mockReturnValue({
              precioBase: 100,
              descuento: 0,
              precioFinal: 100,
              detalles: 'Precio calculado para test',
            }),
            getEstrategiaActual: jest.fn().mockReturnValue({
              getNombre: jest.fn().mockReturnValue('Estrategia de Test'),
            }),
            setEstrategia: jest.fn(),
          },
        },
      ],
    }).compile();

    builder = module.get<ServicioAlquilerBuilder>(ServicioAlquilerBuilder);
    servicioRepository = module.get<Repository<ServicioAlquiler>>(
      getRepositoryToken(ServicioAlquiler),
    );
    dataSource = module.get<DataSource>(DataSource);

    // Limpiar cualquier dato previo antes de empezar los tests
    const servicios = await servicioRepository.find({
      relations: ['cliente'],
    });
    for (const servicio of servicios) {
      if (servicio.cliente?.numeroIdentificacion === '1010101010') {
        await servicioRepository.delete(servicio.id);
      }
    }

    // Restaurar todas las prendas a estado disponible para los tests
    await dataSource.query(
      "UPDATE prendas SET disponible = TRUE, estado = 'disponible' WHERE referencia IN ('VD001', 'VD002', 'TC001', 'TC002', 'DF001', 'DF002')",
    );
  });

  afterAll(async () => {
    // Limpiar datos de prueba creados durante los tests
    if (servicioRepository) {
      // Eliminar servicios de prueba si fueron creados
      const servicios = await servicioRepository.find({
        relations: ['cliente'],
      });
      for (const servicio of servicios) {
        if (servicio.cliente?.numeroIdentificacion === '1010101010') {
          await servicioRepository.delete(servicio.id);
        }
      }
    }

    if (module) {
      await module.close();
    }
  });

  describe('ServicioAlquilerBuilder', () => {
    it('should validate required fields', async () => {
      // Test con builder limpio - debe fallar
      await expect(builder.build()).rejects.toThrow('Error de validación');

      // Test solo con cliente - debe fallar
      await expect(builder.setCliente(1).build()).rejects.toThrow(
        'Error de validación',
      );
    });

    it('should handle invalid date validation', async () => {
      const fechaPasada = new Date();
      fechaPasada.setDate(fechaPasada.getDate() - 1); // Ayer

      await expect(
        builder
          .setCliente(1)
          .setEmpleado(1)
          .setFechaAlquiler(fechaPasada) // Fecha en el pasado
          .agregarPrenda(1)
          .build(),
      ).rejects.toThrow('La fecha de alquiler no puede ser en el pasado');
    });

    it('should reset builder after failed build', async () => {
      // Intentar build sin configuración completa
      try {
        await builder.build();
      } catch {
        // Expected error - removido variable 'error' no utilizada
      }

      // Builder debería estar limpio para reusar
      expect(() => builder.reset()).not.toThrow();
    });
  });
});
