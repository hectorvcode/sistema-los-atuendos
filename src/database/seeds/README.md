# Seeds - Datos de Prueba

## 📋 Descripción

Este directorio contiene scripts TypeScript para cargar datos de prueba en la base de datos. Los seeds utilizan TypeORM y respetan todos los patrones de diseño implementados en el proyecto.

## 📁 Archivos

```
seeds/
├── initial-data.seed.ts         # Seed básico original (6 prendas, 3 clientes, 2 empleados)
├── complete-data.seed.ts        # Seed completo con datos realistas (40+ registros)
├── run-seeds.ts                 # Script para ejecutar seed básico
├── run-complete-seed.ts         # Script para ejecutar seed completo
├── run-demo.ts                  # Script para demostración
└── README.md                    # Este archivo
```

---

## 🚀 Uso Rápido

### Cargar Seed Completo (Recomendado)

```bash
npm run seed:complete
```

Este comando carga:
- 5 Empleados con diferentes cargos
- 8 Clientes con información completa
- 8 Vestidos de dama variados
- 6 Trajes de caballero
- 6 Disfraces temáticos
- 5 Servicios de alquiler (activos y reservados)
- 6 Items de lavandería con prioridades variadas
- Consecutivos inicializados

### Cargar Seed Básico

```bash
npm run seed:run
```

Este comando carga:
- 2 Empleados básicos
- 3 Clientes básicos
- 6 Prendas básicas (2 vestidos, 2 trajes, 2 disfraces)

### Reset Completo

```bash
npm run db:reset
```

Equivale a limpiar y cargar seed completo.

---

## 📊 Seed Completo - Detalle

### 1. Empleados (5)

| Nombre | Cargo | Email |
|--------|-------|-------|
| María Fernanda García López | Gerente General | maria.garcia@losatuendos.com |
| Carlos Andrés Rodríguez Mesa | Asesor de Ventas Senior | carlos.rodriguez@losatuendos.com |
| Laura Valentina Martínez Pérez | Asesora de Ventas | laura.martinez@losatuendos.com |
| Juan Pablo Hernández Silva | Coordinador de Lavandería | juan.hernandez@losatuendos.com |
| Camila Andrea López Torres | Operaria de Lavandería | camila.lopez@losatuendos.com |

### 2. Clientes (8)

| Nombre | Email | Teléfono |
|--------|-------|----------|
| Ana Sofía Martínez Ruiz | ana.martinez@email.com | 3101234567 |
| Luis Fernando Gómez Castro | luis.gomez@email.com | 3207654321 |
| Isabella Cruz Vargas | isabella.cruz@email.com | 3109876543 |
| Sebastián Ramírez Ortiz | sebastian.ramirez@email.com | 3156789012 |
| Valentina Torres Mendoza | valentina.torres@email.com | 3201234567 |
| Diego Alejandro Moreno Sánchez | diego.moreno@email.com | 3307654321 |
| Mariana Jiménez Rojas | mariana.jimenez@email.com | 3409876543 |
| Andrés Felipe Díaz Herrera | andres.diaz@email.com | 3156789012 |

### 3. Vestidos de Dama (8)

| Referencia | Color | Marca | Talla | Precio | Estado | Características |
|------------|-------|-------|-------|--------|--------|-----------------|
| VD001 | Rojo Pasión | Elegancia Suprema | M | $180,000 | Disponible | Con pedrería, largo, 2 piezas |
| VD002 | Azul Marino Elegante | Sofisticada Boutique | S | $150,000 | Disponible | Largo, corte sirena |
| VD003 | Negro Terciopelo | Elegancia Suprema | L | $200,000 | Disponible | Con pedrería, 3 piezas (+ capa + guantes) |
| VD004 | Dorado Brillante | Divas Collection | M | $220,000 | **Alquilado** | Con pedrería, + tocado |
| VD005 | Verde Esmeralda | Elegancia Suprema | S | $170,000 | Disponible | Corto cocktail |
| VD006 | Blanco Perla | Novias Elegantes | M | $300,000 | Disponible | Vestido de novia, 4 piezas |
| VD007 | Rosa Cuarzo | Sofisticada Boutique | L | $160,000 | Disponible | Para damas de honor |
| VD008 | Plateado Brillante | Divas Collection | S | $190,000 | **En Lavandería** | Con pedrería + bolso |

### 4. Trajes de Caballero (6)

| Referencia | Color | Marca | Talla | Precio | Estado | Piezas |
|------------|-------|-------|-------|--------|--------|--------|
| TC001 | Negro Clásico | Distinguido Gentleman | L | $120,000 | Disponible | 4 piezas + corbata |
| TC002 | Azul Oscuro | Elegante Men | M | $100,000 | Disponible | 3 piezas Slim Fit |
| TC003 | Gris Oxford | Distinguido Gentleman | XL | $110,000 | Disponible | 3 piezas + moño |
| TC004 | Beige Claro | Summer Collection | M | $95,000 | Disponible | 2 piezas Slim Fit |
| TC005 | Negro Esmoquin | Premium Tuxedo | L | $180,000 | **Alquilado** | 5 piezas completas |
| TC006 | Azul Rey | Elegante Men | S | $105,000 | Disponible | 3 piezas Slim Fit |

### 5. Disfraces (6)

| Referencia | Personaje | Temática | Talla | Precio | Estado |
|------------|-----------|----------|-------|--------|--------|
| DF001 | Pirata del Caribe | Aventura | L | $80,000 | Disponible |
| DF002 | Princesa Medieval | Fantasía | S | $60,000 | Disponible |
| DF003 | Superhéroe Arácnido | Superhéroes | M | $70,000 | Disponible |
| DF004 | T-Rex | Animales | M | $55,000 | Disponible |
| DF005 | Caballero Oscuro | Superhéroes | L | $90,000 | **Alquilado** |
| DF006 | Reina de Hielo | Fantasía | S | $65,000 | Disponible |

### 6. Servicios de Alquiler (5)

| Número | Cliente | Empleado | Prendas | Fecha | Días | Total | Estado |
|--------|---------|----------|---------|-------|------|-------|--------|
| ALQ-0001 | Ana Sofía | Carlos | VD004 | Hace 7 días | 3 | $660,000 | Activo |
| ALQ-0002 | Luis Fernando | Laura | TC005 | Hace 3 días | 2 | $360,000 | Activo |
| ALQ-0003 | Isabella | Carlos | DF005 | Hace 3 días | 1 | $90,000 | Activo |
| ALQ-0004 | Sebastián | Laura | VD001 + VD002 | En 5 días | 4 | $1,320,000 | Reservado |
| ALQ-0005 | Valentina | Carlos | TC001 + TC002 | En 10 días | 2 | $440,000 | Reservado |

### 7. Cola de Lavandería (6) - Decorator Pattern

| Prenda | Manchada | Delicada | Urgente | Prioridad | Estado | Observaciones |
|--------|----------|----------|---------|-----------|--------|---------------|
| VD006 (Novia) | ✅ | ✅ | ✅ | **105** | En Proceso | Maquillaje, encaje, boda en 3 días |
| VD003 (Negro) | ❌ | ✅ | ✅ | **85** | Pendiente | Evento VIP mañana |
| VD008 (Plateado) | ✅ | ✅ | ❌ | **45** | Pendiente | Mancha de vino en falda |
| DF002 (Princesa) | ❌ | ✅ | ❌ | **25** | Pendiente | Tul delicado |
| TC003 (Gris) | ✅ | ❌ | ❌ | **20** | Pendiente | Manchas de comida |
| TC002 (Azul) | ❌ | ❌ | ❌ | **10** | Pendiente | Limpieza regular |

**Cálculo de Prioridad (Decorator Pattern)**:
- Base: 10
- + Manchada: +20
- + Delicada: +25
- + Urgente: +60
- **Máximo**: 105 (todos los decorators)

---

## 🔄 Cómo Funcionan los Seeds

### 1. Complete Data Seed (`complete-data.seed.ts`)

```typescript
export class CompleteDataSeed {
  public async run(dataSource: DataSource): Promise<void> {
    // 1. Crear empleados
    await this.seedEmpleados(dataSource);

    // 2. Crear clientes
    await this.seedClientes(dataSource);

    // 3. Crear prendas (respeta Factory Pattern)
    await this.seedVestidosDama(dataSource);
    await this.seedTrajes(dataSource);
    await this.seedDisfraces(dataSource);

    // 4. Inicializar consecutivos (Singleton Pattern)
    await this.seedConsecutivos(dataSource);

    // 5. Crear servicios (Builder Pattern)
    await this.seedServicios(dataSource);

    // 6. Crear cola lavandería (Decorator Pattern)
    await this.seedLavanderia(dataSource);
  }
}
```

### 2. Script de Ejecución (`run-complete-seed.ts`)

```typescript
async function runCompleteSeeds() {
  const dataSource = new DataSource(config);

  await dataSource.initialize();

  const seed = new CompleteDataSeed();
  await seed.run(dataSource);

  await dataSource.destroy();
}
```

---

## 🎯 Casos de Uso

### Desarrollo Local

```bash
# 1. Resetear y cargar datos frescos
npm run db:reset

# 2. Desarrollar features
npm run start:dev

# 3. Probar con datos realistas
# La base de datos tiene 40+ registros variados
```

### Testing

```bash
# Los tests unitarios utilizan mocks
npm run test:unit

# Después de desarrollo, resetear la base de datos (opcional)
npm run db:reset
```

### Demostración

```bash
# Cargar seed completo con datos atractivos
npm run seed:complete

# Iniciar aplicación
npm run start:dev

# Abrir Swagger
# http://localhost:3000/api/docs

# Ver cola de lavandería ordenada
GET /api/lavanderia/cola
# Retorna items ordenados por prioridad (105 → 10)

# Ver prendas disponibles
GET /api/prendas?disponible=true

# Ver estadísticas
GET /api/servicios/estadisticas
GET /api/lavanderia/estadisticas
```

---

## 🛠️ Personalizar Seeds

### Agregar Más Datos

Editar `complete-data.seed.ts`:

```typescript
private async seedEmpleados(dataSource: DataSource): Promise<void> {
  const empleadosData = [
    // ... datos existentes ...
    {
      nombre: 'Nuevo',
      apellido: 'Empleado',
      numeroIdentificacion: '1060708090',
      email: 'nuevo.empleado@losatuendos.com',
      telefono: '3501234567',
      direccion: 'Nueva Dirección',
      cargo: 'Nuevo Cargo',
      fechaContratacion: '2025-01-15',
      salario: 2000000,
    },
  ];
  // ... resto del código ...
}
```

### Crear Seed Personalizado

1. Crear archivo `custom-data.seed.ts`:

```typescript
import { DataSource } from 'typeorm';

export class CustomDataSeed {
  public async run(dataSource: DataSource): Promise<void> {
    // Tu lógica de seed aquí
    console.log('🌱 Custom seed running...');

    // Ejemplo: Crear solo clientes
    const clienteRepository = dataSource.getRepository(Cliente);
    // ... tu código ...

    console.log('✅ Custom seed completed!');
  }
}
```

2. Crear script de ejecución `run-custom-seed.ts`:

```typescript
import { DataSource } from 'typeorm';
import { getDatabaseConfig } from '../../config/database.config';
import { ConfigService } from '@nestjs/config';
import { CustomDataSeed } from './custom-data.seed';

async function runCustomSeeds() {
  const configService = new ConfigService();
  const config = getDatabaseConfig(configService);
  const dataSource = new DataSource(config as any);

  try {
    await dataSource.initialize();
    const seed = new CustomDataSeed();
    await seed.run(dataSource);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

runCustomSeeds();
```

3. Agregar script a `package.json`:

```json
{
  "scripts": {
    "seed:custom": "ts-node src/database/seeds/run-custom-seed.ts"
  }
}
```

4. Ejecutar:

```bash
npm run seed:custom
```

---

## 📝 Notas Importantes

1. **Orden de Ejecución**:
   - Los seeds respetan las dependencias de Foreign Keys
   - Orden: Empleados → Clientes → Prendas → Consecutivos → Servicios → Lavandería

2. **IDs Automáticos**:
   - TypeORM asigna IDs automáticamente
   - Los seeds guardan referencias a objetos creados para usarlos en relaciones

3. **Datos Realistas**:
   - Nombres, emails, teléfonos con formato colombiano
   - Precios en pesos colombianos (COP)
   - Fechas coherentes (servicios pasados/futuros)

4. **Patrones de Diseño**:
   - Factory: Usa las factories correctas para cada tipo de prenda
   - Builder: Servicios creados con todas sus dependencias
   - Singleton: Consecutivos inicializados correctamente
   - Decorator: Prioridades calculadas según características

5. **Limpieza**:
   - Usar el comando de reset: `npm run db:reset`
   - Este comando limpia todas las tablas y recarga el seed completo

---

## 🔗 Ver También

- [Testing Documentation](../../../docs/TESTING.md) - Documentación de tests
- [API Documentation](../../../docs/API-REST.md) - Documentación de la API
- [Postman Guide](../../../postman/README.md) - Guía de pruebas con Postman

---

**Última actualización**: Enero 2025
**Versión**: 1.0.0
**Mantenedor**: Equipo de Desarrollo - Los Atuendos