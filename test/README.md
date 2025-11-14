# Tests E2E - Guía Rápida

## 🚀 Inicio Rápido

### 1. Configurar Base de Datos de Testing

```bash
# En MySQL/XAMPP
CREATE DATABASE los_atuendos_test;
```

### 2. Ejecutar Tests

```bash
# Todos los tests E2E
npm run test:e2e

# Un módulo específico
npm run test:e2e:prendas
npm run test:e2e:clientes
npm run test:e2e:empleados
npm run test:e2e:servicios
npm run test:e2e:lavanderia

# Con cobertura
npm run test:e2e:cov

# En modo watch
npm run test:e2e:watch
```

## 📁 Estructura

```
test/
├── prendas.e2e-spec.ts        # Tests de API de Prendas (Factory Pattern)
├── clientes.e2e-spec.ts       # Tests de API de Clientes
├── empleados.e2e-spec.ts      # Tests de API de Empleados
├── servicios.e2e-spec.ts      # Tests de API de Servicios (Builder + Singleton)
├── lavanderia.e2e-spec.ts     # Tests de API de Lavandería (Decorator Pattern)
├── setup-tests.ts             # Configuración global
├── jest-e2e.json              # Configuración Jest E2E
└── helpers/
    └── test-data.helper.ts    # Helpers para generar datos de prueba
```

## 🧪 Qué se Prueba

### Prendas (100+ assertions)
- ✅ CRUD completo de prendas
- ✅ Factory Method Pattern
- ✅ Validación de tipos (vestido-dama, traje-caballero, disfraz)
- ✅ Paginación y filtros
- ✅ Validaciones de negocio

### Clientes (80+ assertions)
- ✅ CRUD completo de clientes
- ✅ Validación de email único
- ✅ Validación de número de identificación único
- ✅ Validación de formato de datos
- ✅ Whitelist validation

### Empleados (50+ assertions)
- ✅ CRUD completo de empleados
- ✅ Validaciones de unicidad
- ✅ Paginación

### Servicios (120+ assertions)
- ✅ CRUD completo de servicios
- ✅ Builder Pattern para creación compleja
- ✅ Singleton Pattern para números consecutivos
- ✅ Cálculo de valor total
- ✅ Validación de fechas
- ✅ Estadísticas

### Lavandería (150+ assertions)
- ✅ CRUD completo de items
- ✅ Decorator Pattern para cálculo de prioridades
- ✅ Cola ordenada por prioridad
- ✅ Envío de lotes
- ✅ Estadísticas
- ✅ Validación de decorators múltiples

## 🎯 Helpers Disponibles

```typescript
// Generar datos únicos
import {
  generateTimestamp,
  generatePrendaReferencia,
  generateEmail,
  generateNumeroIdentificacion,
  generateFechaFutura,
} from './helpers/test-data.helper';

// Crear objetos de prueba completos
import {
  createVestidoDamaTestData,
  createTrajeCaballeroTestData,
  createDisfrazTestData,
  createClienteTestData,
  createEmpleadoTestData,
  createServicioAlquilerTestData,
  createLavanderiaItemTestData,
} from './helpers/test-data.helper';
```

## 🔧 Configuración

### Environment Variables (.env.test)
```env
DB_NAME=los_atuendos_test
NODE_ENV=test
TYPEORM_LOGGING=false
```

### Timeout
Tests tienen 30 segundos de timeout (configurado en jest-e2e.json)

## ✅ Buenas Prácticas

1. **Tests Independientes**: Cada test crea y limpia sus propios datos
2. **Datos Únicos**: Usa helpers para evitar conflictos
3. **Cleanup**: `afterAll` limpia datos de prueba
4. **Nomenclatura**: Nombres descriptivos con `should...`

## 🐛 Troubleshooting

### Tests fallan con "Port in use"
```bash
# Detener servidor de desarrollo antes de correr tests
```

### Tests fallan con "Database not found"
```bash
# Crear base de datos de testing
CREATE DATABASE los_atuendos_test;
```

### Tests fallan con datos duplicados
```bash
# Limpiar base de datos de testing manualmente
DELETE FROM servicios_prendas;
DELETE FROM servicios;
DELETE FROM lavanderia;
DELETE FROM prendas WHERE referencia LIKE "%-TEST-%";
DELETE FROM clientes WHERE email LIKE "%@test.com";
DELETE FROM empleados WHERE email LIKE "%@test.com";
```

## 📚 Documentación Completa

Para documentación detallada, ver [docs/TESTING.md](../docs/TESTING.md)

## 📊 Cobertura

Ejecutar con cobertura:
```bash
npm run test:e2e:cov
```

Ver reporte:
```bash
# Windows
start coverage-e2e/index.html

# Linux/Mac
open coverage-e2e/index.html
```

## 🎓 Ejemplos de Tests

### Test Simple
```typescript
it('should create prenda successfully', async () => {
  const prendaData = createVestidoDamaTestData();

  const response = await request(app.getHttpServer())
    .post('/api/prendas')
    .send(prendaData)
    .expect(201);

  expect(response.body.success).toBe(true);
  expect(response.body.data.id).toBeDefined();
});
```

### Test de Validación de Patrón
```typescript
it('should validate Singleton Pattern - consecutive numbers', async () => {
  const response1 = await request(app.getHttpServer())
    .post('/api/servicios')
    .send(servicioData)
    .expect(201);

  const response2 = await request(app.getHttpServer())
    .post('/api/servicios')
    .send(servicioData)
    .expect(201);

  const num1 = parseInt(response1.body.data.numeroServicio.split('-')[1]);
  const num2 = parseInt(response2.body.data.numeroServicio.split('-')[1]);

  expect(num2).toBe(num1 + 1); // Números consecutivos
});
```

### Test de Error
```typescript
it('should fail with invalid data', async () => {
  const invalidData = { nombre: 'Test' }; // Faltan campos

  const response = await request(app.getHttpServer())
    .post('/api/clientes')
    .send(invalidData)
    .expect(400);

  expect(response.body.success).toBe(false);
  expect(response.body.message).toBeDefined();
});
```

---

**Pro Tip**: Usa `test:e2e:watch` durante desarrollo para ejecutar tests automáticamente al guardar cambios.