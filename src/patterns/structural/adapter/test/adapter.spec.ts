/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Test, TestingModule } from '@nestjs/testing';
import { AdaptadorBDRelacional } from '../adapters/adaptador-bd-relacional.adapter';
import { AdapterService } from '../services/adapter-service';
import { Connection } from '../adapters/connection';
import { ConnectionPool } from '../adapters/connection-pool';
import { BaseDatos } from '../adapters/base-datos';
import { ConfiguracionConexion } from '../interfaces/persistencia.interface';

describe('Adapter Pattern - Sistema Los Atuendos', () => {
  let adapterService: AdapterService;
  let adaptadorBD: AdaptadorBDRelacional;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdapterService, AdaptadorBDRelacional],
    }).compile();

    adapterService = module.get<AdapterService>(AdapterService);
    adaptadorBD = new AdaptadorBDRelacional();
  });

  describe('AdaptadorBDRelacional', () => {
    it('should be defined', () => {
      expect(adaptadorBD).toBeDefined();
    });

    it('should connect and disconnect successfully', async () => {
      const conectado = await adaptadorBD.conectar();
      expect(conectado).toBe(true);

      const verificacion = await adaptadorBD.verificarConexion();
      expect(verificacion).toBe(true);

      const desconectado = await adaptadorBD.desconectar();
      expect(desconectado).toBe(true);
    });

    it('should handle prenda persistence correctly', async () => {
      await adaptadorBD.conectar();

      const prendaEjemplo = {
        referencia: 'TEST001',
        color: 'Rojo',
        marca: 'Test Brand',
        talla: 'M',
        valorAlquiler: 200000,
        tipo: 'vestido_dama',
        tienePedreria: false,
        esLargo: true,
      };

      // Guardar prenda
      const guardado = await adaptadorBD.guardarNuevaPrenda(prendaEjemplo);
      expect(guardado).toBe(true);

      // Buscar prenda por referencia
      const prendaEncontrada =
        await adaptadorBD.buscarPrendaPorReferencia('TEST001');
      expect(prendaEncontrada).toBeDefined();
      expect(prendaEncontrada.referencia).toBe('TEST001');

      // Actualizar estado
      const actualizado = await adaptadorBD.actualizarEstadoPrenda(
        'TEST001',
        'alquilado',
      );
      expect(actualizado).toBe(true);

      // Buscar prendas por talla
      const prendasTallaM = await adaptadorBD.buscarPrendasPorTalla('M');
      expect(prendasTallaM).toBeDefined();
      expect(prendasTallaM.length).toBeGreaterThan(0);

      // Eliminar prenda
      const eliminado = await adaptadorBD.eliminarPrenda('TEST001');
      expect(eliminado).toBe(true);

      await adaptadorBD.desconectar();
    });

    it('should handle transactions correctly', async () => {
      await adaptadorBD.conectar();

      // Iniciar transacción
      const transaccionId = await adaptadorBD.iniciarTransaccion();
      expect(transaccionId).toBeDefined();
      expect(typeof transaccionId).toBe('string');

      // Confirmar transacción
      const confirmado = await adaptadorBD.confirmarTransaccion(transaccionId);
      expect(confirmado).toBe(true);

      await adaptadorBD.desconectar();
    });

    it('should handle rollback correctly', async () => {
      await adaptadorBD.conectar();

      const transaccionId = await adaptadorBD.iniciarTransaccion();

      // Deshacer transacción
      const deshecho = await adaptadorBD.deshacerTransaccion(transaccionId);
      expect(deshecho).toBe(true);

      await adaptadorBD.desconectar();
    });

    it('should search disponible prendas', async () => {
      await adaptadorBD.conectar();

      const prendasDisponibles = await adaptadorBD.buscarPrendasDisponibles();
      expect(Array.isArray(prendasDisponibles)).toBe(true);

      await adaptadorBD.desconectar();
    });

    it('should get connection statistics', async () => {
      await adaptadorBD.conectar();

      const estadisticas = await adaptadorBD.obtenerEstadisticasConexion();
      expect(estadisticas).toBeDefined();
      expect(estadisticas.baseDatos).toBeDefined();

      await adaptadorBD.desconectar();
    });
  });

  describe('Connection', () => {
    let connection: Connection;
    let configuracion: ConfiguracionConexion;

    beforeEach(() => {
      configuracion = {
        tipo: 'mysql',
        servidor: 'localhost',
        puerto: 3306,
        baseDatos: 'test_db',
        usuario: 'test',
        contrasena: 'test',
      };
      connection = new Connection(configuracion);
    });

    it('should create connection with configuration', () => {
      expect(connection).toBeDefined();
      expect(connection.estaActiva()).toBe(false);
      expect(connection.getId()).toBeDefined();
    });

    it('should open and close connection', async () => {
      const abierta = await connection.abrir();
      expect(abierta).toBe(true);
      expect(connection.estaActiva()).toBe(true);

      const cerrada = await connection.cerrar();
      expect(cerrada).toBe(true);
      expect(connection.estaActiva()).toBe(false);
    });

    it('should execute queries when active', async () => {
      await connection.abrir();

      const resultado = await connection.ejecutarConsulta(
        'SELECT * FROM prendas',
      );
      expect(resultado).toBeDefined();
      expect(resultado.resultado).toBe('ok');

      await connection.cerrar();
    });

    it('should throw error when executing query on inactive connection', async () => {
      await expect(
        connection.ejecutarConsulta('SELECT * FROM prendas'),
      ).rejects.toThrow('Conexión no activa');
    });

    it('should track statistics', async () => {
      await connection.abrir();

      await connection.ejecutarConsulta('SELECT * FROM prendas');
      await connection.ejecutarConsulta('SELECT * FROM clientes');

      const stats = connection.getEstadisticas();
      expect(stats.activa).toBe(true);
      expect(stats.consultas).toBe(2);
      expect(stats.ultimaActividad).toBeDefined();

      await connection.cerrar();
    });

    it('should get configuration', () => {
      const config = connection.getConfiguracion();
      expect(config).toEqual(configuracion);
    });
  });

  describe('ConnectionPool', () => {
    let pool: ConnectionPool;
    let configuracion: ConfiguracionConexion;

    beforeEach(() => {
      configuracion = {
        tipo: 'mysql',
        servidor: 'localhost',
        puerto: 3306,
        baseDatos: 'test_db',
        usuario: 'test',
        contrasena: 'test',
        configuracionPool: {
          min: 2,
          max: 5,
          timeoutConexion: 5000,
          timeoutInactividad: 30000,
        },
      };
      pool = new ConnectionPool(configuracion);
    });

    it('should initialize with minimum connections', async () => {
      await pool.inicializar();

      const stats = pool.getEstadisticas();
      expect(stats.disponibles).toBe(2);
      expect(stats.total).toBe(2);

      await pool.cerrarTodas();
    });

    it('should obtain and release connections', async () => {
      await pool.inicializar();

      const conexion1 = await pool.obtenerConexion();
      expect(conexion1).toBeDefined();

      let stats = pool.getEstadisticas();
      expect(stats.activas).toBe(1);
      expect(stats.disponibles).toBe(1);

      pool.liberarConexion(conexion1);

      stats = pool.getEstadisticas();
      expect(stats.activas).toBe(0);
      expect(stats.disponibles).toBe(2);

      await pool.cerrarTodas();
    });

    it('should create new connections when needed', async () => {
      await pool.inicializar();

      const conexion1 = await pool.obtenerConexion();
      const conexion2 = await pool.obtenerConexion();
      const conexion3 = await pool.obtenerConexion();

      const stats = pool.getEstadisticas();
      expect(stats.activas).toBe(3);
      expect(stats.total).toBe(3);

      pool.liberarConexion(conexion1);
      pool.liberarConexion(conexion2);
      pool.liberarConexion(conexion3);

      await pool.cerrarTodas();
    });

    it('should throw error when pool is at maximum capacity', async () => {
      await pool.inicializar();

      // Obtain all maximum connections
      const conexiones: Connection[] = [];
      for (let i = 0; i < 5; i++) {
        const conn = await pool.obtenerConexion();
        conexiones.push(conn);
      }

      // Try to get one more
      await expect(pool.obtenerConexion()).rejects.toThrow(
        'No hay conexiones disponibles',
      );

      // Clean up
      conexiones.forEach((conn) => pool.liberarConexion(conn));
      await pool.cerrarTodas();
    });

    it('should clean up inactive connections', async () => {
      await pool.inicializar();

      const eliminadas = await pool.limpiarConexionesInactivas(0);
      expect(typeof eliminadas).toBe('number');

      const stats = pool.getEstadisticas();
      expect(stats.disponibles).toBeGreaterThanOrEqual(2); // Should maintain minimum

      await pool.cerrarTodas();
    });

    it('should get statistics', async () => {
      await pool.inicializar();

      const stats = pool.getEstadisticas();
      expect(stats.disponibles).toBeDefined();
      expect(stats.activas).toBeDefined();
      expect(stats.total).toBeDefined();
      expect(stats.minimo).toBe(2);
      expect(stats.maximo).toBe(5);

      await pool.cerrarTodas();
    });
  });

  describe('BaseDatos', () => {
    let baseDatos: BaseDatos;
    let configuracion: ConfiguracionConexion;

    beforeEach(() => {
      baseDatos = new BaseDatos();
      configuracion = {
        tipo: 'mysql',
        servidor: 'localhost',
        puerto: 3306,
        baseDatos: 'test_db',
        usuario: 'test',
        contrasena: 'test',
      };
    });

    it('should open and close connection', () => {
      const abierta = baseDatos.abrirConexion(configuracion);
      expect(abierta).toBe(true);
      expect(baseDatos.estaConectado()).toBe(true);

      const cerrada = baseDatos.cerrarConexion();
      expect(cerrada).toBe(true);
      expect(baseDatos.estaConectado()).toBe(false);
    });

    it('should insert and select records', () => {
      baseDatos.abrirConexion(configuracion);

      const registro = {
        referencia: 'TEST001',
        color: 'Azul',
        marca: 'Test',
        talla: 'L',
      };

      const insertado = baseDatos.insertarRegistro('prendas', registro);
      expect(insertado).toBe(true);

      const encontrado = baseDatos.seleccionarPorId('prendas', 'TEST001');
      expect(encontrado).toBeDefined();
      expect(encontrado.referencia).toBe('TEST001');

      baseDatos.cerrarConexion();
    });

    it('should select all records', () => {
      baseDatos.abrirConexion(configuracion);

      baseDatos.insertarRegistro('prendas', {
        referencia: 'TEST001',
        talla: 'M',
      });
      baseDatos.insertarRegistro('prendas', {
        referencia: 'TEST002',
        talla: 'L',
      });

      const todos = baseDatos.seleccionarTodos('prendas');
      expect(Array.isArray(todos)).toBe(true);
      expect(todos.length).toBeGreaterThanOrEqual(2);

      baseDatos.cerrarConexion();
    });

    it('should select by field', () => {
      baseDatos.abrirConexion(configuracion);

      baseDatos.insertarRegistro('prendas', {
        referencia: 'TEST001',
        talla: 'M',
      });
      baseDatos.insertarRegistro('prendas', {
        referencia: 'TEST002',
        talla: 'M',
      });
      baseDatos.insertarRegistro('prendas', {
        referencia: 'TEST003',
        talla: 'L',
      });

      const tallaM = baseDatos.seleccionarPorCampo('prendas', 'talla', 'M');
      expect(tallaM.length).toBe(2);

      baseDatos.cerrarConexion();
    });

    it('should update records', () => {
      baseDatos.abrirConexion(configuracion);

      baseDatos.insertarRegistro('prendas', {
        referencia: 'TEST001',
        talla: 'M',
        color: 'Rojo',
      });

      const actualizado = baseDatos.actualizarRegistro('prendas', 'TEST001', {
        color: 'Azul',
      });
      expect(actualizado).toBe(true);

      const registro = baseDatos.seleccionarPorId('prendas', 'TEST001');
      expect(registro.color).toBe('Azul');

      baseDatos.cerrarConexion();
    });

    it('should delete records', () => {
      baseDatos.abrirConexion(configuracion);

      baseDatos.insertarRegistro('prendas', { referencia: 'TEST001' });

      const eliminado = baseDatos.eliminarRegistro('prendas', 'TEST001');
      expect(eliminado).toBe(true);

      const buscado = baseDatos.seleccionarPorId('prendas', 'TEST001');
      expect(buscado).toBeNull();

      baseDatos.cerrarConexion();
    });

    it('should handle transactions', () => {
      baseDatos.abrirConexion(configuracion);

      const transaccionId = baseDatos.comenzarTransaccion();
      expect(transaccionId).toBeDefined();
      expect(typeof transaccionId).toBe('string');

      const committed = baseDatos.commitTransaccion(transaccionId);
      expect(committed).toBe(true);

      baseDatos.cerrarConexion();
    });

    it('should handle rollback', () => {
      baseDatos.abrirConexion(configuracion);

      const transaccionId = baseDatos.comenzarTransaccion();

      const rolledBack = baseDatos.rollbackTransaccion(transaccionId);
      expect(rolledBack).toBe(true);

      baseDatos.cerrarConexion();
    });

    it('should get statistics', () => {
      baseDatos.abrirConexion(configuracion);

      const stats = baseDatos.obtenerEstadisticas();
      expect(stats).toBeDefined();
      expect(stats.conectado).toBe(true);
      expect(stats.totalTablas).toBeGreaterThan(0);

      baseDatos.cerrarConexion();
    });
  });

  describe('AdapterService', () => {
    it('should be defined', () => {
      expect(adapterService).toBeDefined();
    });

    it('should initialize connection', async () => {
      const resultado = await adapterService.inicializarConexion();
      expect(resultado.exito).toBe(true);
      expect(resultado.datos).toBe(true);

      await adapterService.cerrarConexion();
    });

    it('should verify connection state', async () => {
      await adapterService.inicializarConexion();

      const estado = await adapterService.verificarEstadoConexion();
      expect(estado.exito).toBe(true);
      expect(estado.datos).toBe(true);

      await adapterService.cerrarConexion();
    });

    it('should register prenda', async () => {
      await adapterService.inicializarConexion();

      const prenda = {
        referencia: 'SVC001',
        color: 'Verde',
        marca: 'Service Test',
        talla: 'M',
        valorAlquiler: 150000,
      };

      const resultado = await adapterService.registrarPrenda(prenda);
      expect(resultado.exito).toBe(true);
      expect(resultado.datos).toBe('SVC001');

      await adapterService.cerrarConexion();
    });

    it('should query prenda by referencia', async () => {
      await adapterService.inicializarConexion();

      const prenda = {
        referencia: 'SVC002',
        color: 'Amarillo',
        marca: 'Query Test',
        talla: 'S',
        valorAlquiler: 120000,
      };

      await adapterService.registrarPrenda(prenda);

      const resultado =
        await adapterService.consultarPrendaPorReferencia('SVC002');
      expect(resultado.exito).toBe(true);
      expect(resultado.datos).toBeDefined();
      expect(resultado.datos.referencia).toBe('SVC002');

      await adapterService.cerrarConexion();
    });

    it('should query prendas by talla', async () => {
      await adapterService.inicializarConexion();

      await adapterService.registrarPrenda({
        referencia: 'SVC003',
        talla: 'XL',
        valorAlquiler: 100000,
      });

      const resultado = await adapterService.consultarPrendasPorTalla('XL');
      expect(resultado.exito).toBe(true);
      expect(Array.isArray(resultado.datos)).toBe(true);

      await adapterService.cerrarConexion();
    });

    it('should update prenda state', async () => {
      await adapterService.inicializarConexion();

      await adapterService.registrarPrenda({
        referencia: 'SVC004',
        valorAlquiler: 100000,
      });

      const resultado = await adapterService.actualizarEstadoPrenda(
        'SVC004',
        'alquilado',
      );
      expect(resultado.exito).toBe(true);
      expect(resultado.datos).toBe(true);

      await adapterService.cerrarConexion();
    });

    it('should delete prenda', async () => {
      await adapterService.inicializarConexion();

      await adapterService.registrarPrenda({
        referencia: 'SVC005',
        valorAlquiler: 100000,
      });

      const resultado = await adapterService.eliminarPrenda('SVC005');
      expect(resultado.exito).toBe(true);
      expect(resultado.datos).toBe(true);

      await adapterService.cerrarConexion();
    });

    it('should list all prendas', async () => {
      await adapterService.inicializarConexion();

      const resultado = await adapterService.listarTodasLasPrendas();
      expect(resultado.exito).toBe(true);
      expect(Array.isArray(resultado.datos)).toBe(true);

      await adapterService.cerrarConexion();
    });

    it('should get system statistics', async () => {
      await adapterService.inicializarConexion();

      const resultado = await adapterService.obtenerEstadisticasSistema();
      expect(resultado.exito).toBe(true);
      expect(resultado.datos).toBeDefined();

      await adapterService.cerrarConexion();
    });

    it('should register multiple prendas in transaction', async () => {
      await adapterService.inicializarConexion();

      const prendas = [
        { referencia: 'BATCH001', valorAlquiler: 100000 },
        { referencia: 'BATCH002', valorAlquiler: 150000 },
        { referencia: 'BATCH003', valorAlquiler: 200000 },
      ];

      const resultado = await adapterService.registrarMultiplesPrendas(prendas);
      expect(resultado.exito).toBe(true);
      expect(resultado.datos?.length).toBe(3);

      await adapterService.cerrarConexion();
    });
  });
});
