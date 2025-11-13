# Ejemplos de Uso - API de Prendas

## Configuración Inicial

Base URL: `http://localhost:3000`

## 1. Crear Prendas

### Crear Vestido de Dama

```json
POST /prendas
Content-Type: application/json

{
  "tipo": "vestido-dama",
  "referencia": "VD-001",
  "color": "Rojo Carmesí",
  "marca": "Elegance",
  "talla": "M",
  "valorAlquiler": 150.50,
  "propiedadesEspecificas": {
    "tienePedreria": true,
    "esLargo": true,
    "cantidadPiezas": 2,
    "descripcionPiezas": "Vestido largo + bolero con pedrería"
  }
}
```

```json
POST /prendas

{
  "tipo": "vestido-dama",
  "referencia": "VD-002",
  "color": "Azul Marino",
  "marca": "Bella Noche",
  "talla": "S",
  "valorAlquiler": 120.00,
  "propiedadesEspecificas": {
    "tienePedreria": false,
    "esLargo": false,
    "cantidadPiezas": 1,
    "descripcionPiezas": "Vestido corto de cóctel"
  }
}
```

```json
POST /prendas

{
  "tipo": "vestido-dama",
  "referencia": "VD-003",
  "color": "Blanco Perla",
  "marca": "Royal Dress",
  "talla": "L",
  "valorAlquiler": 200.00,
  "propiedadesEspecificas": {
    "tienePedreria": true,
    "esLargo": true,
    "cantidadPiezas": 3,
    "descripcionPiezas": "Vestido de novia: vestido + velo + guantes"
  }
}
```

### Crear Traje de Caballero

```json
POST /prendas

{
  "tipo": "traje-caballero",
  "referencia": "TC-001",
  "color": "Negro",
  "marca": "Hugo Boss",
  "talla": "L",
  "valorAlquiler": 180.00,
  "propiedadesEspecificas": {
    "tipoTraje": "frac",
    "tieneCorbata": false,
    "tieneCorbtain": true,
    "tienePlastron": false,
    "accesoriosIncluidos": "Gemelos plateados, fajín negro"
  }
}
```

```json
POST /prendas

{
  "tipo": "traje-caballero",
  "referencia": "TC-002",
  "color": "Gris Oxford",
  "marca": "Armani",
  "talla": "M",
  "valorAlquiler": 150.00,
  "propiedadesEspecificas": {
    "tipoTraje": "convencional",
    "tieneCorbata": true,
    "tieneCorbtain": false,
    "tienePlastron": false,
    "accesoriosIncluidos": "Corbata gris, pañuelo de bolsillo"
  }
}
```

```json
POST /prendas

{
  "tipo": "traje-caballero",
  "referencia": "TC-003",
  "color": "Azul Marino",
  "marca": "Versace",
  "talla": "XL",
  "valorAlquiler": 220.00,
  "propiedadesEspecificas": {
    "tipoTraje": "sacoleva",
    "tieneCorbata": false,
    "tieneCorbtain": false,
    "tienePlastron": true,
    "accesoriosIncluidos": "Plastrón azul con broche, chaleco"
  }
}
```

### Crear Disfraces

```json
POST /prendas

{
  "tipo": "disfraz",
  "referencia": "DF-001",
  "color": "Rojo y Azul",
  "marca": "Fantasy World",
  "talla": "M",
  "valorAlquiler": 80.00,
  "propiedadesEspecificas": {
    "nombre": "Superhéroe Arácnido",
    "categoria": "Superhéroes",
    "descripcion": "Disfraz completo con máscara y accesorios",
    "edadRecomendada": "8-12 años"
  }
}
```

```json
POST /prendas

{
  "tipo": "disfraz",
  "referencia": "DF-002",
  "color": "Negro y Dorado",
  "marca": "Dark Knights",
  "talla": "L",
  "valorAlquiler": 95.00,
  "propiedadesEspecificas": {
    "nombre": "Caballero de la Noche",
    "categoria": "Superhéroes",
    "descripcion": "Traje con capa, cinturón y máscara incluidos",
    "edadRecomendada": "Adultos"
  }
}
```

```json
POST /prendas

{
  "tipo": "disfraz",
  "referencia": "DF-003",
  "color": "Naranja y Negro",
  "marca": "Halloween Fun",
  "talla": "S",
  "valorAlquiler": 60.00,
  "propiedadesEspecificas": {
    "nombre": "Calabaza Sonriente",
    "categoria": "Halloween",
    "descripcion": "Disfraz de calabaza con gorro",
    "edadRecomendada": "4-7 años"
  }
}
```

## 2. Consultas

### Consultar todas las prendas

```http
GET /prendas?pagina=1&limite=10
```

### Consultar prendas por talla M

```http
GET /prendas/talla/M?pagina=1&limite=10
```

### Consultar prendas talla M agrupadas por tipo

```http
GET /prendas/talla/M/agrupado
```

Respuesta esperada:
```json
[
  {
    "tipo": "vestido-dama",
    "cantidad": 1,
    "prendas": [
      {
        "id": 1,
        "tipo": "vestido-dama",
        "referencia": "VD-001",
        "color": "Rojo Carmesí",
        "talla": "M",
        // ... más campos
      }
    ]
  },
  {
    "tipo": "traje-caballero",
    "cantidad": 1,
    "prendas": [
      {
        "id": 5,
        "tipo": "traje-caballero",
        "referencia": "TC-002",
        "color": "Gris Oxford",
        "talla": "M",
        // ... más campos
      }
    ]
  },
  {
    "tipo": "disfraz",
    "cantidad": 1,
    "prendas": [
      {
        "id": 8,
        "tipo": "disfraz",
        "referencia": "DF-001",
        "color": "Rojo y Azul",
        "talla": "M",
        // ... más campos
      }
    ]
  }
]
```

### Consultar prendas disponibles de color rojo

```http
GET /prendas?color=Rojo&estado=disponible&pagina=1&limite=10
```

### Consultar prenda específica por referencia

```http
GET /prendas/referencia/VD-001
```

### Consultar tipos de prendas disponibles

```http
GET /prendas/tipos
```

Respuesta:
```json
{
  "tipos": [
    "vestido-dama",
    "traje-caballero",
    "disfraz"
  ]
}
```

### Obtener estadísticas

```http
GET /prendas/estadisticas
```

Respuesta esperada:
```json
{
  "total": 9,
  "disponibles": 9,
  "alquiladas": 0,
  "porTipo": {
    "vestido-dama": 3,
    "traje-caballero": 3,
    "disfraz": 3
  },
  "porTalla": {
    "S": 2,
    "M": 3,
    "L": 3,
    "XL": 1
  }
}
```

## 3. Actualizaciones

### Actualizar el color de una prenda

```json
PUT /prendas/VD-001
Content-Type: application/json

{
  "color": "Rojo Intenso"
}
```

### Cambiar el estado de una prenda

```json
PUT /prendas/TC-001

{
  "estado": "alquilada",
  "disponible": false
}
```

### Actualizar el valor de alquiler

```json
PUT /prendas/DF-001

{
  "valorAlquiler": 90.00
}
```

## 4. Eliminación

### Eliminar una prenda

```http
DELETE /prendas/VD-003
```

Respuesta:
```json
{
  "mensaje": "Prenda con referencia VD-003 eliminada exitosamente"
}
```

## 5. Casos de Prueba de Validación

### Intentar crear prenda con tipo inválido (Error 400)

```json
POST /prendas

{
  "tipo": "tipo-invalido",
  "referencia": "TEST-001",
  "color": "Rojo",
  "marca": "Test",
  "talla": "M",
  "valorAlquiler": 100.00
}
```

Respuesta:
```json
{
  "statusCode": 400,
  "message": "Tipo de prenda inválido. Tipos disponibles: vestido-dama, traje-caballero, disfraz",
  "error": "Bad Request"
}
```

### Intentar crear prenda con referencia duplicada (Error 409)

```json
POST /prendas

{
  "tipo": "vestido-dama",
  "referencia": "VD-001",
  "color": "Azul",
  "marca": "Test",
  "talla": "M",
  "valorAlquiler": 100.00
}
```

Respuesta:
```json
{
  "statusCode": 409,
  "message": "Ya existe una prenda con la referencia VD-001",
  "error": "Conflict"
}
```

### Buscar prenda inexistente (Error 404)

```http
GET /prendas/referencia/NO-EXISTE
```

Respuesta:
```json
{
  "statusCode": 404,
  "message": "Prenda con referencia NO-EXISTE no encontrada",
  "error": "Not Found"
}
```

## 6. Consultas Avanzadas

### Consultar con múltiples filtros

```http
GET /prendas?tipo=vestido-dama&talla=M&estado=disponible&orden=valor_asc&pagina=1&limite=5
```

### Consultar con ordenamiento por valor descendente

```http
GET /prendas?orden=valor_desc&pagina=1&limite=10
```

## Notas Importantes

1. **Referencia Única**: Cada prenda debe tener una referencia única en el sistema.

2. **Propiedades Específicas**: Cada tipo de prenda tiene propiedades específicas que deben incluirse en `propiedadesEspecificas`.

3. **Paginación**: Por defecto, las consultas retornan máximo 10 elementos. Usa los parámetros `pagina` y `limite` para navegar.

4. **Estados Válidos**: `disponible`, `alquilada`, `lavanderia`, `mantenimiento`

5. **Tipos de Traje**: `convencional`, `frac`, `sacoleva`, `otro`

## Testing con cURL

### Crear vestido
```bash
curl -X POST http://localhost:3000/prendas \
  -H "Content-Type: application/json" \
  -d '{"tipo":"vestido-dama","referencia":"VD-001","color":"Rojo","marca":"Elegance","talla":"M","valorAlquiler":150.50,"propiedadesEspecificas":{"tienePedreria":true,"esLargo":true,"cantidadPiezas":2}}'
```

### Consultar por talla
```bash
curl http://localhost:3000/prendas/talla/M
```

### Consultar agrupado
```bash
curl http://localhost:3000/prendas/talla/M/agrupado
```

### Actualizar prenda
```bash
curl -X PUT http://localhost:3000/prendas/VD-001 \
  -H "Content-Type: application/json" \
  -d '{"color":"Azul"}'
```

### Eliminar prenda
```bash
curl -X DELETE http://localhost:3000/prendas/VD-001
```