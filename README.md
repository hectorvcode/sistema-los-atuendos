# Los Atuendos - Sistema de Alquiler de Vestuario

API RESTful desarrollada con NestJS para la gestión de alquiler de vestuario (vestidos, trajes y disfraces), implementando patrones de diseño de software.

## Características Principales

- **Patrones de Diseño Implementados:**
  - **Creacionales**: Factory Method, Builder, Singleton
  - **Estructurales**: Decorator, Repository, Adapter, Composite, Facade
  - **Comportamiento**: State (gestión de ciclo de vida), Strategy (cálculo de precios), Observer (notificaciones de eventos), Command (operaciones con undo/redo)

- **Módulos:**
  - Gestión de Prendas (vestidos, trajes, disfraces)
  - Gestión de Clientes
  - Gestión de Empleados
  - Servicios de Alquiler
  - Sistema de Lavandería

## Requisitos Previos

- Node.js (v18 o superior)
- MySQL (v8 o superior)
- npm o yarn
- Postman (para pruebas de API)

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd los-atuendos
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Base de Datos

#### Opción A: Desde MySQL Workbench o phpMyAdmin

1. Abrir MySQL Workbench o phpMyAdmin (XAMPP)
2. Crear nueva base de datos:

```sql
CREATE DATABASE los_atuendos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Opción B: Desde Línea de Comandos

```bash
mysql -u root -p -e "CREATE DATABASE los_atuendos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 4. Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=los_atuendos

# Application Configuration
APP_PORT=3000
NODE_ENV=development

# Logging Level
LOG_LEVEL=debug
```

### 5. Iniciar la Aplicación

```bash
npm run start:dev
```

La aplicación iniciará en `http://localhost:3000`

TypeORM creará automáticamente todas las tablas necesarias.

### 6. Cargar Datos de Prueba

```bash
npm run seed:complete
```

Esto carga:

- 5 Empleados
- 8 Clientes
- 20 Prendas (8 vestidos, 6 trajes, 6 disfraces)

## Documentación de la API

Una vez iniciada la aplicación, acceder a:

**Swagger UI:** `http://localhost:3000/api/docs`

## Pruebas con Postman

Para ejecutar las pruebas, ver instrucciones detalladas en: [postman/README.md](postman/README.md)

## Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Iniciar en modo desarrollo con hot-reload

# Producción
npm run build              # Compilar para producción
npm run start:prod         # Iniciar en modo producción

# Base de Datos
npm run seed:complete      # Cargar datos de prueba completos
npm run db:reset           # Limpiar BD y recargar datos

# Testing
npm run test:all           # Ejecutar TODOS los tests (recomendado)
npm run test:all:cov       # Ejecutar todos los tests con cobertura
npm run test:unit          # Ejecutar solo tests unitarios
npm run test:unit:cov      # Tests unitarios con cobertura
npm run test:patterns      # Tests de patrones de diseño con cobertura

# Linting
npm run lint               # Ejecutar ESLint
npm run format             # Formatear código con Prettier
```

## Testing

El proyecto cuenta con una suite completa de tests unitarios que validan la correcta implementación de todos los patrones de diseño.

### Requisitos Previos para Tests

1. **MySQL debe estar corriendo** (XAMPP o MySQL Server)
2. **Base de datos de test configurada**:
   ```bash
   # Crear base de datos de test (solo primera vez)
   mysql -u root -p -e "CREATE DATABASE los_atuendos_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

### Ejecutar Tests

```bash
# 1. Ejecutar TODOS los tests (recomendado)
npm run test:all

# 2. Ver reporte de cobertura
npm run test:all:cov
# El reporte se genera en: coverage/index.html

# 3. Tests en modo watch (desarrollo)
npm run test:unit:watch
```

### Tests por Categoría

```bash
# Patrones Creacionales
npm run test:factory        # Factory Method Pattern
npm run test:builder        # Builder Pattern
npm run test:singleton      # Singleton Pattern

# Patrones Estructurales
npm run test:decorator      # Decorator Pattern
npm run test:adapter        # Adapter Pattern
npm run test:composite      # Composite Pattern
npm run test:facade         # Facade Pattern

# Patrones de Comportamiento
npm run test -- state       # State Pattern
npm run test -- strategy    # Strategy Pattern
npm run test -- observer    # Observer Pattern
npm run test -- command     # Command Pattern
```

### Estadísticas de Tests

- **Total**: 280 tests
- **Test Suites**: 17
- **Cobertura**: ~85%
- **Tiempo de ejecución**: ~55 segundos

**Para más información detallada sobre testing**, consultar: [docs/TESTING.md](docs/TESTING.md)

## Estructura del Proyecto

```
los-atuendos/
├── src/
│   ├── common/              # Utilidades compartidas, filters, interceptors
│   ├── database/            # Configuración DB, seeds, migrations
│   ├── modules/             # Módulos de la aplicación
│   │   ├── clientes/
│   │   ├── empleados/
│   │   ├── lavanderia/
│   │   ├── prendas/
│   │   └── servicios/
│   ├── patterns/            # Implementación de patrones de diseño
│   │   ├── creational/      # Factory, Builder, Singleton
│   │   ├── structural/      # Decorator, Repository, Adapter, Composite, Facade
│   │   └── behavioral/      # State, Strategy, Observer, Command
│   ├── app.module.ts
│   └── main.ts
├── postman/                 # Colección de Postman y documentación
└── docs/                    # Documentación adicional
```

## Patrones de Diseño

### Factory Method

Ubicación: `src/patterns/creational/factory/`

Crea diferentes tipos de prendas (vestidos, trajes, disfraces) mediante factories específicas.

### Builder

Ubicación: `src/patterns/creational/builder/`

Construye servicios de alquiler complejos paso a paso.

### Singleton

Ubicación: `src/patterns/creational/singleton/`

Generador único de números consecutivos para servicios.

### Decorator

Ubicación: `src/patterns/structural/decorator/`

Calcula dinámicamente la prioridad de items de lavandería.

### Repository

Ubicación: `src/patterns/structural/repository/`

Abstrae la lógica de acceso a datos.

### State Pattern

Ubicación: `src/patterns/behavioral/state/`

Gestiona el ciclo de vida de los servicios de alquiler mediante estados bien definidos (Pendiente, Confirmado, Entregado, Devuelto, Cancelado), validando automáticamente las transiciones permitidas.

### Strategy Pattern

Ubicación: `src/patterns/behavioral/strategy/`

Calcula el precio de alquiler mediante estrategias intercambiables que se seleccionan automáticamente según el contexto:
- **Regular**: Precio base sin descuentos
- **VIP**: 15% descuento para clientes VIP
- **Seasonal**: Descuentos por temporada (Alta 0%, Media 5%, Baja 10%)
- **Bulk**: Descuentos por cantidad (3-5 prendas 5%, 6-10 prendas 10%, 11+ prendas 15%)
- **Promotional**: Promociones especiales (San Valentín 20%, Día de la Madre 15%, Black Friday 25%, Navidad 20%)

### Observer Pattern

Ubicación: `src/patterns/behavioral/observer/`

Sistema de notificaciones desacoplado que permite a múltiples observadores reaccionar automáticamente a eventos del sistema:

**Eventos Soportados:**
- SERVICIO_CREADO, SERVICIO_CONFIRMADO, SERVICIO_ENTREGADO
- SERVICIO_DEVUELTO, SERVICIO_CANCELADO, DEVOLUCION_TARDIA, SERVICIO_MODIFICADO

**Observadores Implementados:**
- **EmailNotificationObserver**: Envía correos electrónicos para eventos importantes
- **SmsNotificationObserver**: Envía SMS solo para eventos críticos (confirmación, entrega, devolución tardía)
- **AuditLogObserver**: Registra todos los eventos en logs de auditoría
- **DashboardObserver**: Actualiza estadísticas en tiempo real
- **ReportGeneratorObserver**: Genera reportes automáticos al completar o cancelar servicios

**Integración:** Se integra automáticamente con el State Pattern, notificando eventos en cada transición de estado.

### Command Pattern

**Ubicación**: `src/patterns/behavioral/command/`

Encapsula operaciones de cambio de estado como objetos independientes, permitiendo **deshacer (undo)** y **rehacer (redo)** operaciones, mantener historial completo de comandos ejecutados y proporcionar trazabilidad para auditoría.

**Comandos Implementados:**
- **ConfirmarServicioCommand**: Transiciona servicio de pendiente → confirmado
- **EntregarServicioCommand**: Transiciona servicio de confirmado → entregado
- **DevolverServicioCommand**: Transiciona servicio de entregado → devuelto (registra fecha de devolución)
- **CancelarServicioCommand**: Cancela servicio y libera prendas asociadas

**Componentes:**
- **CommandInvoker**: Ejecuta comandos y gestiona el historial (máximo 50 comandos)
- **CommandHistory**: Mantiene historial con stack de undo/redo y metadata de ejecución
- **CommandFactory**: Crea comandos con dependencias inyectadas

**Funcionalidades:**
```typescript
// Ejecutar comando
await serviciosService.confirmarServicio(id);

// Deshacer última operación
await serviciosService.deshacerUltimaOperacion();

// Rehacer operación deshecha
await serviciosService.rehacerOperacion();

// Obtener historial de comandos
const historial = serviciosService.obtenerHistorialComandos();
```

**Integración:** Utiliza State Pattern para validar transiciones de estado y Observer Pattern para notificar eventos automáticamente.

## Solución de Problemas

### Error: "Cannot connect to database"

**Solución:**

1. Verificar que MySQL esté corriendo (XAMPP/MySQL Workbench)
2. Verificar credenciales en `.env`
3. Verificar que la base de datos `los_atuendos` existe

### Error: "Port 3000 already in use"

**Solución:**

```bash
# Windows
taskkill /F /IM node.exe

# Linux/Mac
killall node
```

O cambiar el puerto en `.env`:

```env
APP_PORT=3001
```

### Error al cargar seeds

**Solución:**

```bash
npm run db:reset
```

## 📖 Documentación Adicional

- [Arquitectura del Sistema](docs/ARQUITECTURA.md) - Diseño, patrones y decisiones arquitectónicas
- [Guía de Pruebas con Postman](postman/README.md) - Instrucciones paso a paso para pruebas de API
- [Documentación de Testing](docs/TESTING.md) - Tests unitarios y patrones de diseño
- [Documentación de API REST](docs/API-REST.md) - Endpoints y ejemplos

## Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia

Este proyecto es parte de un trabajo académico para la materia de Patrones de Diseño de Software.

---

## Tecnologías Utilizadas

- **Framework:** NestJS 11.0.1
- **ORM:** TypeORM 0.3.27
- **Base de Datos:** MySQL 8.x
- **Lenguaje:** TypeScript 5.7.3
- **Documentación API:** Swagger/OpenAPI 3.0
- **Testing:** Jest 30.x + Supertest 7.x
- **Validación:** class-validator + class-transformer
