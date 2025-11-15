// Configuración global para tests
jest.setTimeout(30000);

// Hook global para limpiar después de todos los tests
afterAll(async () => {
  // Esperar un momento antes de cerrar para que las conexiones se limpien
  await new Promise((resolve) => setTimeout(resolve, 1000));
});
