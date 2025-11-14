# Módulo de Servicios de Alquiler

## Descripción

El módulo de servicios de alquiler implementa un sistema completo para gestionar los servicios de alquiler de prendas, utilizando patrones de diseño avanzados para garantizar robustez, escalabilidad y mantenibilidad.

## Patrones de Diseño Implementados

### 1. Builder Pattern

**Ubicación**: `patterns/creational/builder/servicio-alquiler.builder.ts`

**Propósito**: Construcción compleja de servicios de alquiler con múltiples validaciones y configuraciones.

**Características**:
- Construcción paso a paso del servicio
- Validaciones automáticas de datos
- Verificación de disponibilidad de prendas
- Cálculo automático del valor total
- Actualización de estado de prendas
- Interfaz fluida (método encadenado)

**Ejemplo de Uso**:
```typescript
const servicio = await servicioAlquilerBuilder
  .reset()
  .setCliente(clienteId)
  .setEmpleado(empleadoId)
  .setFechaAlquiler(fecha)
  .agregarPrendas([1, 2, 3])
  .setObservaciones('Notas')
  .build();
```

### 2. Singleton Pattern

**Ubicación**: `patterns/creational/singleton/generador-consecutivo.singleton.ts`

**Propósito**: Generación automática de números consecutivos únicos para servicios.

**Características**:
- Única instancia en toda la aplicación
- Manejo de concurrencia con mutex
- Transacciones de base de datos
- Lock pesimista para evitar duplicados
- Thread-safe

**Flujo**:
1. El Builder llama al Singleton durante `build()`
2. Singleton genera número consecutivo único
3. Número se asigna al servicio
4. Servicio se guarda en BD

### 3. Repository Pattern con Adapter

**Ubicación**: `repositories/servicio.repository.ts`

**Propósito**: Abstracción de la capa de persistencia.

## Arquitectura

```
src/modules/servicios/
├── controllers/
│   └── servicios.controller.ts    # 10 endpoints REST especializados
├── services/
│   └── servicios.service.ts       # Lógica de negocio + integración patrones
├── repositories/
│   └── servicio.repository.ts     # Repository/Adapter
├── dto/
│   ├── create-servicio-alquiler.dto.ts
│   ├── update-servicio-alquiler.dto.ts
│   └── query-servicios.dto.ts
├── entities/
│   └── servicio-alquiler.entity.ts
├── interfaces/
│   └── servicio-repository.interface.ts
├── test/
│   └── servicios.service.spec.ts
└── servicios.module.ts
```

## Funcionalidades Implementadas

### 1. Registro de Servicio de Alquiler

**Endpoint**: `POST /servicios`

**Características**:
- Usa **Builder Pattern** para construcción compleja
- Genera número consecutivo automático con **Singleton**
- Validaciones múltiples:
  - Cliente y empleado existen
  - Fecha no en el pasado
  - Prendas existen y están disponibles
- Cálculo automático del valor total
- Actualización de estado de prendas a "alquilada"

**Request**:
```json
{
  "clienteId": 1,
  "empleadoId": 1,
  "fechaAlquiler": "2025-02-15",
  "prendasIds": [1, 2, 3],
  "observaciones": "Cliente solicita entrega a domicilio"
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "numero": 1001,
  "fechaSolicitud": "2025-01-13T10:00:00.000Z",
  "fechaAlquiler": "2025-02-15",
  "fechaDevolucion": null,
  "estado": "pendiente",
  "valorTotal": 450.50,
  "observaciones": "Cliente solicita entrega a domicilio",
  "cliente": {
    "id": 1,
    "nombre": "Juan Pérez García",
    "numeroIdentificacion": "1234567890"
  },
  "empleado": {
    "id": 1,
    "nombre": "María González",
    "cargo": "Vendedor"
  },
  "prendas": [
    {
      "id": 1,
      "referencia": "VD-001",
      "tipo": "vestido-dama",
      "talla": "M",
      "color": "Rojo",
      "valorAlquiler": 150.50
    },
    {
      "id": 2,
      "referencia": "TC-001",
      "tipo": "traje-caballero",
      "talla": "L",
      "color": "Negro",
      "valorAlquiler": 180.00
    },
    {
      "id": 3,
      "referencia": "DF-001",
      "tipo": "disfraz",
      "talla": "M",
      "color": "Multicolor",
      "valorAlquiler": 120.00
    }
  ],
  "createdAt": "2025-01-13T10:00:00.000Z",
  "updatedAt": "2025-01-13T10:00:00.000Z"
}
```

### 2. Consulta por Número de Alquiler

**Endpoint**: `GET /servicios/numero/:numero`

Busca un servicio por su número consecutivo único.

**Ejemplo**: `GET /servicios/numero/1001`

### 3. Consulta por Fecha de Alquiler

**Endpoint**: `GET /servicios/fecha/:fecha`

Obtiene todos los servicios programados para una fecha específica.

**Query Parameters**:
- `pagina` (opcional): Número de página
- `limite` (opcional): Elementos por página

**Ejemplo**: `GET /servicios/fecha/2025-02-15?pagina=1&limite=10`

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "numero": 1001,
      "fechaAlquiler": "2025-02-15",
      "estado": "confirmado",
      "valorTotal": 450.50,
      "cliente": {...},
      "empleado": {...},
      "prendas": [...]
    }
  ],
  "total": 5,
  "pagina": 1,
  "limite": 10,
  "totalPaginas": 1
}
```

### 4. Servicios Vigentes por Cliente

**Endpoint**: `GET /servicios/cliente/:clienteId/vigentes`

Obtiene servicios en estado **confirmado** o **entregado** de un cliente.

**Ejemplo**: `GET /servicios/cliente/1/vigentes`

**Response**:
```json
[
  {
    "id": 5,
    "numero": 1005,
    "fechaAlquiler": "2025-02-20",
    "fechaDevolucion": "2025-02-25",
    "estado": "entregado",
    "valorTotal": 320.00,
    "prendas": [...]
  }
]
```

### 5. Consulta General con Filtros

**Endpoint**: `GET /servicios`

**Query Parameters**:
- `clienteId`: Filtrar por cliente
- `empleadoId`: Filtrar por empleado
- `estado`: Filtrar por estado (pendiente, confirmado, entregado, devuelto, cancelado)
- `fechaDesde`: Fecha inicio (formato ISO)
- `fechaHasta`: Fecha fin (formato ISO)
- `vigentes`: Solo servicios vigentes (true/false)
- `orden`: Ordenamiento (numero_asc, fecha_desc, valor_asc, etc.)
- `pagina`: Número de página
- `limite`: Elementos por página

**Ejemplos**:
```bash
# Por cliente
GET /servicios?clienteId=1&pagina=1&limite=10

# Por estado
GET /servicios?estado=confirmado

# Por rango de fechas
GET /servicios?fechaDesde=2025-02-01&fechaHasta=2025-02-28

# Servicios vigentes
GET /servicios?vigentes=true
```

### 6. Actualizar Servicio

**Endpoint**: `PUT /servicios/:id`

Actualiza estado, fecha de devolución u observaciones.

**Request**:
```json
{
  "estado": "confirmado",
  "fechaDevolucion": "2025-02-20",
  "observaciones": "Cliente confirmó recogida"
}
```

**Características**:
- Si estado es "devuelto", libera prendas automáticamente
- Actualiza disponibilidad de prendas

### 7. Cancelar Servicio

**Endpoint**: `PATCH /servicios/:id/cancelar`

Cancela el servicio y libera las prendas asociadas.

**Response**:
```json
{
  "id": 1,
  "numero": 1001,
  "estado": "cancelado",
  // ... demás campos
}
```

### 8. Buscar por ID

**Endpoint**: `GET /servicios/:id`

### 9. Eliminar Servicio

**Endpoint**: `DELETE /servicios/:id`

Elimina permanentemente y libera prendas.

### 10. Estadísticas

**Endpoint**: `GET /servicios/estadisticas`

**Response**:
```json
{
  "total": 150,
  "porEstado": {
    "pendiente": 20,
    "confirmado": 50,
    "entregado": 30,
    "devuelto": 45,
    "cancelado": 5
  },
  "valorTotal": 125000.00,
  "promedioPrendas": 2.5
}
```

## Estados del Servicio

- **pendiente**: Servicio creado, esperando confirmación
- **confirmado**: Cliente confirmó el alquiler
- **entregado**: Prendas entregadas al cliente
- **devuelto**: Prendas devueltas y liberadas
- **cancelado**: Servicio cancelado, prendas liberadas

## DTOs

### CreateServicioAlquilerDto
```typescript
{
  clienteId: number;        // Requerido
  empleadoId: number;       // Requerido
  fechaAlquiler: string;    // Requerido, formato ISO, no pasado
  prendasIds: number[];     // Requerido, mínimo 1 prenda
  observaciones?: string;   // Opcional
}
```

### UpdateServicioAlquilerDto
```typescript
{
  fechaDevolucion?: string;  // Opcional, formato ISO
  estado?: EstadoServicio;   // Opcional (enum)
  observaciones?: string;    // Opcional
}
```

### QueryServiciosDto
```typescript
{
  clienteId?: number;
  empleadoId?: number;
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  vigentes?: boolean;
  orden?: OrdenServicios;
  pagina?: number;           // Default: 1
  limite?: number;           // Default: 10, max: 100
}
```

## Validaciones de Negocio

1. **Creación**:
   - Cliente y empleado deben existir
   - Fecha de alquiler no puede ser en el pasado
   - Todas las prendas deben existir
   - Todas las prendas deben estar disponibles

2. **Disponibilidad de Prendas**:
   - Estado debe ser "disponible"
   - Flag `disponible` debe ser true
   - Al crear servicio, prendas se marcan como "alquilada"
   - Al devolver/cancelar, prendas se liberan

3. **Consecutivos**:
   - Generados automáticamente por Singleton
   - Únicos y secuenciales
   - Thread-safe con locks

## Flujo de Creación de Servicio

```
1. Usuario envía POST /servicios con datos
   ↓
2. Controller recibe y valida DTO
   ↓
3. Service valida fecha y disponibilidad de prendas
   ↓
4. Service usa Builder para construir servicio
   ↓
5. Builder valida todos los datos
   ↓
6. Builder llama a Singleton para generar consecutivo
   ↓
7. Singleton genera número único (thread-safe)
   ↓
8. Builder carga entidades completas desde BD
   ↓
9. Builder calcula valor total
   ↓
10. Builder guarda servicio en BD
    ↓
11. Builder actualiza estado de prendas a "alquilada"
    ↓
12. Servicio completo se retorna al usuario
```

## Integración con Otros Módulos

- **ClientesModule**: Valida existencia de clientes
- **EmpleadosModule**: Valida existencia de empleados
- **PrendasModule**: Valida y actualiza estado de prendas
- **CreationalPatternsModule**: Proporciona Builder y Singleton

## Testing

```bash
# Ejecutar tests del módulo
npm test -- src/modules/servicios/test/

# Con cobertura
npm test -- src/modules/servicios/test/ --coverage
```

**Tests implementados**:
- Creación de servicios con Builder
- Validación de fecha en el pasado
- Validación de disponibilidad de prendas
- Búsqueda por número
- Cancelación y liberación de prendas

## Ejemplos de Uso

### Crear Servicio de Alquiler
```bash
curl -X POST http://localhost:3000/servicios \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": 1,
    "empleadoId": 1,
    "fechaAlquiler": "2025-02-15",
    "prendasIds": [1, 2, 3],
    "observaciones": "Entrega a domicilio"
  }'
```

### Buscar por Número
```bash
curl http://localhost:3000/servicios/numero/1001
```

### Buscar por Fecha
```bash
curl http://localhost:3000/servicios/fecha/2025-02-15
```

### Servicios Vigentes de un Cliente
```bash
curl http://localhost:3000/servicios/cliente/1/vigentes
```

### Actualizar Estado
```bash
curl -X PUT http://localhost:3000/servicios/1 \
  -H "Content-Type: application/json" \
  -d '{"estado": "confirmado", "fechaDevolucion": "2025-02-20"}'
```

### Cancelar Servicio
```bash
curl -X PATCH http://localhost:3000/servicios/1/cancelar
```

## Manejo de Errores

- **400 Bad Request**: Validación fallida, prendas no disponibles, fecha inválida
- **404 Not Found**: Servicio no encontrado
- **409 Conflict**: Número consecutivo duplicado (muy raro, manejado por Singleton)

## Ventajas de los Patrones Implementados

### Builder Pattern
- ✅ Construcción compleja simplificada
- ✅ Validaciones centralizadas
- ✅ Código más legible
- ✅ Fácil extensión
- ✅ Reusabilidad

### Singleton Pattern
- ✅ Consecutivos únicos garantizados
- ✅ Thread-safe
- ✅ Manejo de concurrencia
- ✅ Transacciones BD
- ✅ Una sola instancia

### Repository Pattern
- ✅ Abstracción de persistencia
- ✅ Testabilidad
- ✅ Desacoplamiento
- ✅ Facilita cambio de BD

## Documentación Swagger

Accede a la documentación interactiva: `http://localhost:3000/api`

## Dependencias

- NestJS
- TypeORM
- class-validator
- class-transformer
- @nestjs/swagger