import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AbstractPrendaFactory,
  PrendaBaseData,
} from './abstract-prenda.factory';
import { TrajeCaballero } from '../../../modules/prendas/entities/traje-caballero.entity';

export interface TrajeCaballeroData extends PrendaBaseData {
  tipo?: 'convencional' | 'frac' | 'sacoleva' | 'otro';
  tieneCorbata?: boolean;
  tieneCorbtain?: boolean;
  tienePlastron?: boolean;
  accesoriosIncluidos?: string;
}

@Injectable()
export class TrajeCaballeroFactory extends AbstractPrendaFactory<TrajeCaballero> {
  constructor(
    @InjectRepository(TrajeCaballero)
    trajeCaballeroRepository: Repository<TrajeCaballero>,
  ) {
    super(trajeCaballeroRepository);
  }

  async crearPrenda(datos: TrajeCaballeroData): Promise<TrajeCaballero> {
    if (!this.validarDatos(datos)) {
      throw new Error('Datos inválidos para crear traje de caballero');
    }

    const esReferenciaUnica = await this.validarReferenciaUnica(
      datos.referencia,
    );
    if (!esReferenciaUnica) {
      throw new Error(`La referencia ${datos.referencia} ya existe`);
    }

    // Generar lista de accesorios automáticamente
    const accesorios = this.generarListaAccesorios(datos);

    const traje = this.repository.create({
      referencia: datos.referencia,
      color: datos.color,
      marca: datos.marca,
      talla: datos.talla,
      valorAlquiler: datos.valorAlquiler,
      tipo: datos.tipo ?? 'convencional',
      tieneCorbata: datos.tieneCorbata ?? false,
      tieneCorbtain: datos.tieneCorbtain ?? false,
      tienePlastron: datos.tienePlastron ?? false,
      accesoriosIncluidos: datos.accesoriosIncluidos || accesorios,
      disponible: true,
      estado: 'disponible',
    });

    const trajeGuardado = await this.repository.save(traje);

    console.log(`✅ Traje de caballero creado: ${trajeGuardado.referencia}`);
    return trajeGuardado;
  }

  validarDatos(datos: TrajeCaballeroData): boolean {
    if (!this.validarDatosComunes(datos)) {
      return false;
    }

    // Validar que solo tenga un tipo de accesorio de cuello
    const accesoriosCuello = [
      datos.tieneCorbata,
      datos.tieneCorbtain,
      datos.tienePlastron,
    ].filter(Boolean).length;

    if (accesoriosCuello > 1) {
      return false; // No puede tener múltiples accesorios de cuello
    }

    // Validar tipo
    const tiposValidos = ['convencional', 'frac', 'sacoleva', 'otro'];
    if (datos.tipo && !tiposValidos.includes(datos.tipo)) {
      return false;
    }

    return true;
  }

  getTipoPrenda(): string {
    return 'TrajeCaballero';
  }

  private generarListaAccesorios(datos: TrajeCaballeroData): string {
    const accesorios: string[] = [];

    if (datos.tieneCorbata) accesorios.push('Corbata');
    if (datos.tieneCorbtain) accesorios.push('Corbatín');
    if (datos.tienePlastron) accesorios.push('Plastrón');

    return accesorios.length > 0 ? accesorios.join(', ') : 'Ninguno';
  }
}
