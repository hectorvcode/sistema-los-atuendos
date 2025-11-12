import { Prenda } from '../../../modules/prendas/entities/prenda.entity';

export interface PrendaBaseData {
  referencia: string;
  color: string;
  marca: string;
  talla: string;
  valorAlquiler: number;
}

export interface IPrendaFactory {
  crearPrenda(datos: PrendaBaseData): Promise<Prenda>;
  validarDatos(datos: PrendaBaseData): boolean;
  getTipoPrenda(): string;
}
