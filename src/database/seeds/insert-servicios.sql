-- Script para insertar servicios de alquiler de demostración
-- Ejecutar DESPUÉS de insert-data.sql

-- Insertar servicios de alquiler usando datos existentes
INSERT INTO servicios_alquiler (
  numero,
  fechaSolicitud,
  fechaAlquiler,
  fechaDevolucion,
  estado,
  observaciones,
  valorTotal,
  cliente_id,
  empleado_id
) VALUES
-- Servicio 1: Cliente Ana con vestido rojo
(
  1,
  '2024-01-15 10:30:00',
  '2024-01-20',
  '2024-01-21',
  'confirmado',
  'Evento: Boda. Cliente solicita velo adicional.',
  150000,
  (SELECT id FROM clientes WHERE numeroIdentificacion = '1010101010'),
  (SELECT id FROM empleados WHERE numeroIdentificacion = '12345678')
),
-- Servicio 2: Cliente Luis con traje negro
(
  2,
  '2024-01-16 14:00:00',
  '2024-01-25',
  '2024-01-26',
  'confirmado',
  'Evento: Cena formal. Requiere ajuste de talla.',
  100000,
  (SELECT id FROM clientes WHERE numeroIdentificacion = '2020202020'),
  (SELECT id FROM empleados WHERE numeroIdentificacion = '87654321')
),
-- Servicio 3: Cliente Isabella con disfraz de princesa
(
  3,
  '2024-01-18 09:00:00',
  '2024-02-01',
  '2024-02-02',
  'confirmado',
  'Evento: Cumpleaños infantil. Incluye accesorios adicionales.',
  45000,
  (SELECT id FROM clientes WHERE numeroIdentificacion = '3030303030'),
  (SELECT id FROM empleados WHERE numeroIdentificacion = '12345678')
);

-- Asociar prendas a los servicios creados
INSERT INTO servicios_prendas (servicio_id, prenda_id) VALUES
-- Servicio 1 con vestido rojo VD001
(
  (SELECT id FROM servicios_alquiler WHERE numero = 1),
  (SELECT id FROM prendas WHERE referencia = 'VD001')
),
-- Servicio 2 con traje negro TC001
(
  (SELECT id FROM servicios_alquiler WHERE numero = 2),
  (SELECT id FROM prendas WHERE referencia = 'TC001')
),
-- Servicio 3 con disfraz DF002
(
  (SELECT id FROM servicios_alquiler WHERE numero = 3),
  (SELECT id FROM prendas WHERE referencia = 'DF002')
);

-- Marcar las prendas como alquiladas
UPDATE prendas SET disponible = FALSE, estado = 'alquilado' WHERE referencia IN ('VD001', 'TC001', 'DF002');

-- Verificar los servicios insertados
SELECT 'Servicios de alquiler insertados:' AS mensaje;
SELECT
  s.id,
  s.numero,
  c.nombre AS cliente,
  e.nombre AS empleado,
  s.fechaAlquiler,
  s.estado,
  s.valorTotal
FROM servicios_alquiler s
JOIN clientes c ON s.cliente_id = c.id
JOIN empleados e ON s.empleado_id = e.id
ORDER BY s.id;

-- Verificar prendas asociadas
SELECT 'Prendas en servicios:' AS mensaje;
SELECT
  s.numero,
  p.referencia,
  p.tipo,
  p.estado
FROM servicios_alquiler s
JOIN servicios_prendas sp ON s.id = sp.servicio_id
JOIN prendas p ON sp.prenda_id = p.id
ORDER BY s.id;
