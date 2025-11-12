import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Consecutivo } from './consecutivo.entity';

@Injectable({ scope: Scope.DEFAULT }) // Singleton scope
export class GeneradorConsecutivo {
  private static instance: GeneradorConsecutivo;
  private readonly mutex: { [key: string]: boolean } = {};

  constructor(
    @InjectRepository(Consecutivo)
    private readonly consecutivoRepository: Repository<Consecutivo>,
    private readonly dataSource: DataSource,
  ) {
    // Implementación de Singleton pattern compatible con NestJS DI
    // No usar 'return' para no interferir con el sistema de tipos de TypeScript
    if (!GeneradorConsecutivo.instance) {
      GeneradorConsecutivo.instance = this;
    }
  }

  async obtenerSiguienteNumero(
    tipo: string = 'SERVICIO_ALQUILER',
  ): Promise<number> {
    // Manejo de concurrencia por tipo
    const mutexKey = `${tipo}_mutex`;

    // Esperar si hay otro proceso generando consecutivo para el mismo tipo
    while (this.mutex[mutexKey]) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // Marcar como en uso
    this.mutex[mutexKey] = true;

    try {
      const numero = await this.generarConsecutivoSeguro(tipo);
      return numero;
    } finally {
      // Liberar mutex
      delete this.mutex[mutexKey];
    }
  }

  private async generarConsecutivoSeguro(tipo: string): Promise<number> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar o crear registro de consecutivo con lock
      let consecutivo = await queryRunner.manager
        .createQueryBuilder(Consecutivo, 'consecutivo')
        .where('consecutivo.tipo = :tipo', { tipo })
        .setLock('pessimistic_write') // Lock para evitar condiciones de carrera
        .getOne();

      if (!consecutivo) {
        // Crear nuevo registro si no existe
        consecutivo = queryRunner.manager.create(Consecutivo, {
          tipo: tipo,
          ultimoNumero: 0,
          ultimaActualizacion: new Date(),
        });
        await queryRunner.manager.save(consecutivo);
      }

      // Incrementar número
      const nuevoNumero = consecutivo.ultimoNumero + 1;

      // Actualizar en base de datos
      await queryRunner.manager.update(
        Consecutivo,
        { tipo: tipo },
        {
          ultimoNumero: nuevoNumero,
          ultimaActualizacion: new Date(),
        },
      );

      await queryRunner.commitTransaction();

      console.log(`✅ Consecutivo generado: ${tipo} #${nuevoNumero}`);
      return nuevoNumero;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(`❌ Error generando consecutivo ${tipo}:`, error);
      throw new Error(`Error generando consecutivo: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async obtenerUltimoNumero(
    tipo: string = 'SERVICIO_ALQUILER',
  ): Promise<number> {
    const consecutivo = await this.consecutivoRepository.findOne({
      where: { tipo },
    });
    return consecutivo ? consecutivo.ultimoNumero : 0;
  }

  async reiniciarConsecutivo(
    tipo: string = 'SERVICIO_ALQUILER',
    nuevoValor: number = 0,
  ): Promise<void> {
    await this.consecutivoRepository.upsert(
      {
        tipo: tipo,
        ultimoNumero: nuevoValor,
        ultimaActualizacion: new Date(),
      },
      ['tipo'],
    );

    console.log(`✅ Consecutivo ${tipo} reiniciado a ${nuevoValor}`);
  }

  // Método para testing - obtener instancia
  static getInstance(): GeneradorConsecutivo | null {
    return GeneradorConsecutivo.instance || null;
  }
}
