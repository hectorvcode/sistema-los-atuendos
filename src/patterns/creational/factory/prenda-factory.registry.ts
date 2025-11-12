import { Injectable } from '@nestjs/common';
import { IPrendaFactory, PrendaBaseData } from './prenda-factory.interface';
import { VestidoDamaFactory } from './vestido-dama.factory';
import { TrajeCaballeroFactory } from './traje-caballero.factory';
import { DisfrazFactory } from './disfraz.factory';
import { Prenda } from '../../../modules/prendas/entities/prenda.entity';

@Injectable()
export class PrendaFactoryRegistry {
  private factories: Map<string, IPrendaFactory> = new Map();

  constructor(
    private vestidoDamaFactory: VestidoDamaFactory,
    private trajeCaballeroFactory: TrajeCaballeroFactory,
    private disfrazFactory: DisfrazFactory,
  ) {
    this.registrarFactories();
  }

  private registrarFactories(): void {
    this.factories.set('vestido-dama', this.vestidoDamaFactory);
    this.factories.set('traje-caballero', this.trajeCaballeroFactory);
    this.factories.set('disfraz', this.disfrazFactory);
  }

  getFactory(tipo: string): IPrendaFactory {
    const factory = this.factories.get(tipo.toLowerCase());
    if (!factory) {
      throw new Error(`Factory no encontrada para tipo: ${tipo}`);
    }
    return factory;
  }

  getTiposDisponibles(): string[] {
    return Array.from(this.factories.keys());
  }

  async crearPrenda(tipo: string, datos: PrendaBaseData): Promise<Prenda> {
    const factory = this.getFactory(tipo);
    return await factory.crearPrenda(datos);
  }
}
