import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from '../../config/database.config';

describe('Database Connection', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
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
      ],
    }).compile();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should connect to database successfully', () => {
    expect(module).toBeDefined();
  });
});
