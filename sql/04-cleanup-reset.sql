-- ================================================
-- Scripts de Limpieza y Reset de Datos
-- Proyecto: Los Atuendos
-- ¡ADVERTENCIA! Estos scripts eliminan datos
-- ================================================

USE los_atuendos;

-- ================================================
-- OPCIÓN 1: LIMPIEZA COMPLETA DE TODAS LAS TABLAS
-- ================================================
-- Este script elimina TODOS los datos de todas las tablas
-- Útil para reset completo antes de ejecutar seeds

DROP PROCEDURE IF EXISTS sp_limpiar_todas_tablas;

DELIMITER $$

CREATE PROCEDURE sp_limpiar_todas_tablas()
BEGIN
    -- Deshabilitar checks de FK temporalmente
    SET FOREIGN_KEY_CHECKS = 0;

    -- Eliminar datos en orden inverso de dependencias
    TRUNCATE TABLE servicios_prendas;
    TRUNCATE TABLE items_lavanderia;
    TRUNCATE TABLE servicios_alquiler;
    TRUNCATE TABLE consecutivos;
    TRUNCATE TABLE prendas;
    TRUNCATE TABLE clientes;
    TRUNCATE TABLE empleados;

    -- Rehabilitar checks de FK
    SET FOREIGN_KEY_CHECKS = 1;

    SELECT '✅ Todas las tablas han sido limpiadas' AS Status;
END$$

DELIMITER ;

-- Uso: CALL sp_limpiar_todas_tablas();

-- ================================================
-- OPCIÓN 2: LIMPIEZA SELECTIVA POR TABLA
-- ================================================

DROP PROCEDURE IF EXISTS sp_limpiar_tabla;

DELIMITER $$

CREATE PROCEDURE sp_limpiar_tabla(IN p_tabla VARCHAR(100))
BEGIN
    DECLARE v_sql TEXT;

    SET FOREIGN_KEY_CHECKS = 0;

    SET @sql = CONCAT('TRUNCATE TABLE ', p_tabla);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    SET FOREIGN_KEY_CHECKS = 1;

    SELECT CONCAT('✅ Tabla ', p_tabla, ' limpiada') AS Status;
END$$

DELIMITER ;

-- Uso:
-- CALL sp_limpiar_tabla('clientes');
-- CALL sp_limpiar_tabla('prendas');

-- ================================================
-- OPCIÓN 3: ELIMINAR DATOS DE PRUEBA/TESTING
-- ================================================

DROP PROCEDURE IF EXISTS sp_limpiar_datos_prueba;

DELIMITER $$

CREATE PROCEDURE sp_limpiar_datos_prueba()
BEGIN
    DECLARE v_affected_rows INT DEFAULT 0;

    -- Eliminar servicios con observaciones de prueba
    DELETE sp FROM servicios_prendas sp
    INNER JOIN servicios_alquiler s ON sp.servicio_id = s.id
    WHERE s.observaciones LIKE '%test%'
       OR s.observaciones LIKE '%prueba%'
       OR s.observaciones LIKE '%testing%';

    DELETE FROM servicios_alquiler
    WHERE observaciones LIKE '%test%'
       OR observaciones LIKE '%prueba%'
       OR observaciones LIKE '%testing%';

    SET v_affected_rows = v_affected_rows + ROW_COUNT();

    -- Eliminar items de lavandería de prueba
    DELETE FROM items_lavanderia
    WHERE observaciones LIKE '%test%'
       OR observaciones LIKE '%prueba%';

    SET v_affected_rows = v_affected_rows + ROW_COUNT();

    -- Eliminar prendas de prueba (por referencia)
    DELETE FROM prendas
    WHERE referencia LIKE '%-TEST-%'
       OR referencia LIKE 'TEST-%'
       OR referencia LIKE '%PRUEBA%';

    SET v_affected_rows = v_affected_rows + ROW_COUNT();

    -- Eliminar clientes de prueba (por email)
    DELETE FROM clientes
    WHERE email LIKE '%test.com'
       OR email LIKE '%prueba.com'
       OR email LIKE '%@test%';

    SET v_affected_rows = v_affected_rows + ROW_COUNT();

    -- Eliminar empleados de prueba
    DELETE FROM empleados
    WHERE email LIKE '%test.com'
       OR email LIKE '%prueba.com'
       OR email LIKE '%@test%';

    SET v_affected_rows = v_affected_rows + ROW_COUNT();

    SELECT
        '✅ Datos de prueba eliminados' AS Status,
        v_affected_rows AS RegistrosEliminados;
END$$

DELIMITER ;

-- Uso: CALL sp_limpiar_datos_prueba();

-- ================================================
-- OPCIÓN 4: RESET COMPLETO (Limpieza + Seeds)
-- ================================================

DROP PROCEDURE IF EXISTS sp_reset_completo;

DELIMITER $$

CREATE PROCEDURE sp_reset_completo()
BEGIN
    -- Limpiar todas las tablas
    CALL sp_limpiar_todas_tablas();

    SELECT '⚠️ Base de datos limpiada. Ejecute los seeds desde la aplicación con: npm run seed:complete' AS Mensaje;
END$$

DELIMITER ;

-- Uso: CALL sp_reset_completo();

-- ================================================
-- OPCIÓN 5: ELIMINAR DATOS ANTIGUOS
-- ================================================

DROP PROCEDURE IF EXISTS sp_limpiar_datos_antiguos;

DELIMITER $$

CREATE PROCEDURE sp_limpiar_datos_antiguos(IN p_dias INT)
BEGIN
    DECLARE v_fecha_limite DATE;
    DECLARE v_affected INT DEFAULT 0;

    SET v_fecha_limite = DATE_SUB(CURDATE(), INTERVAL p_dias DAY);

    -- Eliminar servicios antiguos completados
    DELETE sp FROM servicios_prendas sp
    INNER JOIN servicios_alquiler s ON sp.servicio_id = s.id
    WHERE s.estado = 'completado'
      AND s.fechaAlquiler < v_fecha_limite;

    DELETE FROM servicios_alquiler
    WHERE estado = 'completado'
      AND fechaAlquiler < v_fecha_limite;

    SET v_affected = ROW_COUNT();

    -- Eliminar items de lavandería completados antiguos
    DELETE FROM items_lavanderia
    WHERE estado = 'completado'
      AND fechaRegistro < v_fecha_limite;

    SET v_affected = v_affected + ROW_COUNT();

    SELECT
        CONCAT('✅ Datos anteriores a ', v_fecha_limite, ' eliminados') AS Status,
        v_affected AS RegistrosEliminados;
END$$

DELIMITER ;

-- Uso:
-- CALL sp_limpiar_datos_antiguos(90);  -- Eliminar datos de más de 90 días

-- ================================================
-- OPCIÓN 6: ESTADÍSTICAS ANTES DE LIMPIEZA
-- ================================================

DROP PROCEDURE IF EXISTS sp_estadisticas_antes_limpieza;

DELIMITER $$

CREATE PROCEDURE sp_estadisticas_antes_limpieza()
BEGIN
    SELECT '📊 ESTADÍSTICAS ACTUALES' AS Reporte;

    SELECT
        'clientes' AS Tabla,
        COUNT(*) AS TotalRegistros,
        MIN(createdAt) AS PrimerRegistro,
        MAX(createdAt) AS UltimoRegistro
    FROM clientes
    UNION ALL
    SELECT
        'empleados',
        COUNT(*),
        MIN(createdAt),
        MAX(createdAt)
    FROM empleados
    UNION ALL
    SELECT
        'prendas',
        COUNT(*),
        MIN(createdAt),
        MAX(createdAt)
    FROM prendas
    UNION ALL
    SELECT
        'servicios_alquiler',
        COUNT(*),
        MIN(createdAt),
        MAX(createdAt)
    FROM servicios_alquiler
    UNION ALL
    SELECT
        'items_lavanderia',
        COUNT(*),
        MIN(createdAt),
        MAX(createdAt)
    FROM items_lavanderia;
END$$

DELIMITER ;

-- Uso: CALL sp_estadisticas_antes_limpieza();

-- ================================================
-- OPCIÓN 7: BACKUP ANTES DE RESET
-- ================================================

DROP PROCEDURE IF EXISTS sp_crear_backup_tablas;

DELIMITER $$

CREATE PROCEDURE sp_crear_backup_tablas()
BEGIN
    -- Crear tablas de respaldo temporales
    DROP TABLE IF EXISTS backup_clientes;
    DROP TABLE IF EXISTS backup_empleados;
    DROP TABLE IF EXISTS backup_prendas;
    DROP TABLE IF EXISTS backup_servicios;

    CREATE TABLE backup_clientes AS SELECT * FROM clientes;
    CREATE TABLE backup_empleados AS SELECT * FROM empleados;
    CREATE TABLE backup_prendas AS SELECT * FROM prendas;
    CREATE TABLE backup_servicios AS SELECT * FROM servicios_alquiler;

    SELECT '✅ Backup creado en tablas: backup_clientes, backup_empleados, backup_prendas, backup_servicios' AS Status;
END$$

DELIMITER ;

-- Uso: CALL sp_crear_backup_tablas();

-- ================================================
-- OPCIÓN 8: RESTAURAR DESDE BACKUP
-- ================================================

DROP PROCEDURE IF EXISTS sp_restaurar_desde_backup;

DELIMITER $$

CREATE PROCEDURE sp_restaurar_desde_backup()
BEGIN
    SET FOREIGN_KEY_CHECKS = 0;

    -- Verificar que existan las tablas de backup
    IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_clientes') THEN
        TRUNCATE TABLE clientes;
        INSERT INTO clientes SELECT * FROM backup_clientes;
        SELECT '✅ Clientes restaurados' AS Status;
    END IF;

    IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_empleados') THEN
        TRUNCATE TABLE empleados;
        INSERT INTO empleados SELECT * FROM backup_empleados;
        SELECT '✅ Empleados restaurados' AS Status;
    END IF;

    IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_prendas') THEN
        TRUNCATE TABLE prendas;
        INSERT INTO prendas SELECT * FROM backup_prendas;
        SELECT '✅ Prendas restauradas' AS Status;
    END IF;

    IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_servicios') THEN
        TRUNCATE TABLE servicios_alquiler;
        INSERT INTO servicios_alquiler SELECT * FROM backup_servicios;
        SELECT '✅ Servicios restaurados' AS Status;
    END IF;

    SET FOREIGN_KEY_CHECKS = 1;

    SELECT '✅ Restauración completada' AS Status;
END$$

DELIMITER ;

-- Uso: CALL sp_restaurar_desde_backup();

-- ================================================
-- SCRIPTS DIRECTOS DE LIMPIEZA (SIN PROCEDIMIENTOS)
-- ================================================

-- Script 1: Limpieza completa directa
/*
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE servicios_prendas;
TRUNCATE TABLE items_lavanderia;
TRUNCATE TABLE servicios_alquiler;
TRUNCATE TABLE consecutivos;
TRUNCATE TABLE prendas;
TRUNCATE TABLE clientes;
TRUNCATE TABLE empleados;
SET FOREIGN_KEY_CHECKS = 1;
SELECT '✅ Limpieza completa realizada' AS Status;
*/

-- Script 2: Eliminar solo datos de prueba
/*
DELETE FROM prendas WHERE referencia LIKE '%-TEST-%';
DELETE FROM clientes WHERE email LIKE '%@test.com';
DELETE FROM empleados WHERE email LIKE '%@test.com';
SELECT '✅ Datos de prueba eliminados' AS Status;
*/

-- Script 3: Reset de consecutivos
/*
UPDATE consecutivos SET ultimoNumero = 0 WHERE prefijo = 'ALQ';
SELECT '✅ Consecutivos reseteados' AS Status;
*/

-- ================================================
-- MENÚ DE OPCIONES RÁPIDAS
-- ================================================

SELECT '
╔════════════════════════════════════════════════════════╗
║        SCRIPTS DE LIMPIEZA Y RESET DISPONIBLES         ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  1. CALL sp_limpiar_todas_tablas();                   ║
║     → Elimina TODOS los datos de todas las tablas     ║
║                                                        ║
║  2. CALL sp_limpiar_tabla(\'nombre_tabla\');            ║
║     → Elimina datos de una tabla específica           ║
║                                                        ║
║  3. CALL sp_limpiar_datos_prueba();                   ║
║     → Elimina solo datos de prueba/testing            ║
║                                                        ║
║  4. CALL sp_reset_completo();                         ║
║     → Limpieza total + indicación para seeds          ║
║                                                        ║
║  5. CALL sp_limpiar_datos_antiguos(90);               ║
║     → Elimina datos de más de X días                  ║
║                                                        ║
║  6. CALL sp_estadisticas_antes_limpieza();            ║
║     → Ver estadísticas antes de limpiar               ║
║                                                        ║
║  7. CALL sp_crear_backup_tablas();                    ║
║     → Crear backup antes de limpieza                  ║
║                                                        ║
║  8. CALL sp_restaurar_desde_backup();                 ║
║     → Restaurar datos desde backup                    ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
' AS Menu;

-- ================================================
-- CONFIRMACIÓN
-- ================================================

SELECT '✅ Scripts de limpieza y reset cargados exitosamente' AS Status;