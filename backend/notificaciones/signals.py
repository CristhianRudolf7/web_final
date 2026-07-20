from django.db.models.signals import post_save
from django.dispatch import receiver

from parcelas.models import RegistroActividad
from .services import evaluar_lectura


@receiver(post_save, sender=RegistroActividad)
def evaluar_alertas_al_registrar_actividad(sender, instance, created, **kwargs):
    """
    Cada vez que se registra una nueva lectura de sensores sobre un
    sublote (vía ActividadesSubloteView), se dispara automaticamente el
    analisis de alertas y recomendaciones (Sprint 6). La ingesta masiva
    usa bulk_create, que NO dispara señales, por eso se evalua de forma
    explicita en IngestaMasivaSensoresView (via Celery o respaldo sincrono).
    """
    if created and instance.tipo_actividad == RegistroActividad.SENSORES:
        evaluar_lectura(instance)
