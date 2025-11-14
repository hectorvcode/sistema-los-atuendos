import { DataSource } from 'typeorm';
import { getDatabaseConfig } from '../../config/database.config';
import { ConfigService } from '@nestjs/config';
import { CompleteDataSeed } from './complete-data.seed';

/**
 * Script para ejecutar el seed completo de datos
 * Incluye datos realistas para demostración y desarrollo
 *
 * Uso: npm run seed:complete
 */
async function runCompleteSeeds() {
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║                                                   ║');
  console.log('║     🌱  SEED DE DATOS COMPLETOS - LOS ATUENDOS   ║');
  console.log('║                                                   ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  const configService = new ConfigService();
  const config = getDatabaseConfig(configService);

  const dataSource = new DataSource(config as any);

  try {
    console.log('🔗 Estableciendo conexión con la base de datos...');
    await dataSource.initialize();
    console.log('✅ Conexión establecida exitosamente\n');

    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await dataSource.query('TRUNCATE TABLE servicios_prendas');
    await dataSource.query('TRUNCATE TABLE items_lavanderia');
    await dataSource.query('TRUNCATE TABLE servicios_alquiler');
    await dataSource.query('TRUNCATE TABLE consecutivos');
    await dataSource.query('TRUNCATE TABLE prendas');
    await dataSource.query('TRUNCATE TABLE clientes');
    await dataSource.query('TRUNCATE TABLE empleados');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Datos limpiados exitosamente\n');

    const seed = new CompleteDataSeed();
    await seed.run(dataSource);

    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║                                                   ║');
    console.log('║     ✅  SEED COMPLETADO EXITOSAMENTE             ║');
    console.log('║                                                   ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error ejecutando seeds:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Conexión cerrada');
    }
  }
}

runCompleteSeeds();