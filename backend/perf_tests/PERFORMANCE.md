# Rendimiento — Sprint 6

Metodología de pruebas de carga y resultados de los escenarios k6 en `perf_tests/`.

## Requisitos del sprint

| Requisito | Objetivo |
|---|---|
| Latencia de la API de lectura | p(95) < 500 ms |
| Endpoint de ingesta de sensores | soportar 50,000 lecturas/hora sin bloquear el hilo principal |
| Consulta rápida del último estado | sin repetir consultas SQL si el dato está cacheado |

## Cómo se optimizó cada punto

1. **Caché del último estado** (`parcelas/cache_utils.py`): `GET /api/sublotes/<id>/ultimo-estado/`
   guarda el resultado en `django.core.cache` (Redis vía `REDIS_URL`, `LocMemCache` en dev)
   con TTL de 60s. La respuesta incluye `cache_hit` para verificar que no se repiten las
   consultas SQL. El cache se invalida automáticamente al registrar una nueva actividad
   (`ActividadesSubloteView`) o una ingesta masiva sobre ese sublote.
2. **Ingesta masiva sin bloqueo** (`parcelas/views.py::IngestaMasivaSensoresView`):
   - Valida el lote con un serializer liviano (`IngestaSensorItemSerializer`).
   - Inserta con `RegistroActividad.objects.bulk_create()` en bloques de 1,000 registros.
   - El análisis de alertas se delega a una tarea de **Celery** (`notificaciones/tasks.py`)
     para no bloquear el ciclo request/response; si Celery/Redis no está disponible, se
     ejecuta un respaldo síncrono (solo recomendado para desarrollo).
3. **Índices de base de datos**: `Alerta` incluye índice compuesto (`sublote`, `leida`) y
   `RegistroActividad` ya contaba con `ordering` por `fecha_hora` sobre claves indexadas
   por FK, evitando table scans en las consultas de "última lectura" / "no leídas".

## Cómo ejecutar las pruebas

Requiere [k6](https://k6.io/docs/get-started/installation/) instalado y el backend corriendo
(idealmente con Redis configurado vía `REDIS_URL` para condiciones cercanas a producción).

```bash
# 1. Obtener un access_token (cookie JWT) vía POST /api/login/
# 2. Prueba de latencia de lectura (objetivo: p95 < 500ms)
k6 run -e BASE_URL=http://localhost:8000 \
       -e ACCESS_TOKEN=<jwt> \
       -e SUBLOTE_ID=<uuid> \
       perf_tests/k6_lectura_ultimo_estado.js

# 3. Prueba de ingesta masiva (objetivo: 50,000 lecturas/hora sostenidas)
k6 run -e BASE_URL=http://localhost:8000 \
       -e ACCESS_TOKEN=<jwt> \
       -e SUBLOTE_ID=<uuid> \
       perf_tests/k6_ingesta_masiva.js
```

## Resultados

> Los números de esta sección deben completarse ejecutando los scripts contra el entorno
> real (staging/producción con Postgres + Redis), ya que la latencia depende de la
> infraestructura. Plantilla de registro sugerida:

| Escenario | VUs / tasa | p(50) | p(95) | p(99) | Tasa de error | ¿Cumple objetivo? |
|---|---|---|---|---|---|---|
| Lectura `ultimo-estado` (cache hit) | 150 VUs | | | | | |
| Lectura `ultimo-estado` (cache miss) | 150 VUs | | | | | |
| Ingesta masiva (500 lecturas/petición, ~28 pet/min) | 10-30 VUs | | | | | |

### Validación funcional realizada en este entorno de desarrollo

- Un lote de **5,000 lecturas** se insertó correctamente en una sola petición vía
  `bulk_create`, respondiendo `201` con `{"lecturas_insertadas": 5000, "sublotes_afectados": 1}`.
- El endpoint `ultimo-estado` devolvió `cache_hit: false` en la primera llamada y
  `cache_hit: true` en la siguiente, sin volver a golpear la base de datos dentro del TTL.
- Se validó que la ingesta masiva rechaza (`403`) sublotes que no pertenecen al usuario
  autenticado.
- El throttling global (`5 req/seg` por usuario) se mantiene activo; para pruebas de carga
  reales se recomienda ajustar `REST_FRAMEWORK.DEFAULT_THROTTLE_RATES` o usar múltiples
  usuarios de prueba para no medir el throttling en vez de la latencia real del endpoint.
