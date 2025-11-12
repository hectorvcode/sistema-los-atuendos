import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VestidoDamaFactory } from '../factory/vestido-dama.factory';
import { TrajeCaballeroFactory } from '../factory/traje-caballero.factory';
import { DisfrazFactory } from '../factory/disfraz.factory';
import { PrendaFactoryRegistry } from '../factory/prenda-factory.registry';
import { VestidoDama } from '../../../modules/prendas/entities/vestido-dama.entity';
import { TrajeCaballero } from '../../../modules/prendas/entities/traje-caballero.entity';
import { Disfraz } from '../../../modules/prendas/entities/disfraz.entity';
import { getDatabaseConfig } from '../../../config/database.config';
import { DataSource } from 'typeorm';

describe('Factory Method Pattern', () => {
  let module: TestingModule;
  let factoryRegistry: PrendaFactoryRegistry;
  let vestidoDamaFactory: VestidoDamaFactory;
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
        TypeOrmModule.forFeature([VestidoDama, TrajeCaballero, Disfraz]),
      ],
      providers: [
        VestidoDamaFactory,
        TrajeCaballeroFactory,
        DisfrazFactory,
        PrendaFactoryRegistry,
      ],
    }).compile();

    factoryRegistry = module.get<PrendaFactoryRegistry>(PrendaFactoryRegistry);
    vestidoDamaFactory = module.get<VestidoDamaFactory>(VestidoDamaFactory);
    dataSource = module.get<DataSource>(DataSource);

    // Limpiar cualquier dato previo antes de empezar los tests
    await dataSource.query(
      "DELETE FROM prendas WHERE referencia = 'VD-TEST-001'",
    );
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    if (dataSource) {
      await dataSource.query(
        "DELETE FROM prendas WHERE referencia = 'VD-TEST-001'",
      );
    }

    if (module) {
      await module.close();
    }
  });

  describe('VestidoDamaFactory', () => {
    it('should create a vestido de dama successfully', async () => {
      const vestidoData = {
        referencia: 'VD-TEST-001',
        color: 'Rojo',
        marca: 'Test Elegancia',
        talla: 'M',
        valorAlquiler: 150000,
        tienePedreria: true,
        esLargo: true,
        cantidadPiezas: 2,
        descripcionPiezas: 'Vestido principal + velo de prueba',
      };

      const vestido = await vestidoDamaFactory.crearPrenda(vestidoData);

      expect(vestido).toBeDefined();
      expect(vestido.referencia).toBe(vestidoData.referencia);
      expect(vestido.tienePedreria).toBe(true);
      expect(vestido.cantidadPiezas).toBe(2);
      expect(vestido.id).toBeDefined();
    });

    it('should validate data correctly', () => {
      const datosInvalidos = {
        referencia: '',
        color: 'Azul',
        marca: 'Test',
        talla: 'S',
        valorAlquiler: -100, // Valor inválido
      };

      const esValido = vestidoDamaFactory.validarDatos(datosInvalidos);
      expect(esValido).toBe(false);
    });
  });

  describe('PrendaFactoryRegistry', () => {
    it('should get correct factory for each type', () => {
      const vestidoFactory = factoryRegistry.getFactory('vestido-dama');
      const trajeFactory = factoryRegistry.getFactory('traje-caballero');
      const disfrazFactory = factoryRegistry.getFactory('disfraz');

      expect(vestidoFactory).toBeDefined();
      expect(trajeFactory).toBeDefined();
      expect(disfrazFactory).toBeDefined();
    });

    it('should throw error for invalid factory type', () => {
      expect(() => {
        factoryRegistry.getFactory('tipo-inexistente');
      }).toThrow('Factory no encontrada para tipo: tipo-inexistente');
    });

    it('should list available types', () => {
      const tipos = factoryRegistry.getTiposDisponibles();
      expect(tipos).toContain('vestido-dama');
      expect(tipos).toContain('traje-caballero');
      expect(tipos).toContain('disfraz');
    });
  });
});
