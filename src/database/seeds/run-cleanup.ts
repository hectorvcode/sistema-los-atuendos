import { DataSource } from 'typeorm';
import { getDatabaseConfig } from '../../config/database.config';
import { ConfigService } from '@nestjs/config';

/**
 * Script para limpiar completamente la base de datos
 * NO carga ningún dato después de limpiar
 *
 * Uso: npm run db:reset
 */
async function cleanDatabase() {
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║                                                   ║');
  console.log('║     🧹  LIMPIEZA DE BASE DE DATOS                ║');
  console.log('║                                                   ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  const configService = new ConfigService();
  const config = getDatabaseConfig(configService);

  const dataSource = new DataSource(config as any);

  try {
    console.log('🔗 Estableciendo conexión con la base de datos...');
    await dataSource.initialize();
    console.log('✅ Conexión establecida exitosamente\n');

    console.log('🧹 Limpiando todas las tablas...');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');

    // Usar DELETE en lugar de TRUNCATE para evitar problemas con foreign keys
    await dataSource.query('DELETE FROM servicios_prendas');
    await dataSource.query('DELETE FROM items_lavanderia');
    await dataSource.query('DELETE FROM servicios_alquiler');
    await dataSource.query('DELETE FROM consecutivos');
    await dataSource.query('DELETE FROM prendas');
    await dataSource.query('DELETE FROM clientes');
    await dataSource.query('DELETE FROM empleados');

    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Todas las tablas han sido limpiadas\n');

    console.log('🔄 Reseteando autoincrementos...');
    await dataSource.query('ALTER TABLE prendas AUTO_INCREMENT = 1');
    await dataSource.query('ALTER TABLE clientes AUTO_INCREMENT = 1');
    await dataSource.query('ALTER TABLE empleados AUTO_INCREMENT = 1');
    await dataSource.query('ALTER TABLE servicios_alquiler AUTO_INCREMENT = 1');
    await dataSource.query('ALTER TABLE items_lavanderia AUTO_INCREMENT = 1');
    await dataSource.query('ALTER TABLE consecutivos AUTO_INCREMENT = 1');
    console.log('✅ Autoincrementos reseteados correctamente\n');

    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║                                                   ║');
    console.log('║     ✅  BASE DE DATOS LIMPIA                     ║');
    console.log('║                                                   ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');

    console.log('💡 La base de datos está vacía y lista para usar.');
    console.log('   Para cargar datos de prueba ejecuta:');
    console.log('   npm run seed:complete\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error limpiando base de datos:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Conexión cerrada');
    }
  }
}

cleanDatabase();
