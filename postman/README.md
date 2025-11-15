# Guía de Pruebas con Postman - Los Atuendos API

**Versión:** 1.0.0
**Fecha:** 15 de Noviembre, 2025

---

## Requisitos Previos

1. **Postman instalado** en su computador ([Descargar aquí](https://www.postman.com/downloads/))
2. **Servidor corriendo** - Asegúrese de que el proyecto esté ejecutándose:
   ```bash
   npm run start:dev
   ```
   Debe ver el mensaje: `Nest application successfully started`

---

## Paso 1: Importar Archivos en Postman

### 1.1 Importar la Colección de Requests

1. Abra **Postman**
2. Haga clic en el botón **Import** (esquina superior izquierda)
3. Seleccione el archivo: `postman/Los-Atuendos-API.postman_collection.json`
4. Haga clic en **Import**

### 1.2 Importar el Environment (Variables de Entorno)

1. Haga clic en **Import** nuevamente
2. Seleccione el archivo: `postman/Los-Atuendos-Local.postman_environment.json`
3. Haga clic en **Import**

### 1.3 Activar el Environment

1. En la **esquina superior derecha**, busque el selector de environments
2. Seleccione **"Los Atuendos - Local"** del dropdown
3. Verifique que aparece seleccionado

---

## Paso 2: Ejecutar las Pruebas

### Opción A: Pruebas Manuales (Recomendado para Evaluación)

Ejecute los requests **en este orden** para ver el flujo completo:

#### 1. Verificar que la API está activa

```
Carpeta: Health Check
Request: GET API Health
```

- Haga clic en **Send**
- ✅ Debe responder: `200 OK` con `"success": true`

#### 2. Crear un Cliente

```
Carpeta: Clientes
Request: Crear Cliente
```

- Haga clic en **Send**
- ✅ Debe responder: `201 Created`
- **Nota:** El ID del cliente se guarda automáticamente en `{{clienteId}}`

#### 3. Crear un Empleado

```
Carpeta: Empleados
Request: Crear Empleado
```

- Haga clic en **Send**
- ✅ Debe responder: `201 Created`
- **Nota:** El ID del empleado se guarda automáticamente en `{{empleadoId}}`

#### 4. Crear un Vestido de Dama (Patrón Factory Method)

```
Carpeta: Prendas
Request: Crear Vestido de Dama
```

- Haga clic en **Send**
- ✅ Debe responder: `201 Created` con `"tipo": "vestido-dama"`
- **Nota:** El ID de la prenda se guarda automáticamente en `{{prendaId}}`

#### 5. Crear un Servicio de Alquiler (Patrón Builder + Singleton)

```
Carpeta: Servicios de Alquiler
Request: Crear Servicio de Alquiler (Builder)
```

- Haga clic en **Send**
- ✅ Debe responder: `201 Created` con número consecutivo generado
- **Nota:** Este request usa automáticamente los IDs guardados anteriormente

#### 6. Registrar Prenda en Lavandería (Patrón Decorator)

```
Carpeta: Lavandería
Request: Registrar Prenda para Lavandería (Decorator)
```

- Haga clic en **Send**
- ✅ Debe responder: `201 Created` con prioridad calculada

#### 7. Ver Cola de Lavandería Ordenada por Prioridad

```
Carpeta: Lavandería
Request: Obtener Cola de Lavandería por Prioridad
```

- Haga clic en **Send**
- ✅ Debe responder: `200 OK` con items ordenados

---

### Opción B: Ejecución Automática (Prueba Rápida)

1. Haga clic derecho en la colección **"Los Atuendos - API REST"**
2. Seleccione **"Run collection"**
3. Configure:
   - **Iterations:** 1
   - **Delay:** 500ms (opcional)
4. Haga clic en **"Run Los Atuendos - API REST"**
5. Observe los resultados:
   - ✅ Tests exitosos aparecen en verde
   - ❌ Tests fallidos aparecen en rojo

---

## Paso 3: Verificar Resultados

### Ver Respuestas

Después de cada request, revise:

- **Pestaña Body:** Muestra los datos retornados por la API
- **Pestaña Test Results:** Muestra si las validaciones pasaron

### Ejemplos de Respuestas Exitosas

**Crear Empleado:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Recurso creado exitosamente",
  "data": {
    "id": 1,
    "nombre": "Carlos Rodríguez",
    "cargo": "Asesor de Ventas",
    "fechaIngreso": "2025-11-15",
    "salario": 2500000
  }
}
```

**Crear Servicio (Builder Pattern):**

```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "numero": 1001,
    "valorTotal": 150000,
    "estado": "pendiente",
    "cliente": { ... },
    "empleado": { ... },
    "prendas": [ ... ]
  }
}
```

---

## Patrones de Diseño Implementados

La colección incluye pruebas para validar los siguientes patrones:

| Patrón             | Módulo     | Request                            |
| ------------------ | ---------- | ---------------------------------- |
| **Factory Method** | Prendas    | Crear Vestido/Traje/Disfraz        |
| **Builder**        | Servicios  | Crear Servicio de Alquiler         |
| **Singleton**      | Servicios  | Generación de números consecutivos |
| **Decorator**      | Lavandería | Cálculo dinámico de prioridades    |
| **Repository**     | Todos      | Persistencia de datos              |

---

## Solución de Problemas

### ❌ Error: "Cannot GET /api/v1/..."

**Problema:** El servidor no está corriendo

**Solución:**

```bash
# En la terminal del proyecto, ejecute:
npm run start:dev

# Espere hasta ver:
# "Nest application successfully started"
```

### ❌ Error: "baseUrl is not defined"

**Problema:** No seleccionó el environment

**Solución:**

1. Verifique en la esquina superior derecha de Postman
2. Asegúrese de que dice **"Los Atuendos - Local"**
3. Si no aparece, repita el Paso 1.2 y 1.3

### ❌ Error: "Ya existe un empleado con la identificación..."

**Problema:** Está intentando crear un registro duplicado

**Solución:**

- Los pre-request scripts generan datos únicos automáticamente
- Simplemente ejecute el request de nuevo, se generarán nuevos valores únicos

### ❌ Error: "Las siguientes prendas no fueron encontradas"

**Problema:** No ejecutó los requests en orden

**Solución:**

- Ejecute primero "Crear Vestido de Dama" antes de "Crear Servicio de Alquiler"
- Las variables `{{prendaId}}`, `{{clienteId}}`, `{{empleadoId}}` se guardan automáticamente

---

## Datos de Ejemplo

Todos los requests incluyen datos de ejemplo pre-configurados. Los scripts automáticos generan:

- **Referencias únicas** para prendas (VD-TEST-[timestamp])
- **Emails únicos** para clientes/empleados
- **Números de identificación únicos**
- **Fechas válidas** (hoy o futuro)

**No necesita modificar nada** - solo haga clic en **Send**.

---

## Documentación Adicional

Para explorar la API interactivamente:

1. Asegúrese de que el servidor esté corriendo
2. Abra en su navegador: **http://localhost:3000/api/docs**
3. Verá la documentación Swagger con todos los endpoints disponibles

---

## Estructura de la Colección

```
📁 Los Atuendos - API REST
├── 📂 Health Check (1 request)
├── 📂 Prendas (7 requests)
├── 📂 Clientes (3 requests)
├── 📂 Empleados (2 requests)
├── 📂 Servicios de Alquiler (3 requests)
└── 📂 Lavandería (4 requests)

Total: 20 requests con tests automáticos
```

---

## Contacto

Si tiene problemas durante la evaluación, verifique:

1. ✅ El servidor está corriendo (`npm run start:dev`)
2. ✅ El environment "Los Atuendos - Local" está seleccionado
3. ✅ La base de datos está configurada correctamente
