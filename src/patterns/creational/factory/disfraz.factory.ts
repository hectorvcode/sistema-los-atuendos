import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AbstractPrendaFactory,
  PrendaBaseData,
} from './abstract-prenda.factory';
import { Disfraz } from '../../../modules/prendas/entities/disfraz.entity';

export interface DisfrazData extends PrendaBaseData {
  nombre: string;
  categoria?: string;
  descripcion?: string;
  edadRecomendada?: string;
}

@Injectable()
export class DisfrazFactory extends AbstractPrendaFactory<Disfraz> {
  constructor(
    @InjectRepository(Disfraz)
    disfrazRepository: Repository<Disfraz>,
  ) {
    super(disfrazRepository);
  }

  async crearPrenda(datos: DisfrazData): Promise<Disfraz> {
    if (!this.validarDatos(datos)) {
      throw new Error('Datos inválidos para crear disfraz');
    }

    const esReferenciaUnica = await this.validarReferenciaUnica(
      datos.referencia,
    );
    if (!esReferenciaUnica) {
      throw new Error(`La referencia ${datos.referencia} ya existe`);
    }

    // Categoría automática si no se especifica
    const categoria = datos.categoria || this.determinarCategoria(datos.nombre);

    const disfraz = this.repository.create({
      referencia: datos.referencia,
      color: datos.color,
      marca: datos.marca,
      talla: datos.talla,
      valorAlquiler: datos.valorAlquiler,
      nombre: datos.nombre,
      categoria: categoria,
      descripcion: datos.descripcion,
      edadRecomendada: datos.edadRecomendada || 'Todas las edades',
      disponible: true,
      estado: 'disponible',
    });

    const disfrazGuardado = await this.repository.save(disfraz);

    console.log(
      `✅ Disfraz creado: ${disfrazGuardado.referencia} - ${disfrazGuardado.nombre}`,
    );
    return disfrazGuardado;
  }

  validarDatos(datos: DisfrazData): boolean {
    if (!this.validarDatosComunes(datos)) {
      return false;
    }

    // Validar que tenga nombre
    if (!datos.nombre || datos.nombre.trim().length < 3) {
      return false;
    }

    return true;
  }

  getTipoPrenda(): string {
    return 'Disfraz';
  }

  private determinarCategoria(nombre: string): string {
    const nombreLower = nombre.toLowerCase();

    if (
      nombreLower.includes('princesa') ||
      nombreLower.includes('rey') ||
      nombreLower.includes('reina')
    ) {
      return 'Realeza';
    }
    if (nombreLower.includes('pirata') || nombreLower.includes('vikingo')) {
      return 'Aventura';
    }
    if (
      nombreLower.includes('superhéroe') ||
      nombreLower.includes('batman') ||
      nombreLower.includes('superman')
    ) {
      return 'Superhéroes';
    }
    if (
      nombreLower.includes('bruja') ||
      nombreLower.includes('vampiro') ||
      nombreLower.includes('fantasma')
    ) {
      return 'Terror';
    }

    return 'General';
  }
}
