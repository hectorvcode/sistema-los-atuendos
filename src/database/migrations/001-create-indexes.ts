import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIndexes1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Índices para optimizar consultas frecuentes

    // Índice compuesto para consultas de servicios por cliente
    await queryRunner.query(`
      CREATE INDEX idx_servicios_cliente_fecha 
      ON servicios_alquiler(cliente_id, fechaAlquiler)
    `);

    // Índice para consultas por fecha de alquiler
    await queryRunner.query(`
      CREATE INDEX idx_servicios_fecha_alquiler 
      ON servicios_alquiler(fechaAlquiler)
    `);

    // Índice para consultas de prendas por talla
    await queryRunner.query(`
      CREATE INDEX idx_prendas_talla 
      ON prendas(talla)
    `);

    // Índice para consultas de prendas por estado
    await queryRunner.query(`
      CREATE INDEX idx_prendas_estado 
      ON prendas(estado)
    `);

    // Índice para cola de lavandería por prioridad
    await queryRunner.query(`
      CREATE INDEX idx_lavanderia_prioridad_estado 
      ON items_lavanderia(prioridad DESC, estado)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX idx_servicios_cliente_fecha');
    await queryRunner.query('DROP INDEX idx_servicios_fecha_alquiler');
    await queryRunner.query('DROP INDEX idx_prendas_talla');
    await queryRunner.query('DROP INDEX idx_prendas_estado');
    await queryRunner.query('DROP INDEX idx_lavanderia_prioridad_estado');
  }
}
