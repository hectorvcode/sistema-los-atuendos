import { DataSource } from 'typeorm';
import { getDatabaseConfig } from '../../config/database.config';
import { ConfigService } from '@nestjs/config';
import { InitialDataSeed } from './initial-data.seed';

async function runSeeds() {
  const configService = new ConfigService();
  const config = getDatabaseConfig(configService);

  const dataSource = new DataSource(config as any);

  try {
    await dataSource.initialize();
    console.log('🔗 Conexión a base de datos establecida');

    const seed = new InitialDataSeed();
    await seed.run(dataSource);

    console.log('Seeds ejecutados exitosamente');
  } catch (error) {
    console.error('Error ejecutando seeds:', error);
  } finally {
    await dataSource.destroy();
  }
}

runSeeds();
