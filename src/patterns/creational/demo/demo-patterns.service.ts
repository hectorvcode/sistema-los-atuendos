import { Injectable } from '@nestjs/common';
import { PrendaFactoryRegistry } from '../factory/prenda-factory.registry';
import { ServicioAlquilerBuilder } from '../builder/servicio-alquiler.builder';
import { GeneradorConsecutivo } from '../singleton/generador-consecutivo.singleton';
import { VestidoDama } from '../../../modules/prendas/entities/vestido-dama.entity';
import { TrajeCaballero } from '../../../modules/prendas/entities/traje-caballero.entity';
import { Disfraz } from '../../../modules/prendas/entities/disfraz.entity';

@Injectable()
export class DemoPatternsService {
  constructor(
    private readonly factoryRegistry: PrendaFactoryRegistry,
    private readonly servicioBuilder: ServicioAlquilerBuilder,
    private readonly generadorConsecutivo: GeneradorConsecutivo,
  ) {}

  async demostrarPatroneCreacionales(): Promise<void> {
    console.log('🎭 === DEMO DE PATRONES CREACIONALES ===');

    try {
      // 1. Factory Method Demo
      await this.demoFactoryMethod();

      // 2. Singleton Demo
      await this.demoSingleton();

      // 3. Builder Demo
      await this.demoBuilder();

      console.log('✅ Demo de patrones creacionales completado exitosamente');
    } catch (error) {
      console.error('❌ Error en demo:', this.getErrorMessage(error));
    }
  }

  private async demoFactoryMethod(): Promise<void> {
    console.log('\n🏭 --- Factory Method Pattern Demo ---');

    try {
      // Crear vestido de dama
      const vestidoData = {
        referencia: 'VD-DEMO-001',
        color: 'Azul Real',
        marca: 'Elegancia Supreme',
        talla: 'M',
        valorAlquiler: 200000,
        tienePedreria: true,
        esLargo: true,
        cantidadPiezas: 3,
        descripcionPiezas: 'Vestido principal + velo + corona',
      };

      const vestido = (await this.factoryRegistry.crearPrenda(
        'vestido-dama',
        vestidoData,
      )) as VestidoDama;
      console.log(`✅ Vestido creado: ${vestido.referencia}`);

      // Crear traje de caballero
      const trajeData = {
        referencia: 'TC-DEMO-001',
        color: 'Negro',
        marca: 'Distinción',
        talla: 'L',
        valorAlquiler: 150000,
        tipo: 'frac' as const,
        tieneCorbata: false,
        tieneCorbtain: true,
        tienePlastron: false,
      };

      const traje = (await this.factoryRegistry.crearPrenda(
        'traje-caballero',
        trajeData,
      )) as TrajeCaballero;
      console.log(`✅ Traje creado: ${traje.referencia}`);

      // Crear disfraz
      const disfrazData = {
        referencia: 'DF-DEMO-001',
        color: 'Dorado',
        marca: 'Fantasía Real',
        talla: 'M',
        valorAlquiler: 80000,
        nombre: 'Rey Medieval',
        descripcion: 'Disfraz completo de rey con corona y capa',
      };

      const disfraz = (await this.factoryRegistry.crearPrenda(
        'disfraz',
        disfrazData,
      )) as Disfraz;
      console.log(
        `✅ Disfraz creado: ${disfraz.referencia} - ${disfraz.nombre}`,
      );
    } catch (error) {
      console.error(
        '❌ Error en Factory Method demo:',
        this.getErrorMessage(error),
      );
    }
  }

  private async demoSingleton(): Promise<void> {
    console.log('\n🔒 --- Singleton Pattern Demo ---');

    try {
      // Generar varios números consecutivos
      for (let i = 0; i < 3; i++) {
        const numero = await this.generadorConsecutivo.obtenerSiguienteNumero();
        console.log(`✅ Consecutivo generado: #${numero}`);
      }

      // Demostrar que es la misma instancia
      const instancia = GeneradorConsecutivo.getInstance();
      console.log(
        `✅ Instancia singleton obtenida: ${instancia ? 'Éxito' : 'Error'}`,
      );
    } catch (error) {
      console.error('❌ Error en Singleton demo:', this.getErrorMessage(error));
    }
  }

  private async demoBuilder(): Promise<void> {
    console.log('\n🏗️ --- Builder Pattern Demo ---');

    const fechaAlquiler = new Date();
    fechaAlquiler.setDate(fechaAlquiler.getDate() + 10);

    try {
      const servicio = await this.servicioBuilder
        .setCliente(1) // Cliente existente
        .setEmpleado(1) // Empleado existente
        .setFechaAlquiler(fechaAlquiler)
        .agregarPrenda(1) // Prenda existente
        .agregarPrenda(2) // Otra prenda existente
        .setObservaciones('Servicio demo creado con Builder Pattern')
        .build();

      console.log(`✅ Servicio de alquiler creado: #${servicio.numero}`);
      console.log(`   Cliente: ${servicio.cliente.nombre}`);
      console.log(`   Empleado: ${servicio.empleado.nombre}`);
      console.log(`   Prendas: ${servicio.prendas.length}`);
      console.log(`   Valor total: $${servicio.valorTotal.toLocaleString()}`);
    } catch (error) {
      console.log(
        `⚠️ Error en builder (puede ser por datos no existentes): ${this.getErrorMessage(error)}`,
      );
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Error desconocido';
  }
}
