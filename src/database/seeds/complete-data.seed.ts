import { DataSource } from 'typeorm';
import { Cliente } from '../../modules/clientes/entities/cliente.entity';
import { Empleado } from '../../modules/empleados/entities/empleado.entity';
import { VestidoDama } from '../../modules/prendas/entities/vestido-dama.entity';
import { TrajeCaballero } from '../../modules/prendas/entities/traje-caballero.entity';
import { Disfraz } from '../../modules/prendas/entities/disfraz.entity';
import { ServicioAlquiler } from '../../modules/servicios/entities/servicio-alquiler.entity';
import { ItemLavanderia } from '../../modules/lavanderia/entities/item-lavanderia.entity';
import { Consecutivo } from '../../patterns/creational/singleton/consecutivo.entity';

/**
 * Seed completo con datos realistas para demostración y testing
 * Incluye: Prendas, Clientes, Empleados, Servicios y Lavandería
 */
export class CompleteDataSeed {
  private clientes: Cliente[] = [];
  private empleados: Empleado[] = [];
  private vestidosDama: VestidoDama[] = [];
  private trajes: TrajeCaballero[] = [];
  private disfraces: Disfraz[] = [];
  private servicios: ServicioAlquiler[] = [];

  public async run(dataSource: DataSource): Promise<void> {
    console.log('🌱 Iniciando seed de datos completos...\n');

    // Orden de creación respetando dependencias
    await this.seedEmpleados(dataSource);
    await this.seedClientes(dataSource);
    await this.seedVestidosDama(dataSource);
    await this.seedTrajes(dataSource);
    await this.seedDisfraces(dataSource);
    await this.seedConsecutivos(dataSource);
    // NOTE: Los servicios y lavandería deben crearse a través de la API
    // para respetar los patrones Builder, Singleton y Decorator
    // await this.seedServicios(dataSource);
    // await this.seedLavanderia(dataSource);

    console.log('\n✅ Seed de datos completos finalizado exitosamente!');
    this.printSummary();
  }

  /**
   * EMPLEADOS - Personal de la tienda
   */
  private async seedEmpleados(dataSource: DataSource): Promise<void> {
    console.log('👔 Creando empleados...');
    const repository = dataSource.getRepository(Empleado);

    const empleadosData = [
      {
        nombre: 'María Fernanda García López',
        numeroIdentificacion: '1010101010',
        correoElectronico: 'maria.garcia@losatuendos.com',
        telefono: '3001234567',
        direccion: 'Calle 123 #45-67, Bogotá',
        cargo: 'Gerente General',
        fechaIngreso: new Date('2020-01-15'),
        salario: 3500000,
      },
      {
        nombre: 'Carlos Andrés Rodríguez Mesa',
        numeroIdentificacion: '1020304050',
        correoElectronico: 'carlos.rodriguez@losatuendos.com',
        telefono: '3007654321',
        direccion: 'Carrera 67 #89-12, Bogotá',
        cargo: 'Asesor de Ventas Senior',
        fechaIngreso: new Date('2020-06-01'),
        salario: 2200000,
      },
      {
        nombre: 'Laura Valentina Martínez Pérez',
        numeroIdentificacion: '1030405060',
        correoElectronico: 'laura.martinez@losatuendos.com',
        telefono: '3109876543',
        direccion: 'Avenida 45 #23-45, Bogotá',
        cargo: 'Asesora de Ventas',
        fechaIngreso: new Date('2021-03-10'),
        salario: 1800000,
      },
      {
        nombre: 'Juan Pablo Hernández Silva',
        numeroIdentificacion: '1040506070',
        correoElectronico: 'juan.hernandez@losatuendos.com',
        telefono: '3156789012',
        direccion: 'Transversal 12 #34-56, Bogotá',
        cargo: 'Coordinador de Lavandería',
        fechaIngreso: new Date('2021-08-20'),
        salario: 2000000,
      },
      {
        nombre: 'Camila Andrea López Torres',
        numeroIdentificacion: '1050607080',
        correoElectronico: 'camila.lopez@losatuendos.com',
        telefono: '3201234567',
        direccion: 'Calle 78 #90-12, Bogotá',
        cargo: 'Operaria de Lavandería',
        fechaIngreso: new Date('2022-02-14'),
        salario: 1500000,
      },
    ];

    for (const data of empleadosData) {
      const empleado = repository.create(data);
      const saved = await repository.save(empleado);
      this.empleados.push(saved);
    }

    console.log(`   ✓ ${this.empleados.length} empleados creados`);
  }

  /**
   * CLIENTES - Usuarios del servicio
   */
  private async seedClientes(dataSource: DataSource): Promise<void> {
    console.log('👥 Creando clientes...');
    const repository = dataSource.getRepository(Cliente);

    const clientesData = [
      {
        nombre: 'Ana Sofía Martínez Ruiz',
        numeroIdentificacion: '2010101010',
        correoElectronico: 'ana.martinez@email.com',
        telefono: '3101234567',
        direccion: 'Avenida 80 #123-45, Bogotá',
        fechaNacimiento: new Date('1990-05-15'),
      },
      {
        nombre: 'Luis Fernando Gómez Castro',
        numeroIdentificacion: '2020202020',
        correoElectronico: 'luis.gomez@email.com',
        telefono: '3207654321',
        direccion: 'Calle 45 #67-89, Bogotá',
        fechaNacimiento: new Date('1985-08-22'),
      },
      {
        nombre: 'Isabella Cruz Vargas',
        numeroIdentificacion: '2030303030',
        correoElectronico: 'isabella.cruz@email.com',
        telefono: '3109876543',
        direccion: 'Transversal 12 #34-56, Bogotá',
        fechaNacimiento: new Date('1995-12-03'),
      },
      {
        nombre: 'Sebastián Ramírez Ortiz',
        numeroIdentificacion: '2040404040',
        correoElectronico: 'sebastian.ramirez@email.com',
        telefono: '3156789012',
        direccion: 'Carrera 90 #12-34, Bogotá',
        fechaNacimiento: new Date('1988-03-17'),
      },
      {
        nombre: 'Valentina Torres Mendoza',
        numeroIdentificacion: '2050505050',
        correoElectronico: 'valentina.torres@email.com',
        telefono: '3201234567',
        direccion: 'Calle 100 #56-78, Bogotá',
        fechaNacimiento: new Date('1992-07-25'),
      },
      {
        nombre: 'Diego Alejandro Moreno Sánchez',
        numeroIdentificacion: '2060606060',
        correoElectronico: 'diego.moreno@email.com',
        telefono: '3307654321',
        direccion: 'Avenida 19 #23-45, Bogotá',
        fechaNacimiento: new Date('1987-11-08'),
      },
      {
        nombre: 'Mariana Jiménez Rojas',
        numeroIdentificacion: '2070707070',
        correoElectronico: 'mariana.jimenez@email.com',
        telefono: '3409876543',
        direccion: 'Transversal 34 #67-89, Bogotá',
        fechaNacimiento: new Date('1993-04-30'),
      },
      {
        nombre: 'Andrés Felipe Díaz Herrera',
        numeroIdentificacion: '2080808080',
        correoElectronico: 'andres.diaz@email.com',
        telefono: '3156789012',
        direccion: 'Calle 127 #45-67, Bogotá',
        fechaNacimiento: new Date('1991-09-14'),
      },
    ];

    for (const data of clientesData) {
      const cliente = repository.create(data);
      const saved = await repository.save(cliente);
      this.clientes.push(saved);
    }

    console.log(`   ✓ ${this.clientes.length} clientes creados`);
  }

  /**
   * VESTIDOS DE DAMA - Prendas elegantes
   */
  private async seedVestidosDama(dataSource: DataSource): Promise<void> {
    console.log('👗 Creando vestidos de dama...');
    const repository = dataSource.getRepository(VestidoDama);

    const vestidosData = [
      {
        referencia: 'VD001',
        color: 'Rojo Pasión',
        marca: 'Elegancia Suprema',
        talla: 'M',
        valorAlquiler: 180000,
        disponible: true,
        estado: 'disponible',
        tienePedreria: true,
        esLargo: true,
        cantidadPiezas: 2,
        descripcionPiezas: 'Vestido largo de gala + velo decorado',
      },
      {
        referencia: 'VD002',
        color: 'Azul Marino Elegante',
        marca: 'Sofisticada Boutique',
        talla: 'S',
        valorAlquiler: 150000,
        disponible: true,
        estado: 'disponible',
        tienePedreria: false,
        esLargo: true,
        cantidadPiezas: 1,
        descripcionPiezas: 'Vestido largo corte sirena',
      },
      {
        referencia: 'VD003',
        color: 'Negro Terciopelo',
        marca: 'Elegancia Suprema',
        talla: 'L',
        valorAlquiler: 200000,
        disponible: true,
        estado: 'disponible',
        tienePedreria: true,
        esLargo: true,
        cantidadPiezas: 3,
        descripcionPiezas: 'Vestido + capa + guantes largos',
      },
      {
        referencia: 'VD004',
        color: 'Dorado Brillante',
        marca: 'Divas Collection',
        talla: 'M',
        valorAlquiler: 220000,
        disponible: false,
        estado: 'alquilado',
        tienePedreria: true,
        esLargo: true,
        cantidadPiezas: 2,
        descripcionPiezas: 'Vestido dorado + tocado de pedrería',
      },
      {
        referencia: 'VD005',
        color: 'Verde Esmeralda',
        marca: 'Elegancia Suprema',
        talla: 'S',
        valorAlquiler: 170000,
        disponible: true,
        estado: 'disponible',
        tienePedreria: false,
        esLargo: false,
        cantidadPiezas: 1,
        descripcionPiezas: 'Vestido corto cocktail',
      },
      {
        referencia: 'VD006',
        color: 'Blanco Perla',
        marca: 'Novias Elegantes',
        talla: 'M',
        valorAlquiler: 300000,
        disponible: true,
        estado: 'disponible',
        tienePedreria: true,
        esLargo: true,
        cantidadPiezas: 4,
        descripcionPiezas: 'Vestido de novia + velo + guantes + corona',
      },
      {
        referencia: 'VD007',
        color: 'Rosa Cuarzo',
        marca: 'Sofisticada Boutique',
        talla: 'L',
        valorAlquiler: 160000,
        disponible: true,
        estado: 'disponible',
        tienePedreria: false,
        esLargo: true,
        cantidadPiezas: 1,
        descripcionPiezas: 'Vestido largo para damas de honor',
      },
      {
        referencia: 'VD008',
        color: 'Plateado Brillante',
        marca: 'Divas Collection',
        talla: 'S',
        valorAlquiler: 190000,
        disponible: false,
        estado: 'en_lavanderia',
        tienePedreria: true,
        esLargo: false,
        cantidadPiezas: 2,
        descripcionPiezas: 'Vestido corto + bolso de mano',
      },
    ];

    for (const data of vestidosData) {
      const vestido = repository.create(data);
      const saved = await repository.save(vestido);
      this.vestidosDama.push(saved);
    }

    console.log(`   ✓ ${this.vestidosDama.length} vestidos de dama creados`);
  }

  /**
   * TRAJES DE CABALLERO - Prendas formales masculinas
   */
  private async seedTrajes(dataSource: DataSource): Promise<void> {
    console.log('🤵 Creando trajes de caballero...');
    const repository = dataSource.getRepository(TrajeCaballero);

    const trajesData = [
      {
        referencia: 'TC001',
        color: 'Negro Clásico',
        marca: 'Distinguido Gentleman',
        talla: 'L',
        valorAlquiler: 120000,
        disponible: true,
        estado: 'disponible',
        incluyeCorbata: true,
        tipoCorte: 'Clásico',
        cantidadPiezas: 4,
        descripcionPiezas: 'Saco + pantalón + chaleco + corbata',
      },
      {
        referencia: 'TC002',
        color: 'Azul Oscuro',
        marca: 'Elegante Men',
        talla: 'M',
        valorAlquiler: 100000,
        disponible: true,
        estado: 'disponible',
        incluyeCorbata: true,
        tipoCorte: 'Slim Fit',
        cantidadPiezas: 3,
        descripcionPiezas: 'Saco + pantalón + corbata',
      },
      {
        referencia: 'TC003',
        color: 'Gris Oxford',
        marca: 'Distinguido Gentleman',
        talla: 'XL',
        valorAlquiler: 110000,
        disponible: true,
        estado: 'disponible',
        incluyeCorbata: false,
        tipoCorte: 'Regular Fit',
        cantidadPiezas: 3,
        descripcionPiezas: 'Saco + pantalón + moño',
      },
      {
        referencia: 'TC004',
        color: 'Beige Claro',
        marca: 'Summer Collection',
        talla: 'M',
        valorAlquiler: 95000,
        disponible: true,
        estado: 'disponible',
        incluyeCorbata: true,
        tipoCorte: 'Slim Fit',
        cantidadPiezas: 2,
        descripcionPiezas: 'Saco + pantalón',
      },
      {
        referencia: 'TC005',
        color: 'Negro Esmoquin',
        marca: 'Premium Tuxedo',
        talla: 'L',
        valorAlquiler: 180000,
        disponible: false,
        estado: 'alquilado',
        incluyeCorbata: false,
        tipoCorte: 'Clásico',
        cantidadPiezas: 5,
        descripcionPiezas: 'Saco + pantalón + camisa + moño + fajín',
      },
      {
        referencia: 'TC006',
        color: 'Azul Rey',
        marca: 'Elegante Men',
        talla: 'S',
        valorAlquiler: 105000,
        disponible: true,
        estado: 'disponible',
        incluyeCorbata: true,
        tipoCorte: 'Slim Fit',
        cantidadPiezas: 3,
        descripcionPiezas: 'Saco + pantalón + corbata',
      },
    ];

    for (const data of trajesData) {
      const traje = repository.create(data);
      const saved = await repository.save(traje);
      this.trajes.push(saved);
    }

    console.log(`   ✓ ${this.trajes.length} trajes de caballero creados`);
  }

  /**
   * DISFRACES - Para fiestas y eventos temáticos
   */
  private async seedDisfraces(dataSource: DataSource): Promise<void> {
    console.log('🎭 Creando disfraces...');
    const repository = dataSource.getRepository(Disfraz);

    const disfracesData = [
      {
        referencia: 'DF001',
        color: 'Multicolor Caribeño',
        marca: 'Fantasía Total',
        talla: 'L',
        valorAlquiler: 80000,
        disponible: true,
        estado: 'disponible',
        personaje: 'Pirata del Caribe',
        incluyeAccesorios: true,
        tematica: 'Aventura',
        nombre: 'Pirata Jack',
        categoria: 'Piratas',
        descripcion: 'Disfraz completo de pirata con sombrero, espada y parche',
        accesoriosIncluidos: 'Sombrero tricornio, espada de plástico, parche',
        edadRecomendada: 'Adulto',
      },
      {
        referencia: 'DF002',
        color: 'Rosa Princesa',
        marca: 'Reino Mágico',
        talla: 'S',
        valorAlquiler: 60000,
        disponible: true,
        estado: 'disponible',
        personaje: 'Princesa Medieval',
        incluyeAccesorios: true,
        tematica: 'Fantasía',
        nombre: 'Princesa Aurora',
        categoria: 'Princesas',
        descripcion: 'Hermoso vestido de princesa estilo medieval con corona',
        accesoriosIncluidos: 'Corona dorada, varita mágica',
        edadRecomendada: 'Niña 8-12 años',
      },
      {
        referencia: 'DF003',
        color: 'Rojo y Azul',
        marca: 'Superhéroes Inc',
        talla: 'M',
        valorAlquiler: 70000,
        disponible: true,
        estado: 'disponible',
        personaje: 'Superhéroe Arácnido',
        incluyeAccesorios: true,
        tematica: 'Superhéroes',
        nombre: 'Spider Hero',
        categoria: 'Superhéroes',
        descripcion: 'Traje completo de superhéroe arácnido',
        accesoriosIncluidos: 'Máscara, guantes con telaraña',
        edadRecomendada: 'Niño/Adulto joven',
      },
      {
        referencia: 'DF004',
        color: 'Verde Dinosaurio',
        marca: 'Prehistoria Fun',
        talla: 'M',
        valorAlquiler: 55000,
        disponible: true,
        estado: 'disponible',
        personaje: 'T-Rex',
        incluyeAccesorios: false,
        tematica: 'Animales',
        nombre: 'Dinosaurio Rex',
        categoria: 'Animales',
        descripcion: 'Disfraz inflable de Tiranosaurio Rex',
        edadRecomendada: 'Niño 5-10 años',
      },
      {
        referencia: 'DF005',
        color: 'Negro Batman',
        marca: 'DC Heroes',
        talla: 'L',
        valorAlquiler: 90000,
        disponible: false,
        estado: 'alquilado',
        personaje: 'Caballero Oscuro',
        incluyeAccesorios: true,
        tematica: 'Superhéroes',
        nombre: 'Dark Knight',
        categoria: 'Superhéroes',
        descripcion: 'Traje completo del Caballero Oscuro',
        accesoriosIncluidos: 'Máscara, capa, cinturón de utilidades',
        edadRecomendada: 'Adulto',
      },
      {
        referencia: 'DF006',
        color: 'Blanco y Azul',
        marca: 'Frozen Dreams',
        talla: 'S',
        valorAlquiler: 65000,
        disponible: true,
        estado: 'disponible',
        personaje: 'Reina de Hielo',
        incluyeAccesorios: true,
        tematica: 'Fantasía',
        nombre: 'Ice Queen',
        categoria: 'Princesas',
        descripcion: 'Vestido largo estilo reina de hielo con capa',
        accesoriosIncluidos: 'Corona de hielo, capa brillante',
        edadRecomendada: 'Niña 6-12 años',
      },
    ];

    for (const data of disfracesData) {
      const disfraz = repository.create(data);
      const saved = await repository.save(disfraz);
      this.disfraces.push(saved);
    }

    console.log(`   ✓ ${this.disfraces.length} disfraces creados`);
  }

  /**
   * CONSECUTIVOS - Inicializar generador de números
   */
  private async seedConsecutivos(dataSource: DataSource): Promise<void> {
    console.log('🔢 Inicializando consecutivos...');
    const repository = dataSource.getRepository(Consecutivo);

    const consecutivo = repository.create({
      tipo: 'ALQ',
      ultimoNumero: 0,
    });

    await repository.save(consecutivo);
    console.log('   ✓ Consecutivo inicializado');
  }

  /**
   * SERVICIOS DE ALQUILER - Transacciones de alquiler
   */
  private async seedServicios(dataSource: DataSource): Promise<void> {
    console.log('📋 Creando servicios de alquiler...');
    const repository = dataSource.getRepository(ServicioAlquiler);

    // Preparar fechas
    const hoy = new Date();
    const hace7Dias = new Date(hoy);
    hace7Dias.setDate(hoy.getDate() - 7);
    const hace3Dias = new Date(hoy);
    hace3Dias.setDate(hoy.getDate() - 3);
    const en5Dias = new Date(hoy);
    en5Dias.setDate(hoy.getDate() + 5);
    const en10Dias = new Date(hoy);
    en10Dias.setDate(hoy.getDate() + 10);

    const serviciosData = [
      {
        cliente: this.clientes[0],
        empleado: this.empleados[1],
        prendas: [this.vestidosDama[3]], // VD004 - marcado como alquilado
        numeroServicio: 'ALQ-0001',
        fechaAlquiler: hace7Dias,
        diasAlquiler: 3,
        valorTotal: this.vestidosDama[3].valorAlquiler * 3,
        estado: 'activo',
        observaciones: 'Evento de gala empresarial',
      },
      {
        cliente: this.clientes[1],
        empleado: this.empleados[2],
        prendas: [this.trajes[4]], // TC005 - marcado como alquilado
        numeroServicio: 'ALQ-0002',
        fechaAlquiler: hace3Dias,
        diasAlquiler: 2,
        valorTotal: this.trajes[4].valorAlquiler * 2,
        estado: 'activo',
        observaciones: 'Matrimonio familiar',
      },
      {
        cliente: this.clientes[2],
        empleado: this.empleados[1],
        prendas: [this.disfraces[4]], // DF005 - marcado como alquilado
        numeroServicio: 'ALQ-0003',
        fechaAlquiler: hace3Dias,
        diasAlquiler: 1,
        valorTotal: this.disfraces[4].valorAlquiler * 1,
        estado: 'activo',
        observaciones: 'Fiesta temática de superhéroes',
      },
      {
        cliente: this.clientes[3],
        empleado: this.empleados[2],
        prendas: [this.vestidosDama[0], this.vestidosDama[1]],
        numeroServicio: 'ALQ-0004',
        fechaAlquiler: en5Dias,
        diasAlquiler: 4,
        valorTotal:
          (this.vestidosDama[0].valorAlquiler +
            this.vestidosDama[1].valorAlquiler) *
          4,
        estado: 'reservado',
        observaciones: 'Quinceañero - Reserva anticipada',
      },
      {
        cliente: this.clientes[4],
        empleado: this.empleados[1],
        prendas: [this.trajes[0], this.trajes[1]],
        numeroServicio: 'ALQ-0005',
        fechaAlquiler: en10Dias,
        diasAlquiler: 2,
        valorTotal:
          (this.trajes[0].valorAlquiler + this.trajes[1].valorAlquiler) * 2,
        estado: 'reservado',
        observaciones: 'Evento corporativo - Dos ejecutivos',
      },
    ];

    for (const data of serviciosData) {
      const servicio = repository.create(data);
      const saved = await repository.save(servicio);
      this.servicios.push(saved);
    }

    console.log(`   ✓ ${this.servicios.length} servicios de alquiler creados`);
  }

  /**
   * LAVANDERÍA - Items con prioridades variadas (Decorator Pattern)
   */
  private async seedLavanderia(dataSource: DataSource): Promise<void> {
    console.log('🧺 Creando cola de lavandería...');
    const repository = dataSource.getRepository(ItemLavanderia);

    const lavanderiaData = [
      {
        prenda: this.vestidosDama[7], // VD008 - en_lavanderia
        esManchada: true,
        esDelicada: true,
        requiereUrgente: false,
        prioridad: 45, // Manchada (20) + Delicada (25)
        estado: 'pendiente',
        observaciones: 'Mancha de vino en la falda',
        configuraciones: JSON.stringify({
          mancha: {
            tipo: 'vino',
            ubicacion: 'falda',
            gravedad: 'media',
          },
          delicada: {
            tipoTela: 'satén con pedrería',
            cuidadosEspeciales: 'Lavado a mano, no planchar directamente',
          },
        }),
      },
      {
        prenda: this.vestidosDama[2], // VD003
        esManchada: false,
        esDelicada: true,
        requiereUrgente: true,
        prioridad: 85, // Delicada (25) + Urgente (60)
        estado: 'pendiente',
        observaciones: 'Cliente necesita para evento mañana',
        configuraciones: JSON.stringify({
          delicada: {
            tipoTela: 'terciopelo',
            cuidadosEspeciales: 'No usar calor excesivo',
          },
          urgente: {
            motivo: 'Evento VIP mañana',
            fechaLimite: new Date(
              Date.now() + 24 * 60 * 60 * 1000,
            ).toISOString(),
          },
        }),
      },
      {
        prenda: this.trajes[2], // TC003
        esManchada: true,
        esDelicada: false,
        requiereUrgente: false,
        prioridad: 20, // Solo manchada
        estado: 'pendiente',
        observaciones: 'Manchas de comida en el saco',
        configuraciones: JSON.stringify({
          mancha: {
            tipo: 'comida',
            ubicacion: 'saco frontal',
            gravedad: 'leve',
          },
        }),
      },
      {
        prenda: this.disfraces[1], // DF002
        esManchada: false,
        esDelicada: true,
        requiereUrgente: false,
        prioridad: 25, // Solo delicada
        estado: 'pendiente',
        observaciones: 'Tela delicada, requiere cuidado especial',
        configuraciones: JSON.stringify({
          delicada: {
            tipoTela: 'tul decorado',
            cuidadosEspeciales: 'Lavado suave, secar a la sombra',
          },
        }),
      },
      {
        prenda: this.vestidosDama[5], // VD006 - Vestido de novia
        esManchada: true,
        esDelicada: true,
        requiereUrgente: true,
        prioridad: 105, // Manchada (20) + Delicada (25) + Urgente (60)
        estado: 'en_proceso',
        observaciones: 'URGENTE: Vestido de novia con mancha de maquillaje',
        configuraciones: JSON.stringify({
          mancha: {
            tipo: 'maquillaje',
            ubicacion: 'cuello y escote',
            gravedad: 'severa',
          },
          delicada: {
            tipoTela: 'encaje y satén',
            cuidadosEspeciales: 'Tratamiento profesional especializado',
          },
          urgente: {
            motivo: 'Boda en 3 días',
            fechaLimite: new Date(
              Date.now() + 3 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          },
        }),
      },
      {
        prenda: this.trajes[1], // TC002
        esManchada: false,
        esDelicada: false,
        requiereUrgente: false,
        prioridad: 10, // Prioridad base
        estado: 'pendiente',
        observaciones: 'Limpieza de mantenimiento regular',
        configuraciones: JSON.stringify({}),
      },
    ];

    for (const data of lavanderiaData) {
      const item = repository.create(data);
      await repository.save(item);
    }

    console.log(`   ✓ ${lavanderiaData.length} items de lavandería creados`);
  }

  /**
   * Imprimir resumen de datos creados
   */
  private printSummary(): void {
    console.log('\n📊 RESUMEN DE DATOS CREADOS:');
    console.log('═══════════════════════════════════════');
    console.log(`   👔 Empleados:              ${this.empleados.length}`);
    console.log(`   👥 Clientes:               ${this.clientes.length}`);
    console.log(`   👗 Vestidos de Dama:       ${this.vestidosDama.length}`);
    console.log(`   🤵 Trajes de Caballero:    ${this.trajes.length}`);
    console.log(`   🎭 Disfraces:              ${this.disfraces.length}`);
    console.log('═══════════════════════════════════════');
    console.log(
      `   TOTAL PRENDAS:             ${this.vestidosDama.length + this.trajes.length + this.disfraces.length}`,
    );
    console.log('═══════════════════════════════════════');
    console.log('\n💡 Nota: Los servicios y lavandería deben crearse');
    console.log('   a través de la API REST para respetar los');
    console.log('   patrones Builder, Singleton y Decorator.\n');
  }
}
