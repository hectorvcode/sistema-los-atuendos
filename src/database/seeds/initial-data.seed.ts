import { DataSource } from 'typeorm';
import { Cliente } from '../../modules/clientes/entities/cliente.entity';
import { Empleado } from '../../modules/empleados/entities/empleado.entity';
import { VestidoDama } from '../../modules/prendas/entities/vestido-dama.entity';
import { TrajeCaballero } from '../../modules/prendas/entities/traje-caballero.entity';
import { Disfraz } from '../../modules/prendas/entities/disfraz.entity';

export class InitialDataSeed {
  public async run(dataSource: DataSource): Promise<void> {
    // Crear empleados de prueba
    const empleadoRepository = dataSource.getRepository(Empleado);
    const empleados = [
      {
        nombre: 'María García López',
        numeroIdentificacion: '12345678',
        direccion: 'Calle 123 #45-67',
        telefono: '3001234567',
        cargo: 'Administradora',
        correoElectronico: 'maria.garcia@losatuendos.com',
        fechaIngreso: new Date('2023-01-15'),
        salario: 2500000,
      },
      {
        nombre: 'Carlos Rodríguez Mesa',
        numeroIdentificacion: '87654321',
        direccion: 'Carrera 67 #89-12',
        telefono: '3007654321',
        cargo: 'Vendedor',
        correoElectronico: 'carlos.rodriguez@losatuendos.com',
        fechaIngreso: new Date('2023-03-01'),
        salario: 1800000,
      },
    ];

    for (const empleadoData of empleados) {
      const empleado = empleadoRepository.create(empleadoData);
      await empleadoRepository.save(empleado);
    }

    // Crear clientes de prueba
    const clienteRepository = dataSource.getRepository(Cliente);
    const clientes = [
      {
        numeroIdentificacion: '1010101010',
        nombre: 'Ana Sofía Martínez',
        direccion: 'Avenida 80 #123-45',
        telefono: '3101234567',
        correoElectronico: 'ana.martinez@email.com',
        fechaNacimiento: new Date('1990-05-15'),
      },
      {
        numeroIdentificacion: '2020202020',
        nombre: 'Luis Fernando Gómez',
        direccion: 'Calle 45 #67-89',
        telefono: '3207654321',
        correoElectronico: 'luis.gomez@email.com',
        fechaNacimiento: new Date('1985-08-22'),
      },
      {
        numeroIdentificacion: '3030303030',
        nombre: 'Isabella Cruz Vargas',
        direccion: 'Transversal 12 #34-56',
        telefono: '3109876543',
        correoElectronico: 'isabella.cruz@email.com',
        fechaNacimiento: new Date('1995-12-03'),
      },
    ];

    for (const clienteData of clientes) {
      const cliente = clienteRepository.create(clienteData);
      await clienteRepository.save(cliente);
    }

    // Crear vestidos de dama
    const vestidoDamaRepository = dataSource.getRepository(VestidoDama);
    const vestidos = [
      {
        referencia: 'VD001',
        color: 'Rojo',
        marca: 'Elegancia',
        talla: 'M',
        valorAlquiler: 150000,
        tienePedreria: true,
        esLargo: true,
        cantidadPiezas: 2,
        descripcionPiezas: 'Vestido principal + velo',
      },
      {
        referencia: 'VD002',
        color: 'Azul marino',
        marca: 'Sofisticada',
        talla: 'S',
        valorAlquiler: 120000,
        tienePedreria: false,
        esLargo: false,
        cantidadPiezas: 1,
      },
    ];

    for (const vestidoData of vestidos) {
      const vestido = vestidoDamaRepository.create(vestidoData);
      await vestidoDamaRepository.save(vestido);
    }

    // Crear trajes de caballero
    const trajeRepository = dataSource.getRepository(TrajeCaballero);
    const trajes = [
      {
        referencia: 'TC001',
        color: 'Negro',
        marca: 'Distinguido',
        talla: 'L',
        valorAlquiler: 100000,
        tipo: 'frac',
        tieneCorbata: false,
        tieneCorbtain: true,
        tienePlastron: false,
      },
      {
        referencia: 'TC002',
        color: 'Azul oscuro',
        marca: 'Elegante',
        talla: 'M',
        valorAlquiler: 80000,
        tipo: 'convencional',
        tieneCorbata: true,
        tieneCorbtain: false,
        tienePlastron: false,
      },
    ];

    for (const trajeData of trajes) {
      const traje = trajeRepository.create(trajeData);
      await trajeRepository.save(traje);
    }

    // Crear disfraces
    const disfrazRepository = dataSource.getRepository(Disfraz);
    const disfraces = [
      {
        referencia: 'DF001',
        color: 'Multicolor',
        marca: 'Fantasía',
        talla: 'L',
        valorAlquiler: 60000,
        nombre: 'Pirata del Caribe',
        categoria: 'Aventura',
        descripcion: 'Disfraz completo de pirata con accesorios',
        edadRecomendada: 'Adulto',
      },
      {
        referencia: 'DF002',
        color: 'Rosa',
        marca: 'Princesas',
        talla: 'S',
        valorAlquiler: 45000,
        nombre: 'Princesa Medieval',
        categoria: 'Fantasía',
        descripcion: 'Hermoso vestido de princesa estilo medieval',
        edadRecomendada: 'Niña 8-12 años',
      },
    ];

    for (const disfrazData of disfraces) {
      const disfraz = disfrazRepository.create(disfrazData);
      await disfrazRepository.save(disfraz);
    }

    console.log('✅ Datos iniciales creados exitosamente');
  }
}
