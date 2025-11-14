# Scripts SQL - Los Atuendos

## 📋 Descripción

Este directorio contiene todos los scripts SQL necesarios para la configuración, optimización, mantenimiento y gestión de la base de datos del proyecto Los Atuendos.

## 📁 Estructura de Archivos

```
sql/
├── 01-create-database.sql       # Creación de bases de datos
├── 02-stored-procedures.sql     # Procedimientos almacenados
├── 03-indexes.sql               # Índices optimizados
├── 04-cleanup-reset.sql         # Limpieza y reset de datos
└── README.md                    # Este archivo
```

---

## 🚀 Inicio Rápido

### 1. Crear Base de Datos

```bash
# En MySQL Workbench o consola MySQL
mysql -u root -p < sql/01-create-database.sql
```

O ejecutar el script manualmente:
```sql
source sql/01-create-database.sql;
```

### 2. Iniciar Aplicación (TypeORM crea las tablas)

```bash
npm run start:dev
```

TypeORM creará automáticamente todas las tablas basándose en las entidades.

### 3. Cargar Datos de Prueba

```bash
# Seed completo con datos realistas
npm run seed:complete

# O seed básico
npm run seed:run
```

### 4. (Opcional) Agregar Procedimientos e Índices

```bash
mysql -u root -p los_atuendos < sql/02-stored-procedures.sql
mysql -u root -p los_atuendos < sql/03-indexes.sql
```

---

## 📄 Detalle de Scripts

### 01-create-database.sql

**Propósito**: Crear bases de datos de desarrollo y testing

**Contenido**:
- Crea `los_atuendos` (desarrollo)
- Crea `los_atuendos_test` (testing)
- Configura charset UTF-8
- (Opcional) Crea usuario específico

**Ejecución**:
```bash
mysql -u root -p < sql/01-create-database.sql
```

**Nota**: ⚠️ Este script elimina las bases de datos existentes si ya existen.

---

### 02-stored-procedures.sql

**Propósito**: Procedimientos almacenados para consultas y operaciones frecuentes

**Procedimientos Incluidos**:

#### 1. `sp_obtener_estadisticas_generales()`
Retorna estadísticas generales del sistema.

```sql
CALL sp_obtener_estadisticas_generales();
```

**Resultado**: Total de clientes, empleados, prendas, servicios, items de lavandería, etc.

#### 2. `sp_buscar_prendas_disponibles(tipo, talla)`
Busca prendas disponibles con filtros opcionales.

```sql
-- Todos los vestidos de dama talla M disponibles
CALL sp_buscar_prendas_disponibles('VestidoDama', 'M');

-- Todas las prendas disponibles
CALL sp_buscar_prendas_disponibles(NULL, NULL);

-- Todas las prendas talla L
CALL sp_buscar_prendas_disponibles(NULL, 'L');
```

#### 3. `sp_servicios_por_cliente(cliente_id)`
Obtiene todos los servicios de un cliente específico.

```sql
CALL sp_servicios_por_cliente(1);
```

#### 4. `sp_cola_lavanderia_prioridad()`
Retorna la cola de lavandería ordenada por prioridad.

```sql
CALL sp_cola_lavanderia_prioridad();
```

**Resultado**: Items ordenados por prioridad DESC con indicadores visuales (🔴🟠🟡🟢).

#### 5. `sp_reporte_ingresos_periodo(fecha_inicio, fecha_fin)`
Genera reporte de ingresos para un período.

```sql
-- Ingresos de enero 2025
CALL sp_reporte_ingresos_periodo('2025-01-01', '2025-01-31');
```

**Resultado**: Ingresos diarios y resumen total del período.

#### 6. `sp_prendas_mas_alquiladas(limite)`
Top de prendas más alquiladas.

```sql
-- Top 10 prendas más alquiladas
CALL sp_prendas_mas_alquiladas(10);
```

#### 7. `sp_clientes_frecuentes(limite)`
Top de clientes más frecuentes.

```sql
-- Top 5 mejores clientes
CALL sp_clientes_frecuentes(5);
```

#### 8. `sp_verificar_disponibilidad(prenda_id, fecha_inicio, fecha_fin)`
Verifica si una prenda está disponible para un período.

```sql
-- Verificar disponibilidad de prenda #1 del 1 al 5 de febrero
CALL sp_verificar_disponibilidad(1, '2025-02-01', '2025-02-05');
```

**Ejecución del Script**:
```bash
mysql -u root -p los_atuendos < sql/02-stored-procedures.sql
```

---

### 03-indexes.sql

**Propósito**: Optimizar el rendimiento de consultas frecuentes

**Índices Creados**:

#### Tabla `prendas` (5 índices)
- `idx_prendas_disponible_estado` - Búsquedas de disponibilidad
- `idx_prendas_tipo_talla` - Filtros por tipo y talla
- `idx_prendas_valor_alquiler` - Rangos de precio
- `idx_prendas_created_at` - Ordenamiento temporal
- `idx_prendas_busqueda_completa` - Búsquedas complejas

#### Tabla `clientes` (3 índices)
- `idx_clientes_nombre_apellido` - Búsquedas por nombre
- `idx_clientes_telefono` - Búsquedas por teléfono
- `idx_clientes_created_at` - Ordenamiento temporal

#### Tabla `empleados` (3 índices)
- `idx_empleados_cargo` - Filtros por cargo
- `idx_empleados_nombre_apellido` - Búsquedas por nombre
- `idx_empleados_fecha_contratacion` - Ordenamiento por contratación

#### Tabla `servicios_alquiler` (4 índices)
- `idx_servicios_estado_fecha` - Filtros por estado
- `idx_servicios_fecha_alquiler` - Rangos de fechas
- `idx_servicios_valor_estado` - Cálculos de totales
- `idx_servicios_reporte` - Consultas de reportes

#### Tabla `items_lavanderia` (4 índices)
- `idx_lavanderia_estado_prioridad` - Cola por prioridad
- `idx_lavanderia_urgente` - Items urgentes
- `idx_lavanderia_fecha_registro` - Ordenamiento temporal
- `idx_lavanderia_completo` - Filtros complejos

#### Tabla `servicios_prendas` (3 índices)
- `idx_servicios_prendas_servicio` - Búsquedas por servicio
- `idx_servicios_prendas_prenda` - Búsquedas por prenda
- `idx_servicios_prendas_compuesto` - JOINs optimizados

**Total**: ~22 índices adicionales

**Ejecución**:
```bash
mysql -u root -p los_atuendos < sql/03-indexes.sql
```

**Verificar Índices**:
```sql
-- Ver todos los índices del sistema
SELECT
    TABLE_NAME, INDEX_NAME, COLUMN_NAME
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'los_atuendos'
ORDER BY TABLE_NAME, INDEX_NAME;
```

---

### 04-cleanup-reset.sql

**Propósito**: Scripts para limpieza y reset de datos

**⚠️ ADVERTENCIA**: Estos scripts eliminan datos. Usar con precaución.

**Procedimientos Disponibles**:

#### 1. `sp_limpiar_todas_tablas()`
Elimina TODOS los datos de todas las tablas.

```sql
CALL sp_limpiar_todas_tablas();
```

**Uso**: Reset completo antes de cargar seeds.

#### 2. `sp_limpiar_tabla(nombre_tabla)`
Elimina datos de una tabla específica.

```sql
CALL sp_limpiar_tabla('clientes');
CALL sp_limpiar_tabla('prendas');
```

#### 3. `sp_limpiar_datos_prueba()`
Elimina solo datos de testing/prueba.

```sql
CALL sp_limpiar_datos_prueba();
```

**Criterios**: Referencias con `%-TEST-%`, emails `@test.com`, observaciones con "test", "prueba", "testing".

#### 4. `sp_reset_completo()`
Limpieza total + mensaje para ejecutar seeds.

```sql
CALL sp_reset_completo();
-- Luego ejecutar: npm run seed:complete
```

#### 5. `sp_limpiar_datos_antiguos(dias)`
Elimina servicios e items completados de más de X días.

```sql
-- Eliminar datos de más de 90 días
CALL sp_limpiar_datos_antiguos(90);

-- Eliminar datos de más de 1 año
CALL sp_limpiar_datos_antiguos(365);
```

#### 6. `sp_estadisticas_antes_limpieza()`
Ver estadísticas antes de limpiar (útil para verificar).

```sql
CALL sp_estadisticas_antes_limpieza();
```

#### 7. `sp_crear_backup_tablas()`
Crear backup temporal antes de limpieza.

```sql
CALL sp_crear_backup_tablas();
-- Crea: backup_clientes, backup_empleados, backup_prendas, backup_servicios
```

#### 8. `sp_restaurar_desde_backup()`
Restaurar datos desde backup.

```sql
CALL sp_restaurar_desde_backup();
```

**Flujo Recomendado para Reset Seguro**:
```sql
-- 1. Ver estadísticas actuales
CALL sp_estadisticas_antes_limpieza();

-- 2. Crear backup
CALL sp_crear_backup_tablas();

-- 3. Limpiar
CALL sp_limpiar_todas_tablas();

-- 4. Si algo sale mal, restaurar
CALL sp_restaurar_desde_backup();
```

**Ejecución del Script**:
```bash
mysql -u root -p los_atuendos < sql/04-cleanup-reset.sql
```

---

## 🌱 Seeds de Datos

Los seeds de datos están implementados en TypeScript usando TypeORM.

### Comandos Disponibles

```bash
# Seed completo con datos realistas (RECOMENDADO)
npm run seed:complete

# Seed básico original
npm run seed:run

# Seed de demostración
npm run seed:demo

# Reset completo (limpia y carga seed completo)
npm run db:reset

# Alias para seed completo
npm run db:seed
```

### Seed Completo (`complete-data.seed.ts`)

**Datos Incluidos**:
- 👔 **5 Empleados** con cargos variados
- 👥 **8 Clientes** con información realista
- 👗 **8 Vestidos de Dama** (diferentes colores, marcas, precios)
- 🤵 **6 Trajes de Caballero** (varios estilos y tallas)
- 🎭 **6 Disfraces** (temáticas variadas)
- 📋 **5 Servicios de Alquiler** (activos y reservados)
- 🧺 **6 Items de Lavandería** con prioridades variadas (0-105)
- 🔢 **Consecutivos** inicializados

**Total**: 40+ registros con datos realistas

**Características**:
- ✅ Datos coherentes y relacionados entre sí
- ✅ Fechas realistas (pasadas y futuras)
- ✅ Prendas en diferentes estados (disponible, alquilado, en_lavanderia)
- ✅ Servicios activos y reservados
- ✅ Cola de lavandería con prioridades variadas (Decorator Pattern)
- ✅ Validación de patrones de diseño

**Ejecución**:
```bash
npm run seed:complete
```

**Salida Ejemplo**:
```
🌱 Iniciando seed de datos completos...

👔 Creando empleados...
   ✓ 5 empleados creados
👥 Creando clientes...
   ✓ 8 clientes creados
👗 Creando vestidos de dama...
   ✓ 8 vestidos de dama creados
🤵 Creando trajes de caballero...
   ✓ 6 trajes de caballero creados
🎭 Creando disfraces...
   ✓ 6 disfraces creados
🔢 Inicializando consecutivos...
   ✓ Consecutivo inicializado
📋 Creando servicios de alquiler...
   ✓ 5 servicios de alquiler creados
🧺 Creando cola de lavandería...
   ✓ 6 items de lavandería creados

✅ Seed de datos completos finalizado exitosamente!

📊 RESUMEN DE DATOS CREADOS:
═══════════════════════════════════════
   👔 Empleados:              5
   👥 Clientes:               8
   👗 Vestidos de Dama:       8
   🤵 Trajes de Caballero:    6
   🎭 Disfraces:              6
   📋 Servicios de Alquiler:  5
   🧺 Items de Lavandería:    6
═══════════════════════════════════════
   TOTAL PRENDAS:             20
═══════════════════════════════════════
```

---

## 🔄 Flujo de Trabajo Completo

### Configuración Inicial del Proyecto

```bash
# 1. Crear bases de datos
mysql -u root -p < sql/01-create-database.sql

# 2. Iniciar aplicación (TypeORM crea tablas)
npm run start:dev

# 3. Cargar datos de prueba
npm run seed:complete

# 4. (Opcional) Agregar procedimientos e índices
mysql -u root -p los_atuendos < sql/02-stored-procedures.sql
mysql -u root -p los_atuendos < sql/03-indexes.sql
```

### Reset y Recarga de Datos

```bash
# Opción 1: Usando procedimientos SQL
mysql -u root -p los_atuendos
> CALL sp_reset_completo();
> exit

npm run seed:complete

# Opción 2: Usando script npm
npm run db:reset
```

### Limpieza de Datos de Prueba

```bash
mysql -u root -p los_atuendos
> CALL sp_limpiar_datos_prueba();
```

### Mantenimiento de Datos Antiguos

```bash
mysql -u root -p los_atuendos
> CALL sp_limpiar_datos_antiguos(90); # Eliminar datos de +90 días
```

---

## 📊 Consultas Útiles

### Verificar Estado de la Base de Datos

```sql
-- Ver todas las tablas
SHOW TABLES;

-- Contar registros en cada tabla
SELECT 'clientes' AS tabla, COUNT(*) AS registros FROM clientes
UNION ALL
SELECT 'empleados', COUNT(*) FROM empleados
UNION ALL
SELECT 'prendas', COUNT(*) FROM prendas
UNION ALL
SELECT 'servicios_alquiler', COUNT(*) FROM servicios_alquiler
UNION ALL
SELECT 'items_lavanderia', COUNT(*) FROM items_lavanderia;

-- Ver estadísticas completas
CALL sp_obtener_estadisticas_generales();
```

### Consultas de Datos

```sql
-- Prendas disponibles
SELECT * FROM prendas WHERE disponible = TRUE AND estado = 'disponible';

-- Servicios activos
SELECT * FROM servicios_alquiler WHERE estado = 'activo';

-- Cola de lavandería por prioridad
CALL sp_cola_lavanderia_prioridad();

-- Top 5 clientes
CALL sp_clientes_frecuentes(5);
```

---

## 🛠️ Troubleshooting

### Problema: "Table already exists"

**Solución**: Eliminar tablas existentes
```sql
CALL sp_limpiar_todas_tablas();
```
Luego reiniciar la aplicación para que TypeORM las recree.

### Problema: "Foreign key constraint fails"

**Solución**: Limpiar en orden correcto
```sql
SET FOREIGN_KEY_CHECKS = 0;
-- Ejecutar limpiezas
SET FOREIGN_KEY_CHECKS = 1;
```

O usar procedimiento que maneja esto:
```sql
CALL sp_limpiar_todas_tablas();
```

### Problema: "Access denied for user"

**Solución**: Verificar credenciales en `.env`
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password
DB_NAME=los_atuendos
```

### Problema: "Cannot connect to MySQL server"

**Solución**:
1. Verificar que XAMPP/MySQL está corriendo
2. Verificar puerto en `.env` (3306 por defecto)
3. Verificar firewall

---

## 📝 Notas Importantes

1. **TypeORM y Sincronización**:
   - TypeORM crea/actualiza automáticamente las tablas en desarrollo
   - `TYPEORM_SYNC=true` en `.env` habilita esto
   - En producción, usar migraciones en lugar de sync

2. **Índices**:
   - Los índices mejoran el rendimiento de consultas
   - Pueden ralentizar INSERT/UPDATE/DELETE
   - Monitorear con `EXPLAIN` queries importantes

3. **Procedimientos Almacenados**:
   - Son opcionales pero útiles para operaciones frecuentes
   - Pueden ser más eficientes que queries desde la aplicación
   - Considerar para reportes y estadísticas

4. **Backup**:
   - Para backup real de producción, usar `mysqldump`
   - Los procedimientos de backup en 04-cleanup-reset.sql son para testing

5. **Seeds**:
   - Los seeds TypeScript son más flexibles que SQL
   - Permiten usar lógica de negocio y validaciones
   - Respetan patrones de diseño del proyecto

---

## 🔗 Referencias

- [TypeORM Documentation](https://typeorm.io/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [NestJS Database](https://docs.nestjs.com/techniques/database)

---

**Última actualización**: Enero 2025
**Versión**: 1.0.0
**Mantenedor**: Equipo de Desarrollo - Los Atuendos