# Documentación de Testing - Los Atuendos

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Estrategia de Testing](#estrategia-de-testing)
3. [Configuración del Entorno](#configuración-del-entorno)
4. [Tests Unitarios](#tests-unitarios)
5. [Comandos de Testing](#comandos-de-testing)
6. [Cobertura de Código](#cobertura-de-código)
7. [Buenas Prácticas](#buenas-prácticas)
8. [Troubleshooting](#troubleshooting)

---

## Introducción

Este documento describe la estrategia de testing implementada en el proyecto Los Atuendos. El proyecto utiliza **Jest** como framework de testing principal.

### Objetivos del Testing

- Validar la correcta implementación de patrones de diseño
- Asegurar la integridad de los datos y reglas de negocio
- Facilitar refactorización segura del código
- Documentar el comportamiento esperado del sistema

---

## Estrategia de Testing

### Tests Unitarios

**Propósito**: Validar la lógica de negocio y patrones de diseño de forma aislada.

**Ubicación**: `src/*/test/*.spec.ts`

**Cobertura**:

- Factory Method Pattern (Creación de prendas)
- Builder Pattern (Construcción de servicios)
- Singleton Pattern (Generación de consecutivos)
- Decorator Pattern (Cálculo de prioridades)
- Adapter Pattern (Abstracción de repositorios)
- Composite Pattern (Gestión de conjuntos)
- Facade Pattern (Simplificación de operaciones)
- State Pattern (Gestión de estados de servicios)

---

## Configuración del Entorno

### Requisitos Previos

1. **Dependencias Instaladas**
   ```bash
   npm install
   ```

2. **MySQL en Ejecución**
   - Iniciar XAMPP o MySQL Server
   - Asegurar que el puerto 3306 está disponible

3. **Base de Datos de Test Configurada**
   ```bash
   # Crear base de datos de test (solo primera vez)
   mysql -u root -p -e "CREATE DATABASE los_atuendos_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

4. **Archivo de Configuración `.env.test`**

   El proyecto ya incluye este archivo con la configuración:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=
   DB_NAME=los_atuendos_test
   NODE_ENV=test
   ```

### Configuración Importante

Los tests están configurados para ejecutarse **secuencialmente** (`--runInBand`) para evitar conflictos de concurrencia con MySQL. Esto significa que:

- Los tests se ejecutan uno después del otro (no en paralelo)
- La base de datos se limpia automáticamente entre cada test suite (`dropSchema: true`)
- El tiempo de ejecución es de aproximadamente 55 segundos para todos los tests

### Estructura de Archivos

```
los-atuendos/
├── src/
│   ├── patterns/
│   │   ├── creational/
│   │   │   └── test/
│   │   │       ├── factory.spec.ts
│   │   │       ├── builder.spec.ts
│   │   │       └── singleton.spec.ts
│   │   ├── structural/
│   │   │   ├── adapter/test/adapter.spec.ts
│   │   │   ├── decorator/test/decorator.spec.ts
│   │   │   ├── composite/test/composite.spec.ts
│   │   │   └── facade/test/facade.spec.ts
│   │   └── behavioral/
│   │       └── state/test/servicio-state.spec.ts
│   └── modules/
│       ├── prendas/test/
│       ├── clientes/test/
│       └── servicios/test/
├── coverage/           # Cobertura de tests unitarios
└── docs/
    └── TESTING.md      # Este documento
```

---

## Tests Unitarios

### Ejecutar Tests Unitarios

```bash
# Ejecutar todos los tests unitarios
npm run test:unit

# Ejecutar en modo watch (útil durante desarrollo)
npm run test:unit:watch

# Ejecutar con reporte de cobertura
npm run test:unit:cov
```

### Tests por Patrón de Diseño

#### Command Pattern

```bash
npm run test -- command
```

**Valida**:

- Ejecución correcta de comandos (confirmar, entregar, devolver, cancelar)
- Funcionalidad de undo (deshacer operaciones)
- Funcionalidad de redo (rehacer operaciones deshechas)
- Gestión del historial de comandos (CommandHistory)
- Límite de historial (máximo 50 comandos)
- Metadata de ejecución (timestamp, parámetros, resultados)
- CommandInvoker ejecuta y registra comandos correctamente
- CommandFactory crea comandos con dependencias inyectadas

**Ejemplo de Test**:

```typescript
it('should execute confirm command and register in history', async () => {
  const command = commandFactory.createConfirmarServicioCommand(servicioId);

  const result = await commandInvoker.execute(command);

  expect(result.estado).toBe('confirmado');
  expect(commandInvoker.canUndo()).toBe(true);

  const history = commandInvoker.getHistory();
  expect(history).toHaveLength(1);
  expect(history[0].commandName).toBe('ConfirmarServicioCommand');
});

it('should undo confirm command', async () => {
  const command = commandFactory.createConfirmarServicioCommand(servicioId);
  await commandInvoker.execute(command);

  await commandInvoker.undo();

  const servicio = await servicioRepository.findOne({ where: { id: servicioId } });
  expect(servicio.estado).toBe('pendiente');
  expect(commandInvoker.canRedo()).toBe(true);
});
```

#### Factory Method Pattern

```bash
npm run test:factory
```

**Valida**:

- Creación correcta de diferentes tipos de prendas
- Validación de datos antes de crear
- Registry de factories funciona correctamente
- Manejo de errores para tipos inválidos

**Ejemplo de Test**:

```typescript
it('should create a vestido de dama successfully', async () => {
  const vestidoData = {
    referencia: 'VD-TEST-001',
    color: 'Rojo',
    marca: 'Test Elegancia',
    talla: 'M',
    valorAlquiler: 150000,
    tienePedreria: true,
    esLargo: true,
  };

  const vestido = await vestidoDamaFactory.crearPrenda(vestidoData);

  expect(vestido).toBeDefined();
  expect(vestido.referencia).toBe(vestidoData.referencia);
  expect(vestido.tienePedreria).toBe(true);
});
```

#### Builder Pattern

```bash
npm run test:builder
```

**Valida**:

- Construcción paso a paso de servicios complejos
- Validación de campos requeridos
- Validación de reglas de negocio (fechas, disponibilidad)
- Reset del builder después de build

**Ejemplo de Test**:

```typescript
it('should validate required fields', async () => {
  await expect(builder.build()).rejects.toThrow('Error de validación');

  await expect(builder.setCliente(1).build()).rejects.toThrow(
    'Error de validación',
  );
});
```

#### Singleton Pattern

```bash
npm run test:singleton
```

**Valida**:

- Solo existe una instancia del generador
- Números consecutivos son únicos
- Thread-safety en generación concurrente
- Persistencia de consecutivos en base de datos

#### Decorator Pattern

```bash
npm run test:decorator
```

**Valida**:

- Cálculo dinámico de prioridades
- Aplicación correcta de múltiples decorators
- Prioridad base + incrementos por características
- Mancha, delicada y urgente modifican prioridad

#### State Pattern

```bash
npm run test -- servicio-state.spec
```

**Valida**:

- Transiciones de estado válidas e inválidas
- Validaciones de reglas de negocio por estado
- Permisos de modificación y eliminación según estado
- Flujos completos de ciclo de vida del servicio
- Obtención de información de estado y transiciones permitidas

**Estados Validados**:

- **Pendiente**: Permite confirmar o cancelar
- **Confirmado**: Permite entregar (con validación de fechas) o cancelar
- **Entregado**: Solo permite devolver, no se puede cancelar
- **Devuelto**: Estado terminal, no permite transiciones
- **Cancelado**: Estado terminal, permite eliminación

**Ejemplo de Test**:

```typescript
it('debe completar el flujo exitoso: pendiente → confirmado → entregado → devuelto', async () => {
  // Pendiente → Confirmado
  expect(servicio.estado).toBe('pendiente');
  await stateContext.confirmar(servicio);
  expect(servicio.estado).toBe('confirmado');

  // Confirmado → Entregado
  servicio.fechaAlquiler = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await stateContext.entregar(servicio);
  expect(servicio.estado).toBe('entregado');

  // Entregado → Devuelto
  await stateContext.devolver(servicio);
  expect(servicio.estado).toBe('devuelto');
  expect(servicio.fechaDevolucion).toBeDefined();
});
```

**Tests Implementados**: 37 tests

- 14 tests para validación de transiciones
- 10 tests para permisos (modificar/eliminar)
- 10 tests para obtener transiciones permitidas
- 3 tests para flujos completos del ciclo de vida

---

## Comandos de Testing

### Comandos Principales

```bash
# Ejecutar TODOS los tests
npm run test:all

# Ejecutar todos con cobertura
npm run test:all:cov

# Solo tests unitarios
npm run test:unit

# Tests con coverage
npm run test:cov
npm run test:unit:cov

# Watch mode (útil durante desarrollo)
npm run test:watch
npm run test:unit:watch
```

### Comandos por Patrón

```bash
# Patrones Creacionales
npm run test:creational     # Todos los creacionales
npm run test:factory        # Factory Method
npm run test:builder        # Builder
npm run test:singleton      # Singleton

# Patrones Estructurales
npm run test:structural     # Todos los estructurales
npm run test:decorator      # Decorator
npm run test:adapter        # Adapter
npm run test:composite      # Composite
npm run test:facade         # Facade

# Patrones de Comportamiento
npm run test -- servicio-state.spec  # State Pattern

# Todos los patrones
npm run test:patterns
npm run test:patterns:watch
```

---

## Cobertura de Código

### Generar Reportes de Cobertura

```bash
# Cobertura de tests unitarios
npm run test:unit:cov
# Reporte en: coverage/index.html

# Cobertura completa
npm run test:all:cov
```

### Ver Reporte de Cobertura

```bash
# Windows
start coverage/index.html

# Linux/Mac
open coverage/index.html
```

### Configuración de Cobertura

**Jest Config** (package.json):

```json
{
  "collectCoverageFrom": [
    "**/*.(t|j)s",
    "!**/*.interface.ts",
    "!**/*.dto.ts",
    "!**/*.entity.ts",
    "!**/*.module.ts"
  ]
}
```

### Objetivos de Cobertura

| Categoría             | Objetivo | Actual |
| --------------------- | -------- | ------ |
| Unit Tests - Patrones | 90%      | ✅     |
| Servicios Core        | 85%      | ✅     |
| Controllers           | 80%      | ✅     |

---

## Troubleshooting

### Problema 1: "Port 3000 already in use"

**Causa**: Servidor de desarrollo corriendo

**Solución**:

```bash
# Detener servidor de desarrollo
# Ctrl+C en la terminal del servidor

# O cambiar puerto en .env
APP_PORT=3001
```

### Problema 2: "Database connection failed"

**Causa**: XAMPP no está corriendo o base de datos no existe

**Solución**:

```bash
# 1. Iniciar XAMPP (Apache + MySQL)

# 2. Crear base de datos
mysql -u root -p
CREATE DATABASE los_atuendos;
exit;
```

### Problema 3: "Cannot find module"

**Causa**: Dependencias no instaladas

**Solución**:

```bash
npm install
```

### Problema 4: Tests fallan por datos existentes

**Causa**: Cleanup no ejecutado correctamente

**Solución**:

```bash
# Limpiar manualmente la base de datos
npm run db:reset
```

---

## Instrucciones Paso a Paso para Ejecutar Tests

### Primera Vez (Configuración Inicial)

1. **Verificar que MySQL está corriendo**
   ```bash
   # Windows (XAMPP)
   # Iniciar XAMPP Control Panel y arrancar MySQL

   # O verificar con:
   mysql -u root -p -e "SELECT 1;"
   ```

2. **Crear base de datos de test**
   ```bash
   mysql -u root -p -e "CREATE DATABASE los_atuendos_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

3. **Verificar archivo .env.test**
   ```bash
   # El archivo ya debe existir en la raíz del proyecto
   # Verificar que contenga:
   cat .env.test
   ```

4. **Instalar dependencias (si no se ha hecho)**
   ```bash
   npm install
   ```

### Ejecutar Tests (Uso Regular)

1. **Ejecutar todos los tests**
   ```bash
   npm run test:all
   ```

   Esto ejecutará:
   - 17 test suites
   - 280 tests
   - Duración: ~55 segundos

2. **Ver resultado esperado**
   ```
   Test Suites: 17 passed, 17 total
   Tests:       280 passed, 280 total
   Snapshots:   0 total
   Time:        54.844 s
   ```

3. **Generar reporte de cobertura**
   ```bash
   npm run test:all:cov

   # Abrir reporte en navegador
   start coverage/index.html  # Windows
   open coverage/index.html   # Mac/Linux
   ```

### Tests Específicos

```bash
# Por patrón individual
npm run test:factory     # Solo Factory Pattern
npm run test:builder     # Solo Builder Pattern
npm run test:singleton   # Solo Singleton Pattern

# Por categoría
npm run test:creational  # Todos los creacionales con cobertura
npm run test:structural  # Todos los estructurales con cobertura
```

### Desarrollo con Tests

```bash
# Modo watch (re-ejecuta tests al cambiar archivos)
npm run test:unit:watch

# Filtrar por nombre de archivo
npm run test -- --testNamePattern="Factory"

# Ver solo tests que fallaron
npm run test -- --onlyFailures
```

---

## Resumen de Testing

### Estadísticas Actualizadas

- **Tests Totales**: 280 tests
- **Test Suites**: 17
- **Cobertura Total**: ~85%
- **Tiempo de Ejecución**: ~55 segundos (secuencial)
- **Tasa de Éxito**: 100% ✅

### Patrones Validados

**11 patrones de diseño totalmente testeados:**

- **Creacionales (3)**:
  - Factory Method Pattern
  - Builder Pattern
  - Singleton Pattern

- **Estructurales (5)**:
  - Decorator Pattern
  - Adapter Pattern
  - Composite Pattern
  - Facade Pattern
  - Repository Pattern

- **Comportamiento (4)**:
  - State Pattern (37 tests)
  - Strategy Pattern
  - Observer Pattern
  - Command Pattern

### Configuración de Tests

**Base de Datos:**
- Motor: MySQL 8.x
- Base de datos de test: `los_atuendos_test`
- Estrategia: `dropSchema: true` (limpieza automática)

**Ejecución:**
- Modo: Secuencial (`--runInBand`)
- Timeout: 30000ms (30 segundos por test)
- Framework: Jest 30.x

**Características:**
- ✅ Validación completa de patrones de diseño
- ✅ Tests de integración con base de datos real
- ✅ Cobertura de código automatizada
- ✅ Limpieza automática entre tests
- ✅ Mocks configurados para dependencias externas
- ✅ Validación de reglas de negocio

---

## Buenas Prácticas Aplicadas

1. **Aislamiento de Tests**
   - Cada test suite crea y limpia su propio entorno
   - No hay dependencias entre tests
   - Base de datos se limpia automáticamente

2. **Naming Conventions**
   - Tests descriptivos que documentan el comportamiento
   - Uso de `should`, `debe`, `can`, etc.
   - Agrupación lógica con `describe`

3. **Ejecución Secuencial**
   - Evita conflictos de concurrencia
   - Mejor trazabilidad de errores
   - Resultados consistentes

4. **Configuración Separada**
   - `.env.test` para configuración de tests
   - Base de datos separada (`los_atuendos_test`)
   - Evita afectar datos de desarrollo

5. **Cobertura de Código**
   - Reportes HTML visuales
   - Métricas de cobertura por archivo
   - Identificación de código no testeado
