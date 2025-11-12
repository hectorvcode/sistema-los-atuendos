import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AbstractPrendaFactory,
  PrendaBaseData,
} from './abstract-prenda.factory';
import { VestidoDama } from '../../../modules/prendas/entities/vestido-dama.entity';

export interface VestidoDamaData extends PrendaBaseData {
  tienePedreria?: boolean;
  esLargo?: boolean;
  cantidadPiezas?: number;
  descripcionPiezas?: string;
}

@Injectable()
export class VestidoDamaFactory extends AbstractPrendaFactory<VestidoDama> {
  constructor(
    @InjectRepository(VestidoDama)
    vestidoDamaRepository: Repository<VestidoDama>,
  ) {
    super(vestidoDamaRepository);
  }

  async crearPrenda(datos: VestidoDamaData): Promise<VestidoDama> {
    // Validar datos antes de crear
    if (!this.validarDatos(datos)) {
      throw new Error('Datos inválidos para crear vestido de dama');
    }

    // Verificar referencia única
    const esReferenciaUnica = await this.validarReferenciaUnica(
      datos.referencia,
    );
    if (!esReferenciaUnica) {
      throw new Error(`La referencia ${datos.referencia} ya existe`);
    }

    // Crear instancia del vestido
    const vestido = this.repository.create({
      referencia: datos.referencia,
      color: datos.color,
      marca: datos.marca,
      talla: datos.talla,
      valorAlquiler: datos.valorAlquiler,
      tienePedreria: datos.tienePedreria ?? false,
      esLargo: datos.esLargo ?? false,
      cantidadPiezas: datos.cantidadPiezas ?? 1,
      descripcionPiezas: datos.descripcionPiezas,
      disponible: true,
      estado: 'disponible',
    });

    // Guardar en base de datos
    const vestidoGuardado = await this.repository.save(vestido);

    console.log(`✅ Vestido de dama creado: ${vestidoGuardado.referencia}`);
    return vestidoGuardado;
  }

  validarDatos(datos: VestidoDamaData): boolean {
    // Validar datos comunes
    if (!this.validarDatosComunes(datos)) {
      return false;
    }

    // Validaciones específicas para vestido de dama
    if (
      datos.cantidadPiezas &&
      (datos.cantidadPiezas < 1 || datos.cantidadPiezas > 10)
    ) {
      return false;
    }

    // Si tiene múltiples piezas, debe tener descripción
    if (
      datos.cantidadPiezas &&
      datos.cantidadPiezas > 1 &&
      !datos.descripcionPiezas
    ) {
      return false;
    }

    return true;
  }

  getTipoPrenda(): string {
    return 'VestidoDama';
  }
}
