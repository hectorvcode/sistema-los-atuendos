/**
 * Setup global para tests e2e
 * Este archivo se ejecuta antes de todos los tests de integración
 */

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'los_atuendos_test';
process.env.TYPEORM_LOGGING = 'false';
process.env.LOG_LEVEL = 'error';

// Timeout global para tests (30 segundos)
jest.setTimeout(30000);

// Configuración global para Jest
beforeAll(() => {
  // Lógica que se ejecuta antes de todos los tests
  console.log('🧪 Iniciando suite de tests e2e...\n');
});

afterAll(() => {
  // Lógica que se ejecuta después de todos los tests
  console.log('\n✅ Suite de tests e2e completada');
});

// Handler para promesas no manejadas
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});