import { Injectable } from '@nestjs/common';
import { Repository, FindOptionsWhere } from 'typeorm';
import { IPrendaFactory } from './prenda-factory.interface';
import { Prenda } from '../../../modules/prendas/entities/prenda.entity';

export interface PrendaBaseData {
  referencia: string;
  color: string;
  marca: string;
  talla: string;
  valorAlquiler: number;
}

@Injectable()
export abstract class AbstractPrendaFactory<T extends Prenda>
  implements IPrendaFactory
{
  constructor(protected repository: Repository<T>) {}

  abstract crearPrenda(datos: PrendaBaseData): Promise<T>;
  abstract validarDatos(datos: PrendaBaseData): boolean;
  abstract getTipoPrenda(): string;

  protected async validarReferenciaUnica(referencia: string): Promise<boolean> {
    const existente = await this.repository.findOne({
      where: { referencia } as FindOptionsWhere<T>,
    });
    return !existente;
  }

  protected validarDatosComunes(datos: PrendaBaseData): boolean {
    return !!(
      datos.referencia &&
      datos.referencia.trim().length > 0 &&
      datos.color &&
      datos.color.trim().length > 0 &&
      datos.marca &&
      datos.marca.trim().length > 0 &&
      datos.talla &&
      datos.talla.trim().length > 0 &&
      datos.valorAlquiler &&
      datos.valorAlquiler > 0
    );
  }
}
