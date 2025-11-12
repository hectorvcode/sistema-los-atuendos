import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GeneradorConsecutivo } from '../singleton/generador-consecutivo.singleton';
import { Consecutivo } from '../singleton/consecutivo.entity';
import { getDatabaseConfig } from '../../../config/database.config';

describe('Singleton Pattern', () => {
  let module: TestingModule;
  let generadorConsecutivo: GeneradorConsecutivo;
  let consecutivoRepository: Repository<Consecutivo>;

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
        TypeOrmModule.forFeature([Consecutivo]),
      ],
      providers: [GeneradorConsecutivo],
    }).compile();

    generadorConsecutivo =
      module.get<GeneradorConsecutivo>(GeneradorConsecutivo);
    consecutivoRepository = module.get<Repository<Consecutivo>>(
      getRepositoryToken(Consecutivo),
    );

    // Limpiar cualquier dato previo antes de empezar los tests
    await consecutivoRepository.delete({ tipo: 'TEST' });
    await consecutivoRepository.delete({ tipo: 'CONCURRENT_TEST' });
    await consecutivoRepository.delete({ tipo: 'RESET_TEST' });
  });

  afterAll(async () => {
    // Limpiar datos de prueba creados durante los tests
    if (consecutivoRepository) {
      await consecutivoRepository.delete({ tipo: 'TEST' });
      await consecutivoRepository.delete({ tipo: 'CONCURRENT_TEST' });
      await consecutivoRepository.delete({ tipo: 'RESET_TEST' });
    }

    if (module) {
      await module.close();
    }
  });

  describe('GeneradorConsecutivo', () => {
    it('should generate consecutive numbers', async () => {
      const numero1 = await generadorConsecutivo.obtenerSiguienteNumero('TEST');
      const numero2 = await generadorConsecutivo.obtenerSiguienteNumero('TEST');

      expect(numero2).toBe(numero1 + 1);
    });

    it('should handle concurrent requests safely', async () => {
      // Simular múltiples requests concurrentes
      const promises = Array.from({ length: 5 }, () =>
        generadorConsecutivo.obtenerSiguienteNumero('CONCURRENT_TEST'),
      );

      const numeros = await Promise.all(promises);
      const numerosUnicos = new Set(numeros);

      // Todos los números deben ser únicos
      expect(numerosUnicos.size).toBe(5);
    });

    it('should maintain singleton instance', () => {
      const instancia1 = GeneradorConsecutivo.getInstance();
      const instancia2 = GeneradorConsecutivo.getInstance();

      expect(instancia1).toBe(instancia2);
    });

    it('should reset consecutive numbers', async () => {
      await generadorConsecutivo.reiniciarConsecutivo('RESET_TEST', 100);
      const numero =
        await generadorConsecutivo.obtenerSiguienteNumero('RESET_TEST');

      expect(numero).toBe(101);
    });
  });
});
