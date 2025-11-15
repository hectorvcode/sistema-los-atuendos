# Los Atuendos - Sistema de Alquiler de Vestuario

API RESTful desarrollada con NestJS para la gestión de alquiler de vestuario (vestidos, trajes y disfraces), implementando patrones de diseño de software.

## Características Principales

- **Patrones de Diseño Implementados:**
  - Factory Method (creación de prendas)
  - Builder (servicios de alquiler)
  - Singleton (generación de consecutivos)
  - Decorator (cálculo dinámico de prioridades)
  - Repository (persistencia de datos)

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
npm run test               # Ejecutar tests unitarios
npm run test:cov           # Generar reporte de cobertura

# Linting
npm run lint               # Ejecutar ESLint
npm run format             # Formatear código con Prettier
```

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
│   │   └── structural/      # Decorator, Repository
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

- **Framework:** NestJS 10.x
- **ORM:** TypeORM 0.3.x
- **Base de Datos:** MySQL 8.x
- **Lenguaje:** TypeScript 5.x
- **Documentación API:** Swagger/OpenAPI 3.0
- **Testing:** Jest + Supertest
- **Validación:** class-validator + class-transformer
