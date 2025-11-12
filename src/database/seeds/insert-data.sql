-- Insertar empleados de prueba (ignora si ya existen)
INSERT IGNORE INTO empleados (nombre, numeroIdentificacion, direccion, telefono, cargo, correoElectronico, fechaIngreso, salario) VALUES
('María García López', '12345688', 'Calle 123 #45-67', '3001234567', 'Administradora', 'maria.garcia@losatuendos.com', '2023-01-15', 2500000),
('Carlos Rodríguez Mesa', '87654321', 'Carrera 67 #89-12', '3007654321', 'Vendedor', 'carlos.rodriguez@losatuendos.com', '2023-03-01', 1800000);

-- Insertar clientes de prueba (ignora si ya existen)
INSERT IGNORE INTO clientes (numeroIdentificacion, nombre, direccion, telefono, correoElectronico, fechaNacimiento) VALUES
('1010101010', 'Ana Sofía Martínez', 'Avenida 80 #123-45', '3101234567', 'ana.martinez@email.com', '1990-05-15'),
('2020202020', 'Luis Fernando Gómez', 'Calle 45 #67-89', '3207654321', 'luis.gomez@email.com', '1985-08-22'),
('3030303030', 'Isabella Cruz Vargas', 'Transversal 12 #34-56', '3109876543', 'isabella.cruz@email.com', '1995-12-03');

-- Insertar vestidos de dama (ignora si ya existen)
INSERT IGNORE INTO prendas (referencia, color, marca, talla, valorAlquiler, disponible, estado, tipo, tienePedreria, esLargo, cantidadPiezas, descripcionPiezas) VALUES
('VD001', 'Rojo', 'Elegancia', 'M', 150000, TRUE, 'disponible', 'VestidoDama', TRUE, TRUE, 2, 'Vestido principal + velo'),
('VD002', 'Azul marino', 'Sofisticada', 'S', 120000, TRUE, 'disponible', 'VestidoDama', FALSE, FALSE, 1, NULL);

-- Insertar trajes de caballero (ignora si ya existen)
-- Nota: La columna 'tipo' de TrajeCaballero se guarda en la tabla como tipo discriminador
INSERT IGNORE INTO prendas (referencia, color, marca, talla, valorAlquiler, disponible, estado, tipo, tieneCorbata, tieneCorbtain, tienePlastron) VALUES
('TC001', 'Negro', 'Distinguido', 'L', 100000, TRUE, 'disponible', 'TrajeCaballero', FALSE, TRUE, FALSE),
('TC002', 'Azul oscuro', 'Elegante', 'M', 80000, TRUE, 'disponible', 'TrajeCaballero', TRUE, FALSE, FALSE);

-- Insertar disfraces (ignora si ya existen)
INSERT IGNORE INTO prendas (referencia, color, marca, talla, valorAlquiler, disponible, estado, tipo, nombre, categoria, descripcion, edadRecomendada) VALUES
('DF001', 'Multicolor', 'Fantasía', 'L', 60000, TRUE, 'disponible', 'Disfraz', 'Pirata del Caribe', 'Aventura', 'Disfraz completo de pirata con accesorios', 'Adulto'),
('DF002', 'Rosa', 'Princesas', 'S', 45000, TRUE, 'disponible', 'Disfraz', 'Princesa Medieval', 'Fantasía', 'Hermoso vestido de princesa estilo medieval', 'Niña 8-12 años');

-- Verificar los datos insertados
SELECT 'Empleados insertados:' AS mensaje;
SELECT * FROM empleados;

SELECT 'Clientes insertados:' AS mensaje;
SELECT * FROM clientes;

SELECT 'Prendas insertadas:' AS mensaje;
SELECT * FROM prendas;
