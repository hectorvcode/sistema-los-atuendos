// src/patterns/structural/decorator/decorator.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPrendaLavanderia } from './prenda-lavanderia.interface';
import { PrendaLavanderiaBase } from './prenda-lavanderia-base.component';
import { PrendaManchadaDecorator } from './decorators/prenda-manchada.decorator';
import { PrendaDelicadaDecorator } from './decorators/prenda-delicada.decorator';
import { PrioridadAdministrativaDecorator } from './decorators/prioridad-administrativa.decorator';
import { Prenda } from '../../../modules/prendas/entities/prenda.entity';

export interface ConfiguracionMancha {
  tipo: string;
  gravedad: 'leve' | 'moderada' | 'severa';
}

export interface ConfiguracionDelicada {
  razon: string;
  cuidadoEspecial: boolean;
}

export interface ConfiguracionAdministrativa {
  nivel: 'urgente' | 'alta' | 'media';
  razon: string;
  solicitadoPor: string;
  fechaLimite?: Date;
}

export interface SolicitudLavanderia {
  referenciaPrenda: string;
  configuraciones?: {
    mancha?: ConfiguracionMancha;
    delicada?: ConfiguracionDelicada;
    administrativa?: ConfiguracionAdministrativa;
  };
}

@Injectable()
export class DecoratorService {
  constructor(
    @InjectRepository(Prenda)
    private readonly prendaRepository: Repository<Prenda>,
  ) {}

  async crearPrendaLavanderia(referencia: string): Promise<IPrendaLavanderia> {
    const prenda = await this.prendaRepository.findOne({
      where: { referencia },
    });

    if (!prenda) {
      throw new Error(`No se encontró la prenda con referencia: ${referencia}`);
    }

    return new PrendaLavanderiaBase(prenda);
  }

  aplicarDecoradorMancha(
    component: IPrendaLavanderia,
    configuracion: ConfiguracionMancha,
  ): IPrendaLavanderia {
    return new PrendaManchadaDecorator(
      component,
      configuracion.tipo,
      configuracion.gravedad,
    );
  }

  aplicarDecoradorDelicada(
    component: IPrendaLavanderia,
    configuracion: ConfiguracionDelicada,
  ): IPrendaLavanderia {
    return new PrendaDelicadaDecorator(
      component,
      configuracion.razon,
      configuracion.cuidadoEspecial,
    );
  }

  aplicarDecoradorAdministrativo(
    component: IPrendaLavanderia,
    configuracion: ConfiguracionAdministrativa,
  ): IPrendaLavanderia {
    return new PrioridadAdministrativaDecorator(
      component,
      configuracion.nivel,
      configuracion.razon,
      configuracion.solicitadoPor,
      configuracion.fechaLimite,
    );
  }

  async procesarSolicitudLavanderia(
    solicitud: SolicitudLavanderia,
  ): Promise<IPrendaLavanderia> {
    // Crear component base
    let prendaLavanderia = await this.crearPrendaLavanderia(
      solicitud.referenciaPrenda,
    );

    // Aplicar decoradores según configuración
    if (solicitud.configuraciones?.mancha) {
      prendaLavanderia = this.aplicarDecoradorMancha(
        prendaLavanderia,
        solicitud.configuraciones.mancha,
      );
    }

    if (solicitud.configuraciones?.delicada) {
      prendaLavanderia = this.aplicarDecoradorDelicada(
        prendaLavanderia,
        solicitud.configuraciones.delicada,
      );
    }

    if (solicitud.configuraciones?.administrativa) {
      prendaLavanderia = this.aplicarDecoradorAdministrativo(
        prendaLavanderia,
        solicitud.configuraciones.administrativa,
      );
    }

    return prendaLavanderia;
  }

  async procesarMultiplesSolicitudes(
    solicitudes: SolicitudLavanderia[],
  ): Promise<IPrendaLavanderia[]> {
    const resultados: IPrendaLavanderia[] = [];

    for (const solicitud of solicitudes) {
      const prendaProcesada = await this.procesarSolicitudLavanderia(solicitud);
      resultados.push(prendaProcesada);
    }

    // Ordenar por prioridad (mayor prioridad primero)
    return resultados.sort(
      (a, b) => b.calcularPrioridad() - a.calcularPrioridad(),
    );
  }

  generarReportePrioridades(prendasLavanderia: IPrendaLavanderia[]): {
    totalPrendas: number;
    prioridadPromedio: number;
    costoTotal: number;
    distribucionPorTipoLavado: { [tipo: string]: number };
    top5Prioridades: any[];
  } {
    if (prendasLavanderia.length === 0) {
      return {
        totalPrendas: 0,
        prioridadPromedio: 0,
        costoTotal: 0,
        distribucionPorTipoLavado: {},
        top5Prioridades: [],
      };
    }

    const prioridades = prendasLavanderia.map((p) => p.calcularPrioridad());
    const costos = prendasLavanderia.map((p) => p.getCosto());
    const tiposLavado = prendasLavanderia.map((p) => p.getTipoLavado());

    // Calcular distribución por tipo de lavado
    const distribucion: { [tipo: string]: number } = {};
    tiposLavado.forEach((tipo) => {
      distribucion[tipo] = (distribucion[tipo] || 0) + 1;
    });

    // Top 5 por prioridad
    const prendasOrdenadas = [...prendasLavanderia]
      .sort((a, b) => b.calcularPrioridad() - a.calcularPrioridad())
      .slice(0, 5)
      .map((p) => p.obtenerDetalleCompleto());

    return {
      totalPrendas: prendasLavanderia.length,
      prioridadPromedio:
        prioridades.reduce((a, b) => a + b, 0) / prioridades.length,
      costoTotal: costos.reduce((a, b) => a + b, 0),
      distribucionPorTipoLavado: distribucion,
      top5Prioridades: prendasOrdenadas,
    };
  }

  // Métodos de utilidad para casos comunes
  async crearSolicitudManchaSevera(
    referencia: string,
    tipoMancha: string,
  ): Promise<IPrendaLavanderia> {
    return this.procesarSolicitudLavanderia({
      referenciaPrenda: referencia,
      configuraciones: {
        mancha: {
          tipo: tipoMancha,
          gravedad: 'severa',
        },
      },
    });
  }

  async crearSolicitudDelicadaEspecial(
    referencia: string,
    razon: string,
  ): Promise<IPrendaLavanderia> {
    return this.procesarSolicitudLavanderia({
      referenciaPrenda: referencia,
      configuraciones: {
        delicada: {
          razon: razon,
          cuidadoEspecial: true,
        },
      },
    });
  }

  async crearSolicitudUrgente(
    referencia: string,
    razon: string,
    solicitadoPor: string = 'Gerencia',
    fechaLimite?: Date,
  ): Promise<IPrendaLavanderia> {
    return this.procesarSolicitudLavanderia({
      referenciaPrenda: referencia,
      configuraciones: {
        administrativa: {
          nivel: 'urgente',
          razon: razon,
          solicitadoPor: solicitadoPor,
          fechaLimite: fechaLimite,
        },
      },
    });
  }

  // Ejemplo de combinación de múltiples decoradores
  async crearSolicitudCompleja(
    referencia: string,
    tipoMancha: string,
    razonDelicada: string,
    nivelAdministrativo: 'urgente' | 'alta' | 'media' = 'alta',
  ): Promise<IPrendaLavanderia> {
    return this.procesarSolicitudLavanderia({
      referenciaPrenda: referencia,
      configuraciones: {
        mancha: {
          tipo: tipoMancha,
          gravedad: 'moderada',
        },
        delicada: {
          razon: razonDelicada,
          cuidadoEspecial: false,
        },
        administrativa: {
          nivel: nivelAdministrativo,
          razon: 'Solicitud compleja múltiples factores',
          solicitadoPor: 'Supervisor',
        },
      },
    });
  }
}
