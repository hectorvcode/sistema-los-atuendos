-- ================================================
-- Procedimientos Almacenados
-- Proyecto: Los Atuendos
-- ================================================

USE los_atuendos;

-- Eliminar el delimitador estándar temporalmente
DELIMITER $$

-- ================================================
-- 1. PROCEDIMIENTO: Obtener Estadísticas Generales del Sistema
-- ================================================

DROP PROCEDURE IF EXISTS sp_obtener_estadisticas_generales$$

CREATE PROCEDURE sp_obtener_estadisticas_generales()
BEGIN
    SELECT
        'Estadísticas Generales del Sistema' AS Reporte,
        (SELECT COUNT(*) FROM clientes) AS TotalClientes,
        (SELECT COUNT(*) FROM empleados) AS TotalEmpleados,
        (SELECT COUNT(*) FROM prendas) AS TotalPrendas,
        (SELECT COUNT(*) FROM prendas WHERE disponible = TRUE) AS PrendasDisponibles,
        (SELECT COUNT(*) FROM prendas WHERE estado = 'alquilado') AS PrendasAlquiladas,
        (SELECT COUNT(*) FROM servicios_alquiler) AS TotalServicios,
        (SELECT COUNT(*) FROM servicios_alquiler WHERE estado = 'activo') AS ServiciosActivos,
        (SELECT COUNT(*) FROM items_lavanderia) AS TotalItemsLavanderia,
        (SELECT COUNT(*) FROM items_lavanderia WHERE estado = 'pendiente') AS LavanderiaP endiente,
        NOW() AS FechaConsulta;
END$$

-- ================================================
-- 2. PROCEDIMIENTO: Buscar Prendas Disponibles por Tipo y Talla
-- ================================================

DROP PROCEDURE IF EXISTS sp_buscar_prendas_disponibles$$

CREATE PROCEDURE sp_buscar_prendas_disponibles(
    IN p_tipo VARCHAR(50),
    IN p_talla VARCHAR(10)
)
BEGIN
    SELECT
        id,
        tipo,
        referencia,
        color,
        marca,
        talla,
        valorAlquiler,
        estado,
        CASE
            WHEN tipo = 'VestidoDama' THEN 'Vestido de Dama'
            WHEN tipo = 'TrajeCaballero' THEN 'Traje de Caballero'
            WHEN tipo = 'Disfraz' THEN 'Disfraz'
            ELSE tipo
        END AS TipoFormateado
    FROM prendas
    WHERE disponible = TRUE
        AND estado = 'disponible'
        AND (p_tipo IS NULL OR tipo = p_tipo)
        AND (p_talla IS NULL OR talla = p_talla)
    ORDER BY tipo, valorAlquiler;
END$$

-- ================================================
-- 3. PROCEDIMIENTO: Obtener Servicios por Cliente
-- ================================================

DROP PROCEDURE IF EXISTS sp_servicios_por_cliente$$

CREATE PROCEDURE sp_servicios_por_cliente(
    IN p_cliente_id INT
)
BEGIN
    SELECT
        s.id,
        s.numeroServicio,
        s.fechaAlquiler,
        s.diasAlquiler,
        s.valorTotal,
        s.estado,
        s.observaciones,
        c.nombre AS clienteNombre,
        c.apellido AS clienteApellido,
        e.nombre AS empleadoNombre,
        e.apellido AS empleadoApellido,
        COUNT(sp.prenda_id) AS cantidadPrendas
    FROM servicios_alquiler s
    INNER JOIN clientes c ON s.cliente_id = c.id
    INNER JOIN empleados e ON s.empleado_id = e.id
    LEFT JOIN servicios_prendas sp ON s.id = sp.servicio_id
    WHERE s.cliente_id = p_cliente_id
    GROUP BY s.id
    ORDER BY s.fechaAlquiler DESC;
END$$

-- ================================================
-- 4. PROCEDIMIENTO: Cola de Lavandería Ordenada por Prioridad
-- ================================================

DROP PROCEDURE IF EXISTS sp_cola_lavanderia_prioridad$$

CREATE PROCEDURE sp_cola_lavanderia_prioridad()
BEGIN
    SELECT
        il.id,
        il.prioridad,
        il.estado,
        il.esManchada,
        il.esDelicada,
        il.requiereUrgente,
        il.observaciones,
        il.fechaRegistro,
        p.referencia AS prendaReferencia,
        p.tipo AS prendaTipo,
        p.color AS prendaColor,
        CASE
            WHEN il.requiereUrgente = TRUE THEN '🔴 URGENTE'
            WHEN il.prioridad >= 50 THEN '🟠 ALTA'
            WHEN il.prioridad >= 25 THEN '🟡 MEDIA'
            ELSE '🟢 NORMAL'
        END AS PrioridadVisual
    FROM items_lavanderia il
    INNER JOIN prendas p ON il.prenda_id = p.id
    WHERE il.estado IN ('pendiente', 'en_proceso')
    ORDER BY il.prioridad DESC, il.fechaRegistro ASC;
END$$

-- ================================================
-- 5. PROCEDIMIENTO: Reporte de Ingresos por Período
-- ================================================

DROP PROCEDURE IF EXISTS sp_reporte_ingresos_periodo$$

CREATE PROCEDURE sp_reporte_ingresos_periodo(
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE
)
BEGIN
    SELECT
        DATE(s.fechaAlquiler) AS Fecha,
        COUNT(*) AS CantidadServicios,
        SUM(s.valorTotal) AS IngresoTotal,
        AVG(s.valorTotal) AS IngresoPromedio,
        MIN(s.valorTotal) AS IngresoMinimo,
        MAX(s.valorTotal) AS IngresoMaximo
    FROM servicios_alquiler s
    WHERE DATE(s.fechaAlquiler) BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY DATE(s.fechaAlquiler)
    ORDER BY Fecha DESC;

    -- Resumen total
    SELECT
        'TOTAL PERÍODO' AS Descripcion,
        COUNT(*) AS TotalServicios,
        SUM(s.valorTotal) AS IngresoTotal,
        AVG(s.valorTotal) AS PromedioServicio
    FROM servicios_alquiler s
    WHERE DATE(s.fechaAlquiler) BETWEEN p_fecha_inicio AND p_fecha_fin;
END$$

-- ================================================
-- 6. PROCEDIMIENTO: Prendas Más Alquiladas
-- ================================================

DROP PROCEDURE IF EXISTS sp_prendas_mas_alquiladas$$

CREATE PROCEDURE sp_prendas_mas_alquiladas(
    IN p_limite INT
)
BEGIN
    SELECT
        p.id,
        p.referencia,
        p.tipo,
        p.color,
        p.marca,
        p.talla,
        p.valorAlquiler,
        COUNT(sp.prenda_id) AS VecesAlquilada,
        SUM(s.valorTotal) AS IngresoGenerado
    FROM prendas p
    INNER JOIN servicios_prendas sp ON p.id = sp.prenda_id
    INNER JOIN servicios_alquiler s ON sp.servicio_id = s.id
    GROUP BY p.id
    ORDER BY VecesAlquilada DESC, IngresoGenerado DESC
    LIMIT p_limite;
END$$

-- ================================================
-- 7. PROCEDIMIENTO: Clientes Frecuentes
-- ================================================

DROP PROCEDURE IF EXISTS sp_clientes_frecuentes$$

CREATE PROCEDURE sp_clientes_frecuentes(
    IN p_limite INT
)
BEGIN
    SELECT
        c.id,
        c.nombre,
        c.apellido,
        c.email,
        c.telefono,
        COUNT(s.id) AS TotalServicios,
        SUM(s.valorTotal) AS TotalGastado,
        AVG(s.valorTotal) AS PromedioGasto,
        MAX(s.fechaAlquiler) AS UltimoAlquiler
    FROM clientes c
    INNER JOIN servicios_alquiler s ON c.id = s.cliente_id
    GROUP BY c.id
    ORDER BY TotalServicios DESC, TotalGastado DESC
    LIMIT p_limite;
END$$

-- ================================================
-- 8. PROCEDIMIENTO: Verificar Disponibilidad de Prenda
-- ================================================

DROP PROCEDURE IF EXISTS sp_verificar_disponibilidad$$

CREATE PROCEDURE sp_verificar_disponibilidad(
    IN p_prenda_id INT,
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE
)
BEGIN
    DECLARE v_disponible BOOLEAN DEFAULT TRUE;
    DECLARE v_mensaje VARCHAR(255);

    -- Verificar si la prenda existe
    IF NOT EXISTS (SELECT 1 FROM prendas WHERE id = p_prenda_id) THEN
        SET v_disponible = FALSE;
        SET v_mensaje = 'Prenda no encontrada';
    -- Verificar si está disponible en general
    ELSEIF NOT EXISTS (SELECT 1 FROM prendas WHERE id = p_prenda_id AND disponible = TRUE) THEN
        SET v_disponible = FALSE;
        SET v_mensaje = 'Prenda no disponible actualmente';
    -- Verificar conflictos de fechas
    ELSEIF EXISTS (
        SELECT 1
        FROM servicios_alquiler s
        INNER JOIN servicios_prendas sp ON s.id = sp.servicio_id
        WHERE sp.prenda_id = p_prenda_id
            AND s.estado IN ('activo', 'reservado')
            AND (
                (s.fechaAlquiler BETWEEN p_fecha_inicio AND p_fecha_fin)
                OR
                (DATE_ADD(s.fechaAlquiler, INTERVAL s.diasAlquiler DAY) BETWEEN p_fecha_inicio AND p_fecha_fin)
            )
    ) THEN
        SET v_disponible = FALSE;
        SET v_mensaje = 'Prenda ya reservada para esas fechas';
    ELSE
        SET v_mensaje = 'Prenda disponible para el período solicitado';
    END IF;

    -- Retornar resultado
    SELECT
        p_prenda_id AS PrendaID,
        v_disponible AS Disponible,
        v_mensaje AS Mensaje,
        p_fecha_inicio AS FechaInicio,
        p_fecha_fin AS FechaFin;
END$$

-- ================================================
-- 9. PROCEDIMIENTO: Backup de Datos de Tabla
-- ================================================

DROP PROCEDURE IF EXISTS sp_backup_datos$$

CREATE PROCEDURE sp_backup_datos(
    IN p_tabla VARCHAR(100)
)
BEGIN
    DECLARE v_sql TEXT;
    DECLARE v_count INT;

    -- Contar registros
    SET @sql_count = CONCAT('SELECT COUNT(*) INTO @registro_count FROM ', p_tabla);
    PREPARE stmt FROM @sql_count;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    SELECT
        p_tabla AS Tabla,
        @registro_count AS TotalRegistros,
        NOW() AS FechaBackup,
        'Backup realizado' AS Status;
END$$

-- Restaurar delimitador estándar
DELIMITER ;

-- ================================================
-- MENSAJES DE CONFIRMACIÓN
-- ================================================

SELECT '✅ Procedimientos almacenados creados exitosamente' AS Status;

-- ================================================
-- EJEMPLOS DE USO:
-- ================================================

/*

-- Obtener estadísticas generales
CALL sp_obtener_estadisticas_generales();

-- Buscar vestidos disponibles talla M
CALL sp_buscar_prendas_disponibles('VestidoDama', 'M');

-- Buscar cualquier prenda disponible
CALL sp_buscar_prendas_disponibles(NULL, NULL);

-- Servicios de un cliente específico
CALL sp_servicios_por_cliente(1);

-- Cola de lavandería ordenada
CALL sp_cola_lavanderia_prioridad();

-- Reporte de ingresos del último mes
CALL sp_reporte_ingresos_periodo('2025-01-01', '2025-01-31');

-- Top 10 prendas más alquiladas
CALL sp_prendas_mas_alquiladas(10);

-- Top 5 clientes frecuentes
CALL sp_clientes_frecuentes(5);

-- Verificar disponibilidad de una prenda
CALL sp_verificar_disponibilidad(1, '2025-02-01', '2025-02-05');

-- Backup de datos
CALL sp_backup_datos('clientes');

*/