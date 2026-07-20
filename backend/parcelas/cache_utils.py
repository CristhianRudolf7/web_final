"""
Utilidades de cache para el ultimo estado (temperatura/humedad/ph/riego)
de un Sublote. Usa el backend configurado en settings.CACHES (Redis en
produccion via REDIS_URL, LocMemCache en desarrollo) para evitar consultas
SQL repetidas en el endpoint de consulta rapida (Sprint 6).
"""
from django.core.cache import cache

TTL_ULTIMO_ESTADO_SEGUNDOS = 60


def clave_ultimo_estado(sublote_id):
    return f"sublote:{sublote_id}:ultimo_estado"


def invalidar_ultimo_estado(sublote_id):
    cache.delete(clave_ultimo_estado(sublote_id))


def obtener_ultimo_estado_cacheado(sublote_id, builder):
    """
    Retorna (dato, cache_hit). Si el dato ya esta en cache lo retorna
    directamente; si no, ejecuta `builder()` (la consulta SQL), lo guarda
    en cache con TTL y lo retorna.
    """
    clave = clave_ultimo_estado(sublote_id)
    valor = cache.get(clave)
    if valor is not None:
        return valor, True

    valor = builder()
    cache.set(clave, valor, TTL_ULTIMO_ESTADO_SEGUNDOS)
    return valor, False
