"""
Tareas asincronas de Celery para el procesamiento de alertas derivadas de
la ingesta masiva de sensores, evitando bloquear el hilo principal de
Django durante cargas de hasta 50,000 lecturas/hora.

Requiere Celery + Redis configurados (ver config/celery.py). Si el broker
no esta disponible, las vistas hacen un respaldo sincrono automaticamente
(ver parcelas/views.py -> IngestaMasivaSensoresView).
"""
from celery import shared_task


@shared_task(name='notificaciones.evaluar_sublotes_task')
def evaluar_sublotes_task(sublote_ids):
    from .services import evaluar_ultima_lectura_sublote

    total_alertas = 0
    for sublote_id in sublote_ids:
        total_alertas += len(evaluar_ultima_lectura_sublote(sublote_id))
    return {'sublotes_procesados': len(sublote_ids), 'alertas_generadas': total_alertas}
