-- ================================================
-- Script de Índices Optimizados
-- Proyecto: Los Atuendos
-- Propósito: Mejorar el rendimiento de consultas frecuentes
-- ================================================

USE los_atuendos;

-- ================================================
-- NOTA IMPORTANTE:
-- TypeORM crea automáticamente índices para:
-- - Primary Keys (id)
-- - Foreign Keys (relaciones)
-- - Campos marcados con @Index() o { unique: true }
--
-- Este script agrega índices adicionales para
-- consultas específicas que no son manejadas por TypeORM
-- ================================================

-- ================================================
-- 1. ÍNDICES PARA TABLA PRENDAS
-- ================================================

-- Índice compuesto para búsquedas frecuentes de prendas disponibles
-- Mejora: SELECT * FROM prendas WHERE disponible = TRUE AND estado = 'disponible'
CREATE INDEX IF NOT EXISTS idx_prendas_disponible_estado
    ON prendas(disponible, estado);

-- Índice compuesto para búsquedas por tipo y talla
-- Mejora: SELECT * FROM prendas WHERE tipo = 'VestidoDama' AND talla = 'M'
CREATE INDEX IF NOT EXISTS idx_prendas_tipo_talla
    ON prendas(tipo, talla);

-- Índice para búsquedas por rango de precio
-- Mejora: SELECT * FROM prendas WHERE valorAlquiler BETWEEN 100000 AND 200000
CREATE INDEX IF NOT EXISTS idx_prendas_valor_alquiler
    ON prendas(valorAlquiler);

-- Índice para ordenamiento por fecha de creación
-- Mejora: SELECT * FROM prendas ORDER BY createdAt DESC
CREATE INDEX IF NOT EXISTS idx_prendas_created_at
    ON prendas(createdAt DESC);

-- Índice compuesto para búsquedas avanzadas
-- Mejora consultas complejas con múltiples filtros
CREATE INDEX IF NOT EXISTS idx_prendas_busqueda_completa
    ON prendas(tipo, talla, disponible, estado, valorAlquiler);

SELECT '✅ Índices de PRENDAS creados' AS Status;

-- ================================================
-- 2. ÍNDICES PARA TABLA CLIENTES
-- ================================================

-- Índice para búsquedas por nombre completo
-- Mejora: SELECT * FROM clientes WHERE nombre LIKE '%Juan%' OR apellido LIKE '%Juan%'
CREATE INDEX IF NOT EXISTS idx_clientes_nombre_apellido
    ON clientes(nombre, apellido);

-- Índice para búsquedas por teléfono
-- Mejora: SELECT * FROM clientes WHERE telefono = '3001234567'
CREATE INDEX IF NOT EXISTS idx_clientes_telefono
    ON clientes(telefono);

-- Índice para ordenamiento por fecha de registro
-- Mejora: SELECT * FROM clientes ORDER BY createdAt DESC
CREATE INDEX IF NOT EXISTS idx_clientes_created_at
    ON clientes(createdAt DESC);

SELECT '✅ Índices de CLIENTES creados' AS Status;

-- ================================================
-- 3. ÍNDICES PARA TABLA EMPLEADOS
-- ================================================

-- Índice para búsquedas por cargo
-- Mejora: SELECT * FROM empleados WHERE cargo = 'Asesor de Ventas'
CREATE INDEX IF NOT EXISTS idx_empleados_cargo
    ON empleados(cargo);

-- Índice para búsquedas por nombre
-- Mejora: SELECT * FROM empleados WHERE nombre LIKE '%María%'
CREATE INDEX IF NOT EXISTS idx_empleados_nombre_apellido
    ON empleados(nombre, apellido);

-- Índice para ordenamiento por fecha de contratación
-- Mejora: SELECT * FROM empleados ORDER BY fechaContratacion DESC
CREATE INDEX IF NOT EXISTS idx_empleados_fecha_contratacion
    ON empleados(fechaContratacion DESC);

SELECT '✅ Índices de EMPLEADOS creados' AS Status;

-- ================================================
-- 4. ÍNDICES PARA TABLA SERVICIOS_ALQUILER
-- ================================================

-- Índice compuesto para búsquedas por estado y fecha
-- Mejora: SELECT * FROM servicios_alquiler WHERE estado = 'activo' ORDER BY fechaAlquiler
CREATE INDEX IF NOT EXISTS idx_servicios_estado_fecha
    ON servicios_alquiler(estado, fechaAlquiler DESC);

-- Índice para búsquedas por rango de fechas
-- Mejora: SELECT * FROM servicios_alquiler WHERE fechaAlquiler BETWEEN '2025-01-01' AND '2025-01-31'
CREATE INDEX IF NOT EXISTS idx_servicios_fecha_alquiler
    ON servicios_alquiler(fechaAlquiler);

-- Índice para cálculos de totales
-- Mejora: SELECT SUM(valorTotal) FROM servicios_alquiler WHERE estado = 'completado'
CREATE INDEX IF NOT EXISTS idx_servicios_valor_estado
    ON servicios_alquiler(valorTotal, estado);

-- Índice compuesto para reportes
-- Mejora consultas complejas de reportes
CREATE INDEX IF NOT EXISTS idx_servicios_reporte
    ON servicios_alquiler(fechaAlquiler, estado, valorTotal);

SELECT '✅ Índices de SERVICIOS_ALQUILER creados' AS Status;

-- ================================================
-- 5. ÍNDICES PARA TABLA ITEMS_LAVANDERIA
-- ================================================

-- Índice compuesto para cola de lavandería
-- Mejora: SELECT * FROM items_lavanderia WHERE estado = 'pendiente' ORDER BY prioridad DESC
CREATE INDEX IF NOT EXISTS idx_lavanderia_estado_prioridad
    ON items_lavanderia(estado, prioridad DESC);

-- Índice para búsquedas urgentes
-- Mejora: SELECT * FROM items_lavanderia WHERE requiereUrgente = TRUE
CREATE INDEX IF NOT EXISTS idx_lavanderia_urgente
    ON items_lavanderia(requiereUrgente, prioridad DESC);

-- Índice para búsquedas por fecha de registro
-- Mejora: SELECT * FROM items_lavanderia ORDER BY fechaRegistro DESC
CREATE INDEX IF NOT EXISTS idx_lavanderia_fecha_registro
    ON items_lavanderia(fechaRegistro DESC);

-- Índice compuesto para filtros complejos
-- Mejora consultas con múltiples condiciones
CREATE INDEX IF NOT EXISTS idx_lavanderia_completo
    ON items_lavanderia(estado, prioridad DESC, requiereUrgente, fechaRegistro);

SELECT '✅ Índices de ITEMS_LAVANDERIA creados' AS Status;

-- ================================================
-- 6. ÍNDICES PARA TABLA SERVICIOS_PRENDAS (Join Table)
-- ================================================

-- Índice para búsquedas por servicio
-- Mejora: SELECT * FROM servicios_prendas WHERE servicio_id = 1
-- NOTA: Este índice puede ser creado automáticamente por la FK
CREATE INDEX IF NOT EXISTS idx_servicios_prendas_servicio
    ON servicios_prendas(servicio_id);

-- Índice para búsquedas inversas (prendas en servicios)
-- Mejora: SELECT * FROM servicios_prendas WHERE prenda_id = 1
CREATE INDEX IF NOT EXISTS idx_servicios_prendas_prenda
    ON servicios_prendas(prenda_id);

-- Índice compuesto para consultas bidireccionales
-- Mejora JOIN queries
CREATE INDEX IF NOT EXISTS idx_servicios_prendas_compuesto
    ON servicios_prendas(servicio_id, prenda_id);

SELECT '✅ Índices de SERVICIOS_PRENDAS creados' AS Status;

-- ================================================
-- 7. VERIFICAR ÍNDICES CREADOS
-- ================================================

-- Consulta para ver todos los índices del sistema
SELECT
    TABLE_NAME AS Tabla,
    INDEX_NAME AS Indice,
    COLUMN_NAME AS Columna,
    SEQ_IN_INDEX AS Orden,
    INDEX_TYPE AS Tipo,
    CASE NON_UNIQUE
        WHEN 0 THEN 'ÚNICO'
        ELSE 'NO ÚNICO'
    END AS Unicidad
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'los_atuendos'
    AND INDEX_NAME NOT IN ('PRIMARY')
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- ================================================
-- 8. ESTADÍSTICAS DE ÍNDICES
-- ================================================

SELECT
    TABLE_NAME AS Tabla,
    COUNT(DISTINCT INDEX_NAME) AS TotalIndices,
    SUM(CASE WHEN NON_UNIQUE = 0 THEN 1 ELSE 0 END) AS IndicesUnicos,
    SUM(CASE WHEN NON_UNIQUE = 1 THEN 1 ELSE 0 END) AS IndicesNoUnicos
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'los_atuendos'
    AND INDEX_NAME != 'PRIMARY'
GROUP BY TABLE_NAME
ORDER BY TotalIndices DESC;

-- ================================================
-- MENSAJES FINALES
-- ================================================

SELECT '✅ TODOS LOS ÍNDICES CREADOS EXITOSAMENTE' AS Status;

-- ================================================
-- NOTAS DE RENDIMIENTO:
-- ================================================

/*
ÍNDICES CREADOS Y SU PROPÓSITO:

PRENDAS (5 índices):
- Búsquedas de prendas disponibles
- Filtros por tipo y talla
- Rangos de precio
- Ordenamiento por fecha
- Búsquedas complejas

CLIENTES (3 índices):
- Búsquedas por nombre
- Búsquedas por teléfono
- Ordenamiento por registro

EMPLEADOS (3 índices):
- Filtros por cargo
- Búsquedas por nombre
- Ordenamiento por contratación

SERVICIOS_ALQUILER (4 índices):
- Filtros por estado
- Rangos de fechas
- Cálculos de totales
- Reportes complejos

ITEMS_LAVANDERIA (4 índices):
- Cola por prioridad
- Items urgentes
- Ordenamiento temporal
- Filtros complejos

SERVICIOS_PRENDAS (3 índices):
- Búsquedas por servicio
- Búsquedas por prenda
- JOINs optimizados

TOTAL: ~22 índices adicionales para optimización

RECOMENDACIONES:
1. Monitorear uso de índices con EXPLAIN
2. Eliminar índices no utilizados
3. Considerar índices compuestos para consultas frecuentes
4. Revisar estadísticas periódicamente
5. Optimizar según patrones de uso real
*/