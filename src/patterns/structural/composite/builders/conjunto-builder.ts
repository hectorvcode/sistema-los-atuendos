// src/patterns/structural/composite/builders/conjunto-builder.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPrendaComponent } from '../interfaces/prenda-component.interface.js';
import { ConjuntoPrendasComponent } from '../components/conjunto-prendas.component.js';
import { PrendaSimpleComponent } from '../components/prenda-simple.component.js';

// ✅ CORREGIDO: Imports con rutas correctas del proyecto existente y extensiones .js
import { Prenda } from '../../../../modules/prendas/entities/prenda.entity.js';
import { VestidoDama } from '../../../../modules/prendas/entities/vestido-dama.entity.js';

export interface ConjuntoConfig {
  id?: string;
  nombre: string;
  descripcion?: string;
  referencias?: string[];
  tipo?: 'novias' | 'gala' | 'casual' | 'formal' | 'tematico';
  metadata?: { [key: string]: any };
}

@Injectable()
export class ConjuntoBuilder {
  private conjunto: ConjuntoPrendasComponent | null = null;

  constructor(
    @InjectRepository(Prenda)
    private readonly prendaRepository: Repository<Prenda>,
  ) {}

  iniciarConjunto(config: ConjuntoConfig): ConjuntoBuilder {
    const id = config.id || `conjunto_${Date.now()}`;
    this.conjunto = new ConjuntoPrendasComponent(
      id,
      config.nombre,
      config.descripcion,
    );

    // Configurar metadata
    if (config.tipo) {
      this.conjunto.setMetadata('tipo', config.tipo);
    }

    if (config.metadata) {
      Object.keys(config.metadata).forEach((key) => {
        this.conjunto!.setMetadata(key, config.metadata![key]);
      });
    }

    console.log(`✅ Conjunto iniciado: ${config.nombre} (${id})`);
    return this;
  }

  async agregarPrendaPorReferencia(
    referencia: string,
  ): Promise<ConjuntoBuilder> {
    if (!this.conjunto) {
      throw new Error('Debe iniciar un conjunto antes de agregar prendas');
    }

    const prenda = await this.prendaRepository.findOne({
      where: { referencia },
    });

    if (!prenda) {
      throw new Error(`No se encontró la prenda con referencia: ${referencia}`);
    }

    const componentePrenda = new PrendaSimpleComponent(prenda);
    this.conjunto.agregarHijo(componentePrenda);

    console.log(`✅ Prenda agregada al conjunto: ${referencia}`);
    return this;
  }

  async agregarPrendasPorReferencias(
    referencias: string[],
  ): Promise<ConjuntoBuilder> {
    for (const referencia of referencias) {
      await this.agregarPrendaPorReferencia(referencia);
    }
    return this;
  }

  agregarComponente(componente: IPrendaComponent): ConjuntoBuilder {
    if (!this.conjunto) {
      throw new Error('Debe iniciar un conjunto antes de agregar componentes');
    }

    this.conjunto.agregarHijo(componente);
    return this;
  }

  crearSubconjunto(config: ConjuntoConfig): ConjuntoBuilder {
    if (!this.conjunto) {
      throw new Error('Debe iniciar un conjunto antes de crear subconjuntos');
    }

    const subBuilder = new ConjuntoBuilder(this.prendaRepository);
    subBuilder.iniciarConjunto(config);
    const subconjunto = subBuilder.build();

    this.conjunto.agregarHijo(subconjunto);

    console.log(`✅ Subconjunto creado y agregado: ${config.nombre}`);
    return this;
  }

  async crearConjuntoVestidoCompleto(
    vestidoPrincipal: string,
    accesorios: string[] = [],
  ): Promise<ConjuntoBuilder> {
    const vestido = await this.prendaRepository.findOne({
      where: { referencia: vestidoPrincipal },
    });

    if (!vestido) {
      throw new Error(
        `No se encontró el vestido con referencia: ${vestidoPrincipal}`,
      );
    }

    // Verificar si es instancia de VestidoDama mediante propiedades específicas
    const esVestidoDama = 'tienePedreria' in vestido && 'esLargo' in vestido;
    if (!esVestidoDama) {
      throw new Error('La prenda debe ser un vestido de dama válido');
    }

    const vestidoDama = vestido as VestidoDama;
    const nombreConjunto = `Conjunto Completo ${vestidoDama.referencia}`;

    this.iniciarConjunto({
      nombre: nombreConjunto,
      descripcion: `Conjunto completo basado en ${vestidoDama.referencia}`,
      tipo: vestidoDama.esLargo ? 'gala' : 'casual',
    });

    // Agregar vestido principal
    await this.agregarPrendaPorReferencia(vestidoPrincipal);

    // Agregar accesorios si los hay
    if (accesorios.length > 0) {
      await this.agregarPrendasPorReferencias(accesorios);
    }

    // Configurar metadata específica
    this.conjunto!.setMetadata('vestidoPrincipal', vestidoPrincipal);
    this.conjunto!.setMetadata('tieneAccesorios', accesorios.length > 0);
    this.conjunto!.setMetadata('fechaCreacion', new Date().toISOString());

    return this;
  }

  configurarPrioridades(configuracion: {
    [referencia: string]: { prioridad: number; razon: string };
  }): ConjuntoBuilder {
    if (!this.conjunto) {
      throw new Error(
        'Debe iniciar un conjunto antes de configurar prioridades',
      );
    }

    Object.keys(configuracion).forEach((referencia) => {
      const componente = this.conjunto!.buscarPorReferencia(referencia);
      if (componente && !componente.esComposite()) {
        const prendaSimple = componente as PrendaSimpleComponent;
        const { prioridad, razon } = configuracion[referencia];
        prendaSimple.aplicarPrioridadEspecial(prioridad, razon);
      }
    });

    return this;
  }

  validarConjunto(): { valido: boolean; errores: string[] } {
    if (!this.conjunto) {
      return { valido: false, errores: ['No se ha iniciado un conjunto'] };
    }

    return this.conjunto.validarIntegridad();
  }

  obtenerEstadisticas(): any {
    if (!this.conjunto) {
      throw new Error('No hay conjunto para obtener estadísticas');
    }

    return this.conjunto.obtenerEstadisticas();
  }

  // ✅ MANTENIDO: Método build sincrónico
  build(): IPrendaComponent {
    if (!this.conjunto) {
      throw new Error('Debe iniciar un conjunto antes de construir');
    }

    // Validar integridad antes de construir
    const validacion = this.validarConjunto();
    if (!validacion.valido) {
      throw new Error(
        `El conjunto no es válido: ${validacion.errores.join(', ')}`,
      );
    }

    const conjuntoFinal = this.conjunto;
    this.conjunto = null; // Reset para siguiente uso

    console.log(
      `✅ Conjunto construido exitosamente: ${conjuntoFinal.getId()}`,
    );
    console.log(`   - Total piezas: ${conjuntoFinal.contarPiezas()}`);
    console.log(
      `   - Precio total: $${conjuntoFinal.calcularPrecioTotal().toLocaleString()}`,
    );

    return conjuntoFinal;
  }

  reset(): ConjuntoBuilder {
    this.conjunto = null;
    return this;
  }

  // ✅ CORREGIDOS: Métodos estáticos con manejo apropiado de async/sync
  static async crearConjuntoNovia(
    builder: ConjuntoBuilder,
    vestidoReferencia: string,
    velo?: string,
    zapatos?: string,
    accesorios?: string[],
  ): Promise<IPrendaComponent> {
    const referencias = [vestidoReferencia];
    if (velo) referencias.push(velo);
    if (zapatos) referencias.push(zapatos);
    if (accesorios) referencias.push(...accesorios);

    builder.iniciarConjunto({
      nombre: 'Conjunto de Novia',
      descripcion: 'Conjunto completo para novia',
      tipo: 'novias',
    });

    await builder.agregarPrendasPorReferencias(referencias);

    return builder.build(); // Sincrónico
  }

  static async crearConjuntoGala(
    builder: ConjuntoBuilder,
    prendaPrincipal: string,
    accesorios: string[],
  ): Promise<IPrendaComponent> {
    builder.iniciarConjunto({
      nombre: 'Conjunto de Gala',
      descripcion: 'Conjunto completo para eventos de gala',
      tipo: 'gala',
    });

    await builder.agregarPrendaPorReferencia(prendaPrincipal);
    await builder.agregarPrendasPorReferencias(accesorios);

    return builder.build(); // Sincrónico
  }

  // ✅ ELIMINADO: buildAsync() redundante que causaba errores
}
