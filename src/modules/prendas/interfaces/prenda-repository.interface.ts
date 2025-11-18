import { Prenda } from '../entities/prenda.entity';

export interface PaginationResult<T> {
  data: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface PrendasAgrupadasPorTipo {
  tipo: string;
  prendas: Prenda[];
  cantidad: number;
}

export interface IPrendaRepository {
  guardar(prenda: Prenda): Promise<Prenda>;
  buscarPorReferencia(referencia: string): Promise<Prenda | null>;
  buscarPorTalla(
    talla: string,
    pagina?: number,
    limite?: number,
  ): Promise<PaginationResult<Prenda>>;
  buscarPorTallaAgrupadoPorTipo(
    talla: string,
  ): Promise<PrendasAgrupadasPorTipo[]>;
  buscarTodos(
    pagina?: number,
    limite?: number,
  ): Promise<PaginationResult<Prenda>>;
  buscarPorCriterios(
    criterios: Partial<Prenda>,
    pagina?: number,
    limite?: number,
  ): Promise<PaginationResult<Prenda>>;
  actualizar(referencia: string, datos: Partial<Prenda>): Promise<Prenda>;
  eliminar(referencia: string): Promise<boolean>;
}
