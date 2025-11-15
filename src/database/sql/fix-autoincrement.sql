-- =========================================
-- FIX AUTOINCREMENT - Los Atuendos
-- =========================================
-- Este script corrige problemas de autoincremento
-- en todas las tablas después de limpiar la base de datos
--
-- IMPORTANTE: Ejecutar después de npm run db:reset
-- =========================================

USE los_atuendos;

-- Verificar estado actual de prendas
SELECT 'Estado actual de prendas:' as '';
SELECT COUNT(*) as total_registros FROM prendas;
SELECT MAX(id) as max_id FROM prendas;

-- Verificar autoincremento actual
SELECT
    TABLE_NAME,
    AUTO_INCREMENT
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'los_atuendos'
AND TABLE_NAME = 'prendas';

-- Resetear autoincremento de TODAS las tablas
SET FOREIGN_KEY_CHECKS = 0;

-- Prendas
ALTER TABLE prendas AUTO_INCREMENT = 1;

-- Clientes
ALTER TABLE clientes AUTO_INCREMENT = 1;

-- Empleados
ALTER TABLE empleados AUTO_INCREMENT = 1;

-- Servicios de Alquiler
ALTER TABLE servicios_alquiler AUTO_INCREMENT = 1;

-- Items de Lavandería
ALTER TABLE items_lavanderia AUTO_INCREMENT = 1;

-- Consecutivos
ALTER TABLE consecutivos AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- Verificar corrección
SELECT 'Autoincremento después de fix:' as '';
SELECT
    TABLE_NAME,
    AUTO_INCREMENT
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'los_atuendos'
AND TABLE_NAME IN ('prendas', 'clientes', 'empleados', 'servicios_alquiler', 'items_lavanderia', 'consecutivos')
ORDER BY TABLE_NAME;

SELECT 'Fix completado exitosamente!' as '';