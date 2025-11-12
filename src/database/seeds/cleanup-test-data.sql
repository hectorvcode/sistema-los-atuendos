-- Script para limpiar datos de prueba de los tests
-- Ejecutar esto en phpMyAdmin si los tests fallan con "Duplicate entry"

-- Limpiar prendas de prueba
DELETE FROM prendas WHERE referencia = 'VD-TEST-001';
DELETE FROM prendas WHERE referencia LIKE 'VD-DEMO-%';
DELETE FROM prendas WHERE referencia LIKE 'TC-DEMO-%';
DELETE FROM prendas WHERE referencia LIKE 'DF-DEMO-%';

-- Limpiar consecutivos de prueba
DELETE FROM consecutivos WHERE tipo = 'TEST';
DELETE FROM consecutivos WHERE tipo = 'CONCURRENT_TEST';
DELETE FROM consecutivos WHERE tipo = 'RESET_TEST';

-- Limpiar servicios de alquiler de prueba (opcional)
-- Primero eliminar de la tabla de relación servicios_prendas
DELETE FROM servicios_prendas
WHERE servicio_id IN (
  SELECT s.id FROM servicios_alquiler s
  JOIN clientes c ON s.cliente_id = c.id
  WHERE c.numeroIdentificacion = '1010101010'
);

-- Luego eliminar los servicios asociados al cliente de prueba
DELETE FROM servicios_alquiler
WHERE cliente_id IN (
  SELECT id FROM clientes WHERE numeroIdentificacion = '1010101010'
);

SELECT 'Datos de prueba limpiados exitosamente' AS mensaje;
