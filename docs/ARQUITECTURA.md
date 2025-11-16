# Arquitectura de Software - Los Atuendos

**Sistema de Alquiler de Vestuario**

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Capas de la Aplicación](#capas-de-la-aplicación)
4. [Patrones de Diseño](#patrones-de-diseño)
5. [Módulos del Sistema](#módulos-del-sistema)
6. [Modelo de Datos](#modelo-de-datos)
7. [Flujos de Proceso](#flujos-de-proceso)
8. [Decisiones Arquitectónicas](#decisiones-arquitectónicas)

---

## Visión General

### Propósito del Sistema

Los Atuendos es un sistema de gestión para el alquiler de vestuario (vestidos de dama, trajes de caballero y disfraces) que implementa patrones de diseño de software para garantizar escalabilidad, mantenibilidad y extensibilidad.

### Tecnologías Principales

- **Framework Backend**: NestJS 11.0.1
- **Lenguaje**: TypeScript 5.7.3
- **ORM**: TypeORM 0.3.27
- **Base de Datos**: MySQL 8.x
- **Documentación API**: Swagger/OpenAPI 3.0
- **Testing**: Jest 30.x + Supertest 7.x
- **Validación**: class-validator + class-transformer

### Principios de Diseño

1. **SOLID Principles**
   - Single Responsibility
   - Open/Closed
   - Liskov Substitution
   - Interface Segregation
   - Dependency Inversion

2. **Clean Architecture**
   - Separación de responsabilidades por capas
   - Independencia de frameworks
   - Testabilidad

3. **DRY (Don't Repeat Yourself)**
   - Reutilización de código mediante patrones
   - Abstracción de lógica común

---

## Arquitectura del Sistema

### Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                       API REST Layer                        │
│                     (Controllers + DTOs)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Business Logic Layer                     │
│          (Services + Design Patterns + Validators)          │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  Data Access Layer                          │
│              (Repositories + TypeORM Entities)              │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                     Database Layer                          │
│                      MySQL Database                         │
└─────────────────────────────────────────────────────────────┘
```

### Arquitectura de NestJS

```
┌──────────────────────────────────────────────────────────────┐
│                         AppModule                            │
│                   (Módulo Raíz de la Aplicación)             │
└──────────────────────────┬───────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼──────┐   ┌───────▼──────┐   ┌───────▼──────┐
│   Módulos    │   │   Módulos    │   │   Módulos    │
│  Funcionales │   │  de Patrones │   │  Compartidos │
│              │   │              │   │              │
│ • Prendas    │   │ • Creational │   │ • Config     │
│ • Clientes   │   │ • Structural │   │ • Database   │
│ • Empleados  │   │              │   │ • Common     │
│ • Servicios  │   │              │   │              │
│ • Lavandería │   │              │   │              │
└──────────────┘   └──────────────┘   └──────────────┘
```

---

## Capas de la Aplicación

### 1. Capa de Presentación (API REST)

**Responsabilidad**: Exponer endpoints HTTP y validar datos de entrada.

**Componentes**:

- **Controllers**: Manejan las solicitudes HTTP
- **DTOs**: Definen la estructura de datos de entrada/salida
- **Pipes**: Validación y transformación de datos
- **Guards**: Autenticación y autorización (futura implementación)

**Ejemplo**:

```typescript
@Controller('api/prendas')
export class PrendasController {
  @Post()
  async crearPrenda(@Body() createDto: CreatePrendaDto) {
    return await this.prendasService.crearPrenda(createDto);
  }
}
```

### 2. Capa de Lógica de Negocio

**Responsabilidad**: Implementar reglas de negocio y orquestar operaciones.

**Componentes**:

- **Services**: Lógica de negocio principal
- **Patrones de Diseño**: Factory, Builder, Singleton, etc.
- **Validators**: Validaciones de negocio
- **Exception Filters**: Manejo de errores

**Ejemplo**:

```typescript
@Injectable()
export class PrendasService {
  async crearPrenda(dto: CreatePrendaDto): Promise<Prenda> {
    // Validación de negocio
    await this.validarReferencia(dto.referencia);

    // Uso de patrón Factory
    const prenda = await this.prendaFactory.crearPrenda(dto.tipo, dto);

    return prenda;
  }
}
```

### 3. Capa de Acceso a Datos

**Responsabilidad**: Abstracción del acceso a la base de datos.

**Componentes**:

- **Repositories**: Patrón Repository para acceso a datos
- **Entities**: Modelos de TypeORM
- **Migrations**: Control de versiones de BD (futura implementación)

**Ejemplo**:

```typescript
@Injectable()
export class PrendaRepository implements IPersistenciaAdapter<Prenda> {
  async guardar(prenda: Prenda): Promise<Prenda> {
    return await this.repository.save(prenda);
  }

  async buscarPorId(id: number): Promise<Prenda | null> {
    return await this.repository.findOne({ where: { id } });
  }
}
```

### 4. Capa de Persistencia

**Responsabilidad**: Almacenamiento y recuperación de datos.

**Tecnología**: MySQL 8.x con TypeORM

**Características**:

- Relaciones entre entidades
- Índices para optimización
- Constraints de integridad referencial

---

## Patrones de Diseño

### Patrones Creacionales

#### 1. Factory Method Pattern

**Ubicación**: `src/patterns/creational/factory/`

**Propósito**: Crear diferentes tipos de prendas (vestidos, trajes, disfraces) sin especificar sus clases concretas.

**Implementación**:

```
           ┌─────────────────────────────────────────┐
           │     PrendaFactoryInterface              │
           │  + crearPrenda(tipo, datos): Prenda     │
           └──────────────▲──────────────────────────┘
                          │
                          │ implements
                          │
    ┌─────────────────────┴────────────────┐
    │                     │                │
┌───▼──────────┐   ┌──────▼─────┐   ┌──────▼────────┐
│VestidoDama   │   │TrajeCabal  │   │Disfraz        │
│Factory       │   │leroFactory │   │Factory        │
│              │   │            │   │               │
│+ crearPrenda │   │+ crearPrend│   │+ crearPrenda  │
└──────────────┘   └────────────┘   └───────────────┘
```

**Componentes**:

- `PrendaFactoryInterface`: Define el contrato para todas las factories
- `AbstractPrendaFactory`: Clase base con lógica común
- `VestidoDamaFactory`: Crea vestidos de dama
- `TrajeCaballeroFactory`: Crea trajes de caballero
- `DisfrazFactory`: Crea disfraces
- `PrendaFactoryRegistry`: Registro de factories disponibles

**Beneficios**:

- Fácil adición de nuevos tipos de prendas
- Separación de lógica de creación
- Cumple con Open/Closed Principle

**Ejemplo de Uso**:

```typescript
// Registro de factories
this.registry.register('vestido-dama', vestidoDamaFactory);
this.registry.register('traje-caballero', trajeCaballeroFactory);
this.registry.register('disfraz', disfrazFactory);

// Creación de prenda
const factory = this.registry.getFactory('vestido-dama');
const vestido = await factory.crearPrenda(datos);
```

#### 2. Builder Pattern

**Ubicación**: `src/patterns/creational/builder/`

**Propósito**: Construir servicios de alquiler complejos paso a paso.

**Implementación**:

```
┌────────────────────────────────────────┐
│  ServicioAlquilerBuilder               │
│                                        │
│  + reset(): Builder                    │
│  + setCliente(id): Builder             │
│  + setEmpleado(id): Builder            │
│  + setFechaAlquiler(fecha): Builder    │
│  + agregarPrendas(ids[]): Builder      │
│  + setObservaciones(obs): Builder      │
│  + build(): ServicioAlquiler           │
└────────────────────────────────────────┘
```

**Características**:

- **Fluent Interface**: Encadenamiento de métodos
- **Validación Paso a Paso**: Valida cada componente
- **Reset Automático**: Limpia el estado después de build
- **Validaciones de Negocio**:
  - Fecha no puede ser en el pasado
  - Prendas deben estar disponibles
  - Cliente y empleado deben existir

**Beneficios**:

- Construcción clara y legible
- Validación granular
- Reutilizable

**Ejemplo de Uso**:

```typescript
const servicio = await this.builder
  .reset()
  .setCliente(clienteId)
  .setEmpleado(empleadoId)
  .setFechaAlquiler(fecha)
  .agregarPrendas([prendaId1, prendaId2])
  .setObservaciones('Evento corporativo')
  .build();
```

#### 3. Singleton Pattern

**Ubicación**: `src/patterns/creational/singleton/`

**Propósito**: Garantizar una única instancia del generador de números consecutivos.

**Implementación**:

```
┌─────────────────────────────────────┐
│   GeneradorConsecutivo              │
│   (Singleton)                       │
│                                     │
│   - instance: GeneradorConsecutivo  │
│   - constructor() [private]         │
│                                     │
│   + getInstance(): GeneradorConsec  │
│   + generar(tipo): Promise<string>  │
│   + obtenerActual(tipo): Promise<#> │
│   + resetear(tipo): Promise<void>   │
└─────────────────────────────────────┘
```

**Características**:

- **Constructor Privado**: Previene instanciación directa
- **Instancia Única**: Solo una instancia en toda la aplicación
- **Thread-Safe**: Sincronización para operaciones concurrentes
- **Persistencia**: Guarda consecutivos en base de datos

**Beneficios**:

- Números únicos garantizados
- Centralización de lógica
- Previene duplicados

**Ejemplo de Uso**:

```typescript
const generador = GeneradorConsecutivo.getInstance();
const numeroServicio = await generador.generar('SERVICIO');
// Resultado: "ALQ-0001", "ALQ-0002", etc.
```

### Patrones Estructurales

#### 4. Adapter Pattern

**Ubicación**: `src/patterns/structural/adapter/`

**Propósito**: Adaptar diferentes sistemas de persistencia a una interfaz común.

**Implementación**:

```
┌──────────────────────────────────┐
│   IPersistenciaAdapter<T>        │
│                                  │
│   + guardar(entity): Promise<T>  │
│   + buscarPorId(id): Promise<T>  │
│   + buscarTodos(): Promise<T[]>  │
│   + actualizar(entity): Promise  │
│   + eliminar(id): Promise<void>  │
└────────────▲─────────────────────┘
             │
             │ implements
             │
┌────────────┴────────────────────┐
│  AdaptadorBDRelacional<T>       │
│                                 │
│  - repository: Repository<T>    │
│                                 │
│  + guardar(entity): Promise<T>  │
│  + buscarPorId(id): Promise<T>  │
│  + buscarTodos(): Promise<T[]>  │
│  + actualizar(entity): Promise  │
│  + eliminar(id): Promise<void>  │
└─────────────────────────────────┘
```

**Beneficios**:

- Independencia de la implementación de BD
- Fácil cambio de sistema de persistencia
- Testeable con mocks

**Ejemplo de Uso**:

```typescript
@Injectable()
export class PrendaRepository extends AdaptadorBDRelacional<Prenda> {
  constructor(
    @InjectRepository(Prenda)
    repository: Repository<Prenda>,
  ) {
    super(repository);
  }
}
```

#### 5. Decorator Pattern

**Ubicación**: `src/patterns/structural/decorator/`

**Propósito**: Calcular dinámicamente la prioridad de items de lavandería.

**Implementación**:

```
┌──────────────────────────────────┐
│   ItemLavanderiaComponent        │
│                                  │
│   + calcularPrioridad(): number  │
└────────────▲─────────────────────┘
             │
             │ implements
             │
    ┌────────┴────────┐
    │                 │
┌───▼────────┐  ┌────▼────────────────┐
│ItemBase    │  │ Decorators          │
│Lavanderia  │  │                     │
│            │  │ • ManchadaDecorator │
│Prioridad:10│  │ • DelicadaDecorator │
└────────────┘  │ • UrgenteDecorator  │
                └─────────────────────┘
```

**Cálculo de Prioridad**:

- **Base**: 10 puntos
- **+ Manchada**: +20 puntos
- **+ Delicada**: +25 puntos
- **+ Urgente**: +60 puntos
- **Máximo Posible**: 105 puntos

**Beneficios**:

- Cálculo dinámico de prioridad
- Fácil adición de nuevos criterios
- Combinación de múltiples decorators

**Ejemplo de Uso**:

```typescript
let item = new ItemBaseLavanderia(prenda);

if (esManchada) {
  item = new ManchadaDecorator(item, configuracion);
}
if (esDelicada) {
  item = new DelicadaDecorator(item, configuracion);
}
if (requiereUrgente) {
  item = new UrgenteDecorator(item, configuracion);
}

const prioridad = item.calcularPrioridad(); // 105 si tiene todos
```

#### 6. Composite Pattern

**Ubicación**: `src/patterns/structural/composite/`

**Propósito**: Gestionar conjuntos de prendas como si fueran prendas individuales.

**Implementación**:

```
┌────────────────────────────────┐
│   IPrendaComponent             │
│                                │
│   + obtenerValor(): number     │
│   + obtenerDescripcion(): str  │
└────────────▲───────────────────┘
             │
             │ implements
             │
    ┌────────┴────────┐
    │                 │
┌───▼────────┐  ┌────▼──────────┐
│PrendaSimple│  │ConjuntoPrendas│
│Component   │  │Component      │
│            │  │               │
│            │  │- prendas: []  │
│            │  │+ agregar()    │
│            │  │+ remover()    │
└────────────┘  └───────────────┘
```

**Beneficios**:

- Trata prendas individuales y conjuntos uniformemente
- Facilita cálculos recursivos
- Extensible para nuevos tipos

#### 7. Facade Pattern

**Ubicación**: `src/patterns/structural/facade/`

**Propósito**: Simplificar operaciones complejas que involucran múltiples subsistemas.

**Implementación**:

```
┌─────────────────────────────────────┐
│   AlquilerFacade                    │
│                                     │
│   + crearAlquilerCompleto(dto)      │
│   + finalizarAlquiler(id)           │
│   + procesarDevolucion(id)          │
└──────────┬──────────────────────────┘
           │
           │ coordina
           │
    ┌──────┴─────┬─────────┬──────────┐
    │            │         │          │
┌───▼───┐  ┌────▼──┐  ┌──▼───┐  ┌───▼────┐
│Prendas│  │Cliente│  │Servic│  │Lavander│
│Service│  │Service│  │Service│  │Service │
└───────┘  └───────┘  └──────┘  └────────┘
```

**Beneficios**:

- Interface simplificada
- Reduce acoplamiento del cliente
- Coordina múltiples servicios

#### 8. Repository Pattern

**Ubicación**: Implementado en cada módulo (`*/repositories/`)

**Propósito**: Abstracción de la lógica de acceso a datos.

**Implementación**:

```
┌────────────────────────────────┐
│   BaseRepository<T>            │
│                                │
│   + guardar(entity): Promise   │
│   + buscarPorId(id): Promise   │
│   + buscarTodos(): Promise     │
│   + actualizar(entity): Promise│
│   + eliminar(id): Promise      │
└────────────▲───────────────────┘
             │
             │ extends
             │
    ┌────────┴────────┬──────────┐
    │                 │          │
┌───▼────────┐  ┌────▼──┐  ┌────▼──┐
│Prenda      │  │Cliente│  │Servicio│
│Repository  │  │Reposit│  │Reposit │
└────────────┘  └───────┘  └────────┘
```

**Beneficios**:

- Separación de lógica de negocio y acceso a datos
- Facilita testing con mocks
- Centraliza queries complejas

---

## Módulos del Sistema

### 1. Módulo de Prendas

**Responsabilidad**: Gestión del inventario de prendas.

**Componentes**:

- **Controller**: `PrendasController`
- **Service**: `PrendasService`
- **Repository**: `PrendaRepository`
- **Entities**: `Prenda`, `VestidoDama`, `TrajeCaballero`, `Disfraz`
- **DTOs**: `CreatePrendaDto`, `UpdatePrendaDto`

**Funcionalidades**:

- CRUD de prendas
- Búsqueda por referencia, talla, tipo
- Control de disponibilidad
- Integración con Factory Pattern

### 2. Módulo de Clientes

**Responsabilidad**: Gestión de información de clientes.

**Componentes**:

- **Controller**: `ClientesController`
- **Service**: `ClientesService`
- **Repository**: `ClienteRepository`
- **Entity**: `Cliente`

**Funcionalidades**:

- CRUD de clientes
- Validación de unicidad de email
- Historial de servicios por cliente

### 3. Módulo de Empleados

**Responsabilidad**: Gestión de empleados del sistema.

**Componentes**:

- **Controller**: `EmpleadosController`
- **Service**: `EmpleadosService`
- **Repository**: `EmpleadoRepository`
- **Entity**: `Empleado`

**Funcionalidades**:

- CRUD de empleados
- Gestión de cargos
- Servicios atendidos por empleado

### 4. Módulo de Servicios

**Responsabilidad**: Gestión de servicios de alquiler.

**Componentes**:

- **Controller**: `ServiciosController`
- **Service**: `ServiciosService`
- **Repository**: `ServicioRepository`
- **Entity**: `ServicioAlquiler`
- **Builder**: `ServicioAlquilerBuilder`
- **Singleton**: `GeneradorConsecutivo`

**Funcionalidades**:

- Creación de servicios (Builder Pattern)
- Generación de números consecutivos (Singleton)
- Cálculo de valor total
- Control de fechas y disponibilidad
- Estadísticas de servicios

### 5. Módulo de Lavandería

**Responsabilidad**: Gestión de cola de lavandería.

**Componentes**:

- **Controller**: `LavanderiaController`
- **Service**: `LavanderiaService`
- **Repository**: `LavanderiaRepository`
- **Entity**: `ItemLavanderia`
- **Decorators**: Cálculo dinámico de prioridad

**Funcionalidades**:

- Registro de items
- Cola ordenada por prioridad (Decorator Pattern)
- Envío de lotes
- Estadísticas de lavandería
- Configuración de características especiales

### Herencia de Prendas (Single Table Inheritance)

```
                 ┌─────────┐
                 │ Prenda  │
                 │ (base)  │
                 └────┬────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
    ┌─────▼─────┐ ┌──▼────┐ ┌────▼──────┐
    │ Vestido   │ │Traje  │ │  Disfraz  │
    │   Dama    │ │Cabal  │ │           │
    │           │ │lero   │ │           │
    │+ tienePed │ │+ tipo │ │+ personaje│
    │+ esLargo  │ │  Corte│ │+ incluye  │
    │+ cantidad │ │+ incluy│ │  Accesor  │
    │  Piezas   │ │  Corba│ │+ tematica │
    └───────────┘ │  ta   │ └───────────┘
                  └───────┘
```

---

## Flujos de Proceso

### 1. Flujo de Creación de Servicio de Alquiler

```
┌─────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
│ Cliente │────▶│Controller│────▶│ Service │────▶│ Builder  │
│  HTTP   │     │          │     │         │     │          │
└─────────┘     └──────────┘     └─────────┘     └────┬─────┘
                                                       │
    1. POST /api/servicios                             │
    {                                                  │
      clienteId: 1,                                    ▼
      empleadoId: 1,                         2. Validar datos
      prendasIds: [1,2],                        │
      fechaAlquiler: "2025-12-01"               ▼
    }                                    3. Verificar prendas
                                                │
                                                ▼
                                         4. Generar número
                                            (Singleton)
                                                │
                                                ▼
                                         5. Calcular total
                                                │
                                                ▼
                                         6. Crear servicio
                                                │
    ◀──────────────────────────────────────────┘

    Response: {
      id: 1,
      numero: "ALQ-0001",
      valorTotal: 300000,
      estado: "pendiente"
    }
```

### 2. Flujo de Creación de Prenda (Factory Pattern)

```
┌─────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
│ Cliente │────▶│Controller│────▶│ Service │────▶│ Factory  │
│  HTTP   │     │          │     │         │     │ Registry │
└─────────┘     └──────────┘     └─────────┘     └────┬─────┘
                                                       │
    1. POST /api/prendas                              │
    {                                                  ▼
      tipo: "vestido-dama",                   2. Buscar factory
      referencia: "VD-001",                      por tipo
      color: "Rojo",                               │
      talla: "M",                                  ▼
      tienePedreria: true                   3. VestidoDamaFactory
    }                                              │
                                                   ▼
                                            4. Validar datos
                                                   │
                                                   ▼
                                            5. Crear VestidoDama
                                                   │
                                                   ▼
                                            6. Guardar en BD
                                                   │
    ◀──────────────────────────────────────────────┘

    Response: {
      id: 1,
      tipo: "vestido-dama",
      referencia: "VD-001",
      tienePedreria: true,
      disponible: true
    }
```

### 3. Flujo de Priorización de Lavandería (Decorator Pattern)

```
┌─────────┐     ┌──────────┐     ┌─────────┐     ┌─  ─────────┐
│ Cliente │────▶│Controller│────▶│ Service │────▶│Decorator │
│  HTTP   │     │          │     │         │     │  Chain     │
└─────────┘     └──────────┘     └─────────┘      ───┬─────┘
                                                     │
    1. POST /api/lavanderia                          │
    {                                                ▼
      prendaId: 1,                            2. ItemBase (10)
      esManchada: true,                              │
      esDelicada: true,                              ▼
      requiereUrgente: true                  3. + ManchadaDec (+20)
    }                                                │
                                                     ▼
                                             4. + DelicadaDec (+25)
                                                     │
                                                     ▼
                                             5. + UrgenteDec (+60)
                                                     │
                                                     ▼
                                             Prioridad Final: 105
                                                     │
    ◀────────────────────────────────────────────────┘

    Response: {
      id: 1,
      prendaId: 1,
      prioridad: 105,
      estado: "pendiente"
    }
```

---

## Decisiones Arquitectónicas

### 1. Uso de NestJS como Framework

**Razón**:

- Arquitectura modular y escalable
- Soporte nativo para TypeScript
- Inyección de dependencias robusta
- Ecosistema maduro

**Alternativas Consideradas**:

- Express.js (menos estructura)
- Fastify (menor ecosistema)

### 2. TypeORM como ORM

**Razón**:

- Integración perfecta con NestJS
- Soporte para relaciones complejas
- Type-safety con TypeScript
- Active Record y Data Mapper patterns

**Alternativas Consideradas**:

- Prisma (menor flexibilidad)
- Sequelize (menos TypeScript-friendly)

### 3. Single Table Inheritance para Prendas

**Razón**:

- Simplifica queries
- Mejor performance
- Facilita polimorfismo

**Trade-offs**:

- Algunas columnas nullable
- Tabla puede crecer

### 4. Repository Pattern sobre Active Record

**Razón**:

- Mayor testabilidad
- Separación de responsabilidades
- Facilita cambios de implementación

### 5. DTOs para Validación

**Razón**:

- Validación centralizada
- Type-safety
- Documentación automática (Swagger)
- Separación de API y dominio

### 6. Patrones de Diseño Implementados

**Razón**:

- Demostración de conocimientos
- Código más mantenible
- Facilita extensibilidad
- Mejores prácticas de la industria

### 7. Swagger para Documentación

**Razón**:

- Documentación automática
- Pruebas interactivas
- Contract-first approach
- Estándar de la industria

---

## Consideraciones de Escalabilidad

### Actuales

1. **Vertical Scaling**: Arquitectura permite escalar recursos del servidor
2. **Database Indexing**: Índices en campos frecuentemente consultados
3. **Connection Pooling**: Gestión eficiente de conexiones a BD

### Futuras Mejoras

1. **Caching**: Implementar Redis para datos frecuentes
2. **Queue System**: RabbitMQ/Bull para operaciones asíncronas
3. **Microservicios**: Separar módulos en servicios independientes
4. **Load Balancing**: Múltiples instancias detrás de load balancer
5. **Database Replication**: Master-slave para lectura/escritura

---

## Seguridad

### Implementado

1. **Validación de Entrada**: class-validator en todos los DTOs
2. **SQL Injection Prevention**: TypeORM parameterized queries
3. **CORS**: Configuración de orígenes permitidos

### Futuras Mejoras

1. **Autenticación**: JWT tokens
2. **Autorización**: RBAC (Role-Based Access Control)
3. **Rate Limiting**: Prevención de ataques DDoS
4. **Encryption**: Datos sensibles encriptados
5. **Audit Logging**: Registro de acciones críticas

---

## Testing

### Estrategia de Testing

```
┌────────────────────────────────────────┐
│         Testing Pyramid                │
│                                        │
│              ┌──────┐                  │
│              │  E2E │ (Eliminados)     │
│              └──────┘                  │
│            ┌──────────┐                │
│            │Integration│ (Futuros)     │
│            └──────────┘                │
│        ┌────────────────┐              │
│        │  Unit Tests    │ ✅ 140 tests
│        └────────────────┘              │
└────────────────────────────────────────┘
```

### Cobertura Actual

- **Total de Tests**: 140 tests unitarios
- **Cobertura**: ~85%
- **Patrones Validados**: 7 patrones de diseño

---

## Métricas y Monitoreo

### Futuras Implementaciones

1. **Application Metrics**:
   - Tiempo de respuesta de endpoints
   - Throughput de requests
   - Error rates

2. **Business Metrics**:
   - Servicios creados por día
   - Prendas más alquiladas
   - Ingresos totales

3. **Infrastructure Metrics**:
   - CPU/Memory usage
   - Database connections
   - Disk I/O

---

## Conclusión

La arquitectura de Los Atuendos está diseñada siguiendo principios SOLID y patrones de diseño reconocidos de la industria. El sistema es:

- **Mantenible**: Código limpio y bien organizado
- **Escalable**: Preparado para crecimiento
- **Testeable**: Amplia cobertura de tests
- **Extensible**: Fácil adición de nuevas funcionalidades
- **Documentado**: Documentación completa y actualizada
