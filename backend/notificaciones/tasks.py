"""
Evaluación de notificaciones síncrona mediante servicios de Django.
"""
from .services import evaluar_ultima_lectura_sublote


def evaluar_sublotes(sublote_ids):
    """Procesa y evalúa las alertas para la lista de sublotes indicados."""
    total_alertas = 0
    for sublote_id in sublote_ids:
        total_alertas += len(evaluar_ultima_lectura_sublote(sublote_id))
    return {'sublotes_procesados': len(sublote_ids), 'alertas_generadas': total_alertas}
