import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // Configuración MySQL para todos los entornos
  return {
    type: 'mysql',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: parseInt(configService.get<string>('DB_PORT', '3306'), 10),
    username: configService.get<string>('DB_USERNAME', 'root'),
    password: configService.get<string>('DB_PASSWORD', ''),
    database: configService.get<string>('DB_NAME', nodeEnv === 'test' ? 'los_atuendos_test' : 'los_atuendos'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: nodeEnv === 'development' || nodeEnv === 'test',
    logging: nodeEnv === 'development',
    dropSchema: nodeEnv === 'test', // Limpiar la base de datos en cada test
    timezone: 'Z', // UTC
    charset: 'utf8mb4',
    extra: {
      connectionLimit: 10,
    },
  };
};
