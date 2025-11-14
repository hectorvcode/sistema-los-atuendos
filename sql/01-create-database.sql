-- ================================================
-- Script de Creación de Base de Datos
-- Proyecto: Los Atuendos - Sistema de Alquiler de Vestuario
-- Autor: Equipo de Desarrollo
-- Fecha: Enero 2025
-- Versión: 1.0.0
-- ================================================

-- ================================================
-- 1. CREAR BASE DE DATOS DE DESARROLLO
-- ================================================

-- Eliminar base de datos si existe (¡CUIDADO EN PRODUCCIÓN!)
DROP DATABASE IF EXISTS los_atuendos;

-- Crear base de datos con configuración UTF-8
CREATE DATABASE los_atuendos
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE los_atuendos;

-- Mensaje de confirmación
SELECT '✅ Base de datos los_atuendos creada exitosamente' AS Status;

-- ================================================
-- 2. CREAR BASE DE DATOS DE TESTING
-- ================================================

-- Eliminar base de datos de testing si existe
DROP DATABASE IF EXISTS los_atuendos_test;

-- Crear base de datos de testing
CREATE DATABASE los_atuendos_test
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Mensaje de confirmación
SELECT '✅ Base de datos los_atuendos_test creada exitosamente' AS Status;

-- ================================================
-- 3. CREAR USUARIO (OPCIONAL)
-- ================================================

-- Descomentar si se necesita crear un usuario específico
-- DROP USER IF EXISTS 'los_atuendos_user'@'localhost';
-- CREATE USER 'los_atuendos_user'@'localhost' IDENTIFIED BY 'password_seguro_aqui';
-- GRANT ALL PRIVILEGES ON los_atuendos.* TO 'los_atuendos_user'@'localhost';
-- GRANT ALL PRIVILEGES ON los_atuendos_test.* TO 'los_atuendos_user'@'localhost';
-- FLUSH PRIVILEGES;
-- SELECT '✅ Usuario los_atuendos_user creado exitosamente' AS Status;

-- ================================================
-- 4. INFORMACIÓN DE BASES DE DATOS
-- ================================================

-- Mostrar información de las bases de datos creadas
SELECT
    'DESARROLLO' AS Tipo,
    'los_atuendos' AS Nombre,
    DEFAULT_CHARACTER_SET_NAME AS Charset,
    DEFAULT_COLLATION_NAME AS Collation
FROM INFORMATION_SCHEMA.SCHEMATA
WHERE SCHEMA_NAME = 'los_atuendos'

UNION ALL

SELECT
    'TESTING' AS Tipo,
    'los_atuendos_test' AS Nombre,
    DEFAULT_CHARACTER_SET_NAME AS Charset,
    DEFAULT_COLLATION_NAME AS Collation
FROM INFORMATION_SCHEMA.SCHEMATA
WHERE SCHEMA_NAME = 'los_atuendos_test';

-- ================================================
-- NOTAS:
-- ================================================
-- 1. Este script crea ambas bases de datos (desarrollo y testing)
-- 2. TypeORM se encargará de crear las tablas automáticamente
-- 3. La configuración UTF-8 soporta caracteres especiales y emojis
-- 4. Para producción, considerar crear un usuario específico
-- ================================================