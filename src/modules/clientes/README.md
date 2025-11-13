# Módulo de Gestión de Clientes

## Descripción

El módulo de gestión de clientes implementa un sistema CRUD completo para administrar clientes del sistema de alquiler de prendas, incluyendo consultas avanzadas de servicios por cliente con información detallada de las prendas alquiladas.

## Arquitectura

```
src/modules/clientes/
├── controllers/
│   └── clientes.controller.ts     # Endpoints REST
├── services/
│   └── clientes.service.ts        # Lógica de negocio
├── repositories/
│   └── cliente.repository.ts      # Patrón Repository/Adapter
├── dto/
│   ├── create-cliente.dto.ts      # DTO para crear cliente
│   ├── update-cliente.dto.ts      # DTO para actualizar cliente
│   └── query-clientes.dto.ts      # DTO para consultas
├── entities/
│   └── cliente.entity.ts          # Entidad Cliente
├── interfaces/
│   └── cliente-repository.interface.ts
├── test/
│   └── clientes.service.spec.ts   # Tests unitarios
└── clientes.module.ts
```

## Patrón Repository con Adapter

El módulo implementa el patrón Repository para abstraer la capa de persistencia:

- **Interface**: `IClienteRepository` define el contrato
- **Adapter**: `ClienteRepository` adapta TypeORM a nuestra interfaz
- **Beneficios**:
  - Desacoplamiento de la lógica de negocio
  - Fácil testabilidad con mocks
  - Facilita cambio de tecnología de BD

## Funcionalidades Implementadas

### 1. Registro de Clientes (POST /clientes)

Crea un nuevo cliente con validación de datos únicos.

**Request**:
```json
{
  "numeroIdentificacion": "1234567890",
  "nombre": "Juan Pérez García",
  "direccion": "Calle 123 #45-67, Bogotá",
  "telefono": "3001234567",
  "correoElectronico": "juan.perez@email.com",
  "activo": true,
  "fechaNacimiento": "1990-05-15"
}
```

**Validaciones**:
- Número de identificación único
- Correo electrónico único
- Formato de email válido
- Campos requeridos vs opcionales

### 2. Consulta de Clientes (GET /clientes)

Lista clientes con filtros opcionales y paginación.

**Query Parameters**:
- `nombre`: Búsqueda parcial por nombre
- `numeroIdentificacion`: Búsqueda exacta
- `activo`: true/false para filtrar estado
- `orden`: nombre_asc, nombre_desc, fecha_asc, fecha_desc
- `pagina`: Número de página (default: 1)
- `limite`: Elementos por página (default: 10, max: 100)

**Ejemplo**:
```
GET /clientes?nombre=Juan&activo=true&pagina=1&limite=10
```

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "numeroIdentificacion": "1234567890",
      "nombre": "Juan Pérez García",
      "direccion": "Calle 123 #45-67",
      "telefono": "3001234567",
      "correoElectronico": "juan.perez@email.com",
      "activo": true,
      "fechaNacimiento": "1990-05-15",
      "createdAt": "2025-01-13T10:00:00.000Z",
      "updatedAt": "2025-01-13T10:00:00.000Z"
    }
  ],
  "total": 1,
  "pagina": 1,
  "limite": 10,
  "totalPaginas": 1
}
```

### 3. Buscar Cliente por ID (GET /clientes/:id)

Retorna un cliente específico por su ID.

**Ejemplo**: `GET /clientes/1`

### 4. Buscar Cliente por Identificación (GET /clientes/identificacion/:numeroIdentificacion)

Búsqueda rápida por número de identificación.

**Ejemplo**: `GET /clientes/identificacion/1234567890`

### 5. Consulta de Servicios por Cliente (GET /clientes/:id/servicios)

**Funcionalidad Principal**: Obtiene todos los servicios de alquiler de un cliente con información detallada de las prendas.

**Query Parameters**:
- `vigentes`: boolean (opcional) - Si es true, solo retorna servicios vigentes (confirmados o entregados)

**Ejemplos**:
```bash
# Todos los servicios del cliente
GET /clientes/1/servicios

# Solo servicios vigentes
GET /clientes/1/servicios?vigentes=true
```

**Response**:
```json
{
  "cliente": {
    "id": 1,
    "nombre": "Juan Pérez García",
    "numeroIdentificacion": "1234567890",
    "correoElectronico": "juan.perez@email.com"
  },
  "servicios": [
    {
      "id": 5,
      "numero": 1001,
      "fechaAlquiler": "2025-02-01",
      "fechaDevolucion": "2025-02-05",
      "estado": "confirmado",
      "valorTotal": 450.00,
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
          "id": 4,
          "referencia": "TC-001",
          "tipo": "traje-caballero",
          "talla": "L",
          "color": "Negro",
          "valorAlquiler": 180.00
        }
      ],
      "empleado": {
        "id": 2,
        "nombre": "María González"
      }
    }
  ],
  "totalServicios": 5,
  "serviciosVigentes": 2,
  "valorTotalServicios": 2250.00
}
```

**Características**:
- Filtra por servicios vigentes (confirmado/entregado)
- Ordena por fecha de alquiler (más reciente primero)
- Incluye información detallada de cada prenda
- Calcula totales y estadísticas

### 6. Actualizar Cliente (PUT /clientes/:id)

Actualiza los datos de un cliente existente.

**Request** (campos parciales):
```json
{
  "telefono": "3109876543",
  "direccion": "Nueva dirección 456",
  "activo": true
}
```

**Validaciones**:
- Verifica que identificación y email sean únicos si se modifican
- No permite duplicados

### 7. Desactivar Cliente (PATCH /clientes/:id/desactivar)

Marca un cliente como inactivo (soft delete).

**Response**:
```json
{
  "id": 1,
  "activo": false,
  // ... demás campos
}
```

### 8. Eliminar Cliente (DELETE /clientes/:id)

Elimina permanentemente un cliente del sistema.

**Response**:
```json
{
  "mensaje": "Cliente con ID 1 eliminado exitosamente"
}
```

### 9. Estadísticas (GET /clientes/estadisticas)

Obtiene estadísticas generales de clientes.

**Response**:
```json
{
  "total": 150,
  "activos": 140,
  "inactivos": 10
}
```

## DTOs

### CreateClienteDto
```typescript
{
  numeroIdentificacion: string;  // Requerido, único, 5-20 caracteres
  nombre: string;                // Requerido, max 100 caracteres
  direccion: string;             // Requerido, max 200 caracteres
  telefono: string;              // Requerido, max 20 caracteres
  correoElectronico: string;     // Requerido, único, formato email
  activo?: boolean;              // Opcional, default true
  fechaNacimiento?: Date;        // Opcional, formato ISO
}
```

### UpdateClienteDto
Todos los campos de `CreateClienteDto` pero opcionales (PartialType).

### QueryClientesDto
```typescript
{
  nombre?: string;               // Búsqueda parcial
  numeroIdentificacion?: string; // Búsqueda exacta
  activo?: boolean;              // Filtro
  orden?: OrdenClientes;         // nombre_asc, nombre_desc, etc.
  pagina?: number;               // Default: 1
  limite?: number;               // Default: 10, max: 100
}
```

## Validaciones de Negocio

1. **Unicidad**:
   - Número de identificación debe ser único
   - Correo electrónico debe ser único

2. **Formato**:
   - Email válido (validación con `@IsEmail()`)
   - Identificación: 5-20 caracteres
   - Nombres y direcciones: límites de longitud

3. **Estados**:
   - Activo/Inactivo para soft delete

## Manejo de Errores

- **400 Bad Request**: Datos inválidos, validación fallida
- **404 Not Found**: Cliente no encontrado
- **409 Conflict**: Identificación o email duplicados

## Relaciones

- **OneToMany con ServicioAlquiler**: Un cliente puede tener múltiples servicios de alquiler

## Testing

```bash
# Ejecutar tests del módulo
npm test -- src/modules/clientes/test/

# Con cobertura
npm test -- src/modules/clientes/test/ --coverage
```

**Cobertura actual**: 8 tests passing
- Creación de clientes
- Búsquedas por ID
- Validaciones de unicidad
- Eliminación de clientes

## Ejemplos de Uso

### Crear Cliente
```bash
curl -X POST http://localhost:3000/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "numeroIdentificacion": "1234567890",
    "nombre": "Juan Pérez García",
    "direccion": "Calle 123 #45-67",
    "telefono": "3001234567",
    "correoElectronico": "juan.perez@email.com",
    "fechaNacimiento": "1990-05-15"
  }'
```

### Consultar Clientes Activos
```bash
curl "http://localhost:3000/clientes?activo=true&pagina=1&limite=10"
```

### Obtener Servicios del Cliente
```bash
# Todos los servicios
curl http://localhost:3000/clientes/1/servicios

# Solo servicios vigentes
curl http://localhost:3000/clientes/1/servicios?vigentes=true
```

### Actualizar Cliente
```bash
curl -X PUT http://localhost:3000/clientes/1 \
  -H "Content-Type: application/json" \
  -d '{"telefono": "3109876543"}'
```

### Desactivar Cliente
```bash
curl -X PATCH http://localhost:3000/clientes/1/desactivar
```

## Documentación Swagger

Accede a la documentación interactiva en: `http://localhost:3000/api`

## Dependencias

- NestJS
- TypeORM
- class-validator
- class-transformer
- @nestjs/swagger