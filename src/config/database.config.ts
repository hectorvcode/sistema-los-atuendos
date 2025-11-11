import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: parseInt(configService.get<string>('DB_PORT', '3306'), 10),
  username: configService.get<string>('DB_USERNAME', 'root'),
  password: configService.get<string>('DB_PASSWORD', ''),
  database: configService.get<string>('DB_NAME', 'los_atuendos'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize:
    configService.get<string>('NODE_ENV', 'development') === 'development',
  logging:
    configService.get<string>('NODE_ENV', 'development') === 'development',
  timezone: 'Z', // UTC
  charset: 'utf8mb4',
  extra: {
    connectionLimit: 10,
  },
});
