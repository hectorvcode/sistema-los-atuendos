-- =========================================
-- DIAGNÓSTICO Y FIX DE AUTOINCREMENTO
-- =========================================
USE los_atuendos;

-- 1. DIAGNÓSTICO: Ver registros existentes
SELECT '=== DIAGNÓSTICO ===' as '';
SELECT 'Registros en prendas:' as '';
SELECT * FROM prendas;

SELECT 'Autoincremento actual:' as '';
SELECT
    TABLE_NAME,
    AUTO_INCREMENT
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'los_atuendos'
AND TABLE_NAME = 'prendas';

-- 2. LIMPIEZA COMPLETA
SELECT '=== LIMPIEZA ===' as '';
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM servicios_prendas;
DELETE FROM items_lavanderia;
DELETE FROM servicios_alquiler;
DELETE FROM consecutivos;
DELETE FROM prendas;
DELETE FROM clientes;
DELETE FROM empleados;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Tablas limpiadas' as '';

-- 3. RESETEAR AUTOINCREMENTO
SELECT '=== RESET AUTOINCREMENTO ===' as '';
ALTER TABLE prendas AUTO_INCREMENT = 1;
ALTER TABLE clientes AUTO_INCREMENT = 1;
ALTER TABLE empleados AUTO_INCREMENT = 1;
ALTER TABLE servicios_alquiler AUTO_INCREMENT = 1;
ALTER TABLE items_lavanderia AUTO_INCREMENT = 1;
ALTER TABLE consecutivos AUTO_INCREMENT = 1;

SELECT 'Autoincrementos reseteados' as '';

-- 4. VERIFICACIÓN FINAL
SELECT '=== VERIFICACIÓN FINAL ===' as '';
SELECT 'Conteo de registros:' as '';
SELECT
    'prendas' as tabla,
    COUNT(*) as registros
FROM prendas
UNION ALL
SELECT
    'clientes' as tabla,
    COUNT(*) as registros
FROM clientes
UNION ALL
SELECT
    'empleados' as tabla,
    COUNT(*) as registros
FROM empleados;

SELECT 'Autoincrementos finales:' as '';
SELECT
    TABLE_NAME,
    AUTO_INCREMENT
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'los_atuendos'
AND TABLE_NAME IN ('prendas', 'clientes', 'empleados', 'servicios_alquiler', 'items_lavanderia', 'consecutivos')
ORDER BY TABLE_NAME;

SELECT '=== FIX COMPLETADO ===' as '';