# Módulo de Gestión de Empleados

## Descripción

El módulo de gestión de empleados implementa un sistema CRUD completo para administrar empleados del sistema de alquiler de prendas, incluyendo consultas de servicios gestionados por cada empleado.

## Arquitectura

```
src/modules/empleados/
├── controllers/
│   └── empleados.controller.ts    # Endpoints REST
├── services/
│   └── empleados.service.ts       # Lógica de negocio
├── repositories/
│   └── empleado.repository.ts     # Patrón Repository/Adapter
├── dto/
│   ├── create-empleado.dto.ts     # DTO para crear empleado
│   ├── update-empleado.dto.ts     # DTO para actualizar empleado
│   └── query-empleados.dto.ts     # DTO para consultas
├── entities/
│   └── empleado.entity.ts         # Entidad Empleado
├── interfaces/
│   └── empleado-repository.interface.ts
└── empleados.module.ts
```

## Patrón Repository con Adapter

Similar al módulo de clientes, implementa el patrón Repository para abstraer la persistencia.

## Funcionalidades Implementadas

### 1. Registro de Empleados (POST /empleados)

**Request**:
```json
{
  "nombre": "María González López",
  "numeroIdentificacion": "9876543210",
  "direccion": "Carrera 45 #12-34, Medellín",
  "telefono": "3109876543",
  "cargo": "Vendedor",
  "correoElectronico": "maria.gonzalez@losatuendos.com",
  "activo": true,
  "fechaIngreso": "2023-01-15",
  "salario": 2500000
}
```

**Validaciones**:
- Número de identificación único
- Correo electrónico único
- Cargo requerido
- Fecha de ingreso requerida
- Salario opcional (numérico positivo)

### 2. Consulta de Empleados (GET /empleados)

**Query Parameters**:
- `nombre`: Búsqueda parcial
- `numeroIdentificacion`: Búsqueda exacta
- `cargo`: Filtro por cargo (búsqueda parcial)
- `activo`: true/false
- `orden`: nombre_asc, cargo_asc, fecha_ingreso_desc, etc.
- `pagina`: Número de página
- `limite`: Elementos por página

**Ejemplo**:
```
GET /empleados?cargo=Vendedor&activo=true&orden=nombre_asc
```

### 3. Consulta de Servicios por Empleado (GET /empleados/:id/servicios)

Obtiene todos los servicios que un empleado ha gestionado con información de clientes y cantidad de prendas.

**Response**:
```json
{
  "empleado": {
    "id": 1,
    "nombre": "María González López",
    "numeroIdentificacion": "9876543210",
    "cargo": "Vendedor"
  },
  "servicios": [
    {
      "id": 5,
      "numero": 1001,
      "fechaAlquiler": "2025-02-01",
      "fechaDevolucion": "2025-02-05",
      "estado": "confirmado",
      "valorTotal": 450.00,
      "cliente": {
        "id": 3,
        "nombre": "Juan Pérez García"
      },
      "cantidadPrendas": 3
    },
    {
      "id": 8,
      "numero": 1004,
      "fechaAlquiler": "2025-02-10",
      "fechaDevolucion": "2025-02-15",
      "estado": "entregado",
      "valorTotal": 320.00,
      "cliente": {
        "id": 5,
        "nombre": "Ana Martínez"
      },
      "cantidadPrendas": 2
    }
  ],
  "totalServicios": 15,
  "valorTotalServicios": 6750.00
}
```

**Características**:
- Ordenado por fecha de alquiler (más reciente primero)
- Incluye información del cliente
- Cuenta cantidad de prendas por servicio
- Calcula estadísticas totales

### 4. Buscar Empleado por ID (GET /empleados/:id)

### 5. Buscar Empleado por Identificación (GET /empleados/identificacion/:numeroIdentificacion)

### 6. Actualizar Empleado (PUT /empleados/:id)

**Request** (campos parciales):
```json
{
  "cargo": "Supervisor",
  "salario": 3000000,
  "telefono": "3112345678"
}
```

### 7. Desactivar Empleado (PATCH /empleados/:id/desactivar)

Marca un empleado como inactivo (soft delete).

### 8. Eliminar Empleado (DELETE /empleados/:id)

Elimina permanentemente un empleado.

### 9. Estadísticas (GET /empleados/estadisticas)

**Response**:
```json
{
  "total": 25,
  "activos": 23,
  "inactivos": 2,
  "porCargo": {
    "Vendedor": 15,
    "Supervisor": 5,
    "Gerente": 3,
    "Auxiliar": 2
  }
}
```

## DTOs

### CreateEmpleadoDto
```typescript
{
  nombre: string;                // Requerido, max 100 caracteres
  numeroIdentificacion: string;  // Requerido, único, 5-20 caracteres
  direccion: string;             // Requerido, max 200 caracteres
  telefono: string;              // Requerido, max 20 caracteres
  cargo: string;                 // Requerido, max 50 caracteres
  correoElectronico: string;     // Requerido, único, formato email
  activo?: boolean;              // Opcional, default true
  fechaIngreso: Date;            // Requerido, formato ISO
  salario?: number;              // Opcional, numérico positivo
}
```

### UpdateEmpleadoDto
Todos los campos de `CreateEmpleadoDto` pero opcionales (PartialType).

### QueryEmpleadosDto
```typescript
{
  nombre?: string;               // Búsqueda parcial
  numeroIdentificacion?: string; // Búsqueda exacta
  cargo?: string;                // Búsqueda parcial
  activo?: boolean;              // Filtro
  orden?: OrdenEmpleados;        // nombre_asc, cargo_asc, etc.
  pagina?: number;               // Default: 1
  limite?: number;               // Default: 10, max: 100
}
```

## Validaciones de Negocio

1. **Unicidad**:
   - Número de identificación único
   - Correo electrónico único

2. **Campos Requeridos**:
   - Nombre, identificación, dirección, teléfono
   - Cargo y fecha de ingreso

3. **Campos Opcionales**:
   - Salario (si no se especifica, puede ser null)
   - Estado activo (default: true)

## Relaciones

- **OneToMany con ServicioAlquiler**: Un empleado puede gestionar múltiples servicios de alquiler

## Manejo de Errores

- **400 Bad Request**: Datos inválidos
- **404 Not Found**: Empleado no encontrado
- **409 Conflict**: Identificación o email duplicados

## Ejemplos de Uso

### Crear Empleado
```bash
curl -X POST http://localhost:3000/empleados \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María González López",
    "numeroIdentificacion": "9876543210",
    "direccion": "Carrera 45 #12-34",
    "telefono": "3109876543",
    "cargo": "Vendedor",
    "correoElectronico": "maria.gonzalez@losatuendos.com",
    "fechaIngreso": "2023-01-15",
    "salario": 2500000
  }'
```

### Consultar Empleados por Cargo
```bash
curl "http://localhost:3000/empleados?cargo=Vendedor&activo=true"
```

### Obtener Servicios del Empleado
```bash
curl http://localhost:3000/empleados/1/servicios
```

### Actualizar Empleado
```bash
curl -X PUT http://localhost:3000/empleados/1 \
  -H "Content-Type: application/json" \
  -d '{"cargo": "Supervisor", "salario": 3000000}'
```

### Obtener Estadísticas
```bash
curl http://localhost:3000/empleados/estadisticas
```

## Documentación Swagger

Accede a la documentación interactiva en: `http://localhost:3000/api`

## Dependencias

- NestJS
- TypeORM
- class-validator
- class-transformer
- @nestjs/swagger