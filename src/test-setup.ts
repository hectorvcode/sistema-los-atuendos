// Configuración global para tests
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno de test antes de que se inicialice la aplicación
dotenv.config({ path: path.resolve('.env.test') });

jest.setTimeout(30000);

// Hook global para limpiar después de todos los tests
afterAll(async () => {
  // Esperar un momento antes de cerrar para que las conexiones se limpien
  await new Promise((resolve) => setTimeout(resolve, 1000));
});
