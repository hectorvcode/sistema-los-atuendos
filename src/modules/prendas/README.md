# Módulo de Gestión de Prendas

## Descripción

El módulo de gestión de prendas implementa un sistema completo para el registro, consulta y administración de prendas de alquiler utilizando patrones de diseño de software para garantizar mantenibilidad, escalabilidad y buenas prácticas.

## Patrones de Diseño Implementados

### 1. Factory Method Pattern
Ubicado en el servicio para la creación de prendas según su tipo.

**Ubicación**: `patterns/creational/factory/`

**Propósito**: Delegar la creación de instancias de prendas específicas (VestidoDama, TrajeCaballero, Disfraz) a factories especializadas.

**Uso en el módulo**:
```typescript
// El servicio usa el Factory Registry para crear prendas
const prenda = await this.prendaFactory.crearPrenda(tipo, datosBase);
```

### 2. Repository Pattern con Adapter
Ubicado en `repositories/prenda.repository.ts`

**Propósito**: Abstraer la capa de persistencia para facilitar cambios de tecnología de base de datos y mejorar la testabilidad.

**Implementación**:
- **Interface**: `IPrendaRepository` define el contrato
- **Adapter**: `PrendaRepository` adapta TypeORM a nuestra interfaz de dominio
- **Beneficios**:
  - Desacoplamiento de la lógica de negocio
  - Fácil sustitución del ORM
  - Mejor testabilidad con mocks

## Arquitectura del Módulo

```
src/modules/prendas/
├── controllers/
│   └── prendas.controller.ts      # Endpoints REST
├── services/
│   └── prendas.service.ts         # Lógica de negocio
├── repositories/
│   └── prenda.repository.ts       # Patrón Repository/Adapter
├── dto/
│   ├── create-prenda.dto.ts       # DTO base
│   ├── create-vestido-dama.dto.ts
│   ├── create-traje-caballero.dto.ts
│   ├── create-disfraz.dto.ts
│   └── query-prendas.dto.ts       # DTO para consultas
├── entities/
│   ├── prenda.entity.ts           # Entidad base
│   ├── vestido-dama.entity.ts
│   ├── traje-caballero.entity.ts
│   └── disfraz.entity.ts
├── interfaces/
│   └── prenda-repository.interface.ts
├── test/
│   ├── prendas.service.spec.ts
│   └── prendas.controller.spec.ts
└── prendas.module.ts
```

## Funcionalidades Implementadas

### 1. Registro de Prendas

**Endpoint**: `POST /prendas`

**Descripción**: Crea una nueva prenda usando el patrón Factory Method.

**Request Body**:
```json
{
  "tipo": "vestido-dama",
  "referencia": "VD-001",
  "color": "Rojo",
  "marca": "Elegance",
  "talla": "M",
  "valorAlquiler": 150.50,
  "propiedadesEspecificas": {
    "tienePedreria": true,
    "esLargo": true,
    "cantidadPiezas": 2,
    "descripcionPiezas": "Vestido + bolero"
  }
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "tipo": "vestido-dama",
  "referencia": "VD-001",
  "color": "Rojo",
  "marca": "Elegance",
  "talla": "M",
  "valorAlquiler": 150.50,
  "disponible": true,
  "estado": "disponible",
  "tienePedreria": true,
  "esLargo": true,
  "cantidadPiezas": 2,
  "descripcionPiezas": "Vestido + bolero",
  "createdAt": "2025-01-13T10:00:00.000Z",
  "updatedAt": "2025-01-13T10:00:00.000Z"
}
```

**Validaciones**:
- Tipo de prenda válido (vestido-dama, traje-caballero, disfraz)
- Referencia única (no duplicada)
- Datos específicos según el tipo de prenda

### 2. Consulta de Prendas por Talla

**Endpoint**: `GET /prendas/talla/:talla`

**Query Parameters**:
- `pagina` (opcional, default: 1): Número de página
- `limite` (opcional, default: 10): Elementos por página

**Ejemplo**: `GET /prendas/talla/M?pagina=1&limite=10`

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "tipo": "vestido-dama",
      "referencia": "VD-001",
      "color": "Rojo",
      "talla": "M",
      // ... más campos
    }
  ],
  "total": 15,
  "pagina": 1,
  "limite": 10,
  "totalPaginas": 2
}
```

### 3. Consulta de Prendas por Talla Agrupadas por Tipo

**Endpoint**: `GET /prendas/talla/:talla/agrupado`

**Descripción**: Retorna prendas de una talla específica separadas y agrupadas por tipo.

**Ejemplo**: `GET /prendas/talla/M/agrupado`

**Response** (200 OK):
```json
[
  {
    "tipo": "vestido-dama",
    "cantidad": 5,
    "prendas": [
      {
        "id": 1,
        "referencia": "VD-001",
        // ... más campos
      }
    ]
  },
  {
    "tipo": "traje-caballero",
    "cantidad": 3,
    "prendas": [
      {
        "id": 2,
        "referencia": "TC-001",
        // ... más campos
      }
    ]
  }
]
```

### 4. Consulta General con Filtros

**Endpoint**: `GET /prendas`

**Query Parameters**:
- `talla` (opcional): Filtrar por talla
- `tipo` (opcional): Filtrar por tipo
- `estado` (opcional): Filtrar por estado
- `color` (opcional): Filtrar por color
- `orden` (opcional): Ordenamiento (talla_asc, valor_desc, etc.)
- `pagina` (opcional, default: 1)
- `limite` (opcional, default: 10)

**Ejemplo**: `GET /prendas?talla=M&estado=disponible&orden=valor_asc&pagina=1&limite=10`

### 5. Buscar Prenda por Referencia

**Endpoint**: `GET /prendas/referencia/:referencia`

**Ejemplo**: `GET /prendas/referencia/VD-001`

### 6. Obtener Tipos Disponibles

**Endpoint**: `GET /prendas/tipos`

**Response**:
```json
{
  "tipos": [
    "vestido-dama",
    "traje-caballero",
    "disfraz"
  ]
}
```

### 7. Estadísticas

**Endpoint**: `GET /prendas/estadisticas`

**Response**:
```json
{
  "total": 45,
  "disponibles": 32,
  "alquiladas": 10,
  "porTipo": {
    "vestido-dama": 20,
    "traje-caballero": 15,
    "disfraz": 10
  },
  "porTalla": {
    "S": 10,
    "M": 20,
    "L": 15
  }
}
```

### 8. Actualizar Prenda

**Endpoint**: `PUT /prendas/:referencia`

**Request Body** (campos parciales):
```json
{
  "color": "Azul",
  "valorAlquiler": 175.00,
  "estado": "mantenimiento"
}
```

### 9. Eliminar Prenda

**Endpoint**: `DELETE /prendas/:referencia`

**Response**:
```json
{
  "mensaje": "Prenda con referencia VD-001 eliminada exitosamente"
}
```

## DTOs (Data Transfer Objects)

### CreatePrendaDto (Base)
```typescript
{
  tipo: string;              // vestido-dama, traje-caballero, disfraz
  referencia: string;        // Único
  color: string;
  marca: string;
  talla: string;
  valorAlquiler: number;
  estado?: EstadoPrenda;     // disponible, alquilada, lavanderia, mantenimiento
  disponible?: boolean;
  propiedadesEspecificas?: Record<string, any>;
}
```

### CreateVestidoDamaDto
Extiende `CreatePrendaDto` con:
```typescript
{
  tienePedreria: boolean;
  esLargo: boolean;
  cantidadPiezas: number;
  descripcionPiezas?: string;
}
```

### CreateTrajeCaballeroDto
Extiende `CreatePrendaDto` con:
```typescript
{
  tipoTraje: TipoTraje;      // convencional, frac, sacoleva, otro
  tieneCorbata: boolean;
  tieneCorbtain: boolean;
  tienePlastron: boolean;
  accesoriosIncluidos?: string;
}
```

### CreateDisfrazDto
Extiende `CreatePrendaDto` con:
```typescript
{
  nombre: string;
  categoria?: string;
  descripcion?: string;
  edadRecomendada?: string;
}
```

## Validaciones

Todas las validaciones se realizan mediante `class-validator`:

- Tipos de datos correctos (string, number, boolean)
- Longitudes máximas para strings
- Valores numéricos positivos
- Enums para valores predefinidos
- Campos requeridos vs opcionales

## Testing

### Ejecución de Tests

```bash
# Ejecutar todos los tests del módulo
npm test -- src/modules/prendas/test/

# Con cobertura
npm test -- src/modules/prendas/test/ --coverage

# En modo watch
npm test -- src/modules/prendas/test/ --watch
```

### Cobertura de Tests

- **PrendasService**: 24 tests
  - Creación de prendas
  - Búsquedas y filtros
  - Actualizaciones
  - Eliminaciones
  - Manejo de errores

- **PrendasController**: Tests de integración de endpoints

## Documentación Swagger

El módulo está completamente documentado con decoradores de Swagger. Para acceder:

1. Iniciar el servidor: `npm run start:dev`
2. Navegar a: `http://localhost:3000/api`

Allí encontrarás la documentación interactiva con todos los endpoints, modelos y ejemplos.

## Ejemplos de Uso

### Crear un Vestido de Dama

```bash
curl -X POST http://localhost:3000/prendas \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "vestido-dama",
    "referencia": "VD-001",
    "color": "Rojo",
    "marca": "Elegance",
    "talla": "M",
    "valorAlquiler": 150.50,
    "propiedadesEspecificas": {
      "tienePedreria": true,
      "esLargo": true,
      "cantidadPiezas": 2
    }
  }'
```

### Crear un Traje de Caballero

```bash
curl -X POST http://localhost:3000/prendas \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "traje-caballero",
    "referencia": "TC-001",
    "color": "Negro",
    "marca": "Hugo Boss",
    "talla": "L",
    "valorAlquiler": 200.00,
    "propiedadesEspecificas": {
      "tipoTraje": "frac",
      "tieneCorbata": false,
      "tieneCorbtain": true,
      "tienePlastron": false,
      "accesoriosIncluidos": "Gemelos y fajín"
    }
  }'
```

### Consultar Prendas Talla M

```bash
curl http://localhost:3000/prendas/talla/M?pagina=1&limite=10
```

### Consultar Prendas Talla M Agrupadas

```bash
curl http://localhost:3000/prendas/talla/M/agrupado
```

## Manejo de Errores

El módulo implementa manejo robusto de errores:

- **400 Bad Request**: Datos inválidos, validación fallida
- **404 Not Found**: Prenda no encontrada
- **409 Conflict**: Referencia duplicada
- **500 Internal Server Error**: Errores del servidor

Todos los errores retornan un mensaje descriptivo:

```json
{
  "statusCode": 400,
  "message": "Tipo de prenda inválido. Tipos disponibles: vestido-dama, traje-caballero, disfraz",
  "error": "Bad Request"
}
```

## Extensibilidad

Para agregar un nuevo tipo de prenda:

1. Crear la entidad en `entities/`
2. Crear el factory en `patterns/creational/factory/`
3. Registrar el factory en `PrendaFactoryRegistry`
4. Crear el DTO específico en `dto/`
5. Actualizar el repository si es necesario

## Dependencias

- **NestJS**: Framework principal
- **TypeORM**: ORM para persistencia
- **class-validator**: Validación de DTOs
- **class-transformer**: Transformación de datos
- **@nestjs/swagger**: Documentación API

## Autor

Módulo desarrollado como parte del sistema "Los Atuendos" - Sistema de alquiler de prendas.