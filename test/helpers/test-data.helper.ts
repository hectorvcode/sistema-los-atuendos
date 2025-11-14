/**
 * Helper para generación de datos de prueba
 * Proporciona funciones para crear datos de test consistentes y únicos
 */

/**
 * Genera un timestamp único para usar en referencias
 */
export const generateTimestamp = (): number => {
  return Date.now();
};

/**
 * Genera una referencia única para prendas
 */
export const generatePrendaReferencia = (tipo: string): string => {
  const timestamp = generateTimestamp();
  const prefix = tipo.substring(0, 2).toUpperCase();
  return `${prefix}-TEST-${timestamp}`;
};

/**
 * Genera un email único para pruebas
 */
export const generateEmail = (prefix: string = 'test'): string => {
  const timestamp = generateTimestamp();
  return `${prefix}-${timestamp}@test.com`;
};

/**
 * Genera un número de identificación único
 */
export const generateNumeroIdentificacion = (): string => {
  const timestamp = generateTimestamp();
  return timestamp.toString().substring(0, 10);
};

/**
 * Genera una fecha futura para alquileres
 */
export const generateFechaFutura = (diasAdelante: number = 30): Date => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + diasAdelante);
  return fecha;
};

/**
 * Datos de prueba para Vestido de Dama
 */
export const createVestidoDamaTestData = () => ({
  tipo: 'vestido-dama',
  referencia: generatePrendaReferencia('VD'),
  color: 'Rojo',
  marca: 'Elegancia Test',
  talla: 'M',
  valorAlquiler: 150000,
  tienePedreria: true,
  esLargo: true,
  cantidadPiezas: 2,
  descripcionPiezas: 'Vestido principal + velo',
});

/**
 * Datos de prueba para Traje de Caballero
 */
export const createTrajeCaballeroTestData = () => ({
  tipo: 'traje-caballero',
  referencia: generatePrendaReferencia('TC'),
  color: 'Negro',
  marca: 'Elegante Test',
  talla: 'L',
  valorAlquiler: 120000,
  incluyeCorbata: true,
  tipoCorte: 'Slim fit',
  cantidadPiezas: 3,
  descripcionPiezas: 'Saco + pantalón + chaleco',
});

/**
 * Datos de prueba para Disfraz
 */
export const createDisfrazTestData = () => ({
  tipo: 'disfraz',
  referencia: generatePrendaReferencia('DF'),
  color: 'Multicolor',
  marca: 'Fantasy Test',
  talla: 'Única',
  valorAlquiler: 80000,
  personaje: 'Superhéroe',
  incluyeAccesorios: true,
  tematica: 'Comics',
});

/**
 * Datos de prueba para Cliente
 */
export const createClienteTestData = () => ({
  nombre: 'Juan',
  apellido: 'Pérez Test',
  numeroIdentificacion: generateNumeroIdentificacion(),
  email: generateEmail('cliente'),
  telefono: '3001234567',
  direccion: 'Calle Test 123',
});

/**
 * Datos de prueba para Empleado
 */
export const createEmpleadoTestData = () => ({
  nombre: 'María',
  apellido: 'García Test',
  numeroIdentificacion: generateNumeroIdentificacion(),
  email: generateEmail('empleado'),
  telefono: '3009876543',
  cargo: 'Asesor de Ventas',
  fechaContratacion: new Date().toISOString().split('T')[0],
});

/**
 * Datos de prueba para Servicio de Alquiler
 */
export const createServicioAlquilerTestData = (
  clienteId: number,
  empleadoId: number,
  prendasIds: number[],
) => ({
  clienteId,
  empleadoId,
  prendasIds,
  fechaAlquiler: generateFechaFutura(30).toISOString().split('T')[0],
  diasAlquiler: 3,
  observaciones: 'Servicio de prueba para testing',
});

/**
 * Datos de prueba para Item de Lavandería
 */
export const createLavanderiaItemTestData = (prendaId: number) => ({
  prendaId,
  esManchada: true,
  esDelicada: false,
  requiereUrgente: false,
  configuraciones: {
    mancha: {
      tipo: 'vino',
      gravedad: 'media',
    },
  },
});

/**
 * Limpia datos de test de la base de datos
 */
export const cleanTestData = async (dataSource: any) => {
  // Eliminar en orden debido a foreign keys
  await dataSource.query('DELETE FROM servicios_prendas WHERE servicio_id IN (SELECT id FROM servicios WHERE observaciones LIKE "%testing%")');
  await dataSource.query('DELETE FROM servicios WHERE observaciones LIKE "%testing%"');
  await dataSource.query('DELETE FROM lavanderia WHERE id IS NOT NULL');
  await dataSource.query('DELETE FROM prendas WHERE referencia LIKE "%-TEST-%"');
  await dataSource.query('DELETE FROM clientes WHERE email LIKE "%@test.com"');
  await dataSource.query('DELETE FROM empleados WHERE email LIKE "%@test.com"');
};