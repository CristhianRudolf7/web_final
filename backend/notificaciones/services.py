"""
Servicio que analiza las ultimas lecturas de sensores de un Sublote y
dispara Alertas / Recomendaciones segun reglas de negocio simples.

Reglas implementadas (segun backlog Sprint 6):
  - humedad < 30%  -> Alerta "Estres Hidrico" (critica)
  - ph > 7.5       -> Recomendacion "fertilizar con acidificantes"

Cuando se crea una alerta de nivel CRITICA, se envia automaticamente una
notificacion por Telegram al agricultor dueno del sublote.
"""
import logging

from django.db import transaction

from parcelas.models import RegistroActividad
from .models import Alerta
from .telegram_client import TelegramClient

logger = logging.getLogger(__name__)

UMBRAL_HUMEDAD_MINIMA = 30
UMBRAL_PH_MAXIMO = 7.5


def evaluar_lectura(registro_actividad):
    """
    Recibe una instancia de parcelas.RegistroActividad (tipo 'sensores')
    recien guardada y evalua las reglas de alerta/recomendacion.
    Retorna la lista de Alerta creadas.
    """
    if registro_actividad.tipo_actividad != RegistroActividad.SENSORES:
        return []

    sublote = registro_actividad.sublote
    alertas_creadas = []

    if registro_actividad.humedad is not None and registro_actividad.humedad < UMBRAL_HUMEDAD_MINIMA:
        alerta = Alerta.objects.create(
            sublote=sublote,
            tipo=Alerta.TIPO_ALERTA,
            codigo='estres_hidrico',
            nivel=Alerta.NIVEL_CRITICA,
            titulo='Estres Hidrico',
            mensaje=(
                f"La humedad del sublote en '{sublote.parcela.nombre}' cayo a "
                f"{registro_actividad.humedad}%, por debajo del umbral minimo de "
                f"{UMBRAL_HUMEDAD_MINIMA}%."
            ),
        )
        alertas_creadas.append(alerta)

    if registro_actividad.ph is not None and registro_actividad.ph > UMBRAL_PH_MAXIMO:
        alerta = Alerta.objects.create(
            sublote=sublote,
            tipo=Alerta.TIPO_RECOMENDACION,
            codigo='ph_alto',
            nivel=Alerta.NIVEL_ADVERTENCIA,
            titulo='pH elevado',
            mensaje=(
                f"El pH del suelo en '{sublote.parcela.nombre}' es {registro_actividad.ph} "
                f"(> {UMBRAL_PH_MAXIMO}). Se sugiere fertilizar con componentes acidificantes."
            ),
        )
        alertas_creadas.append(alerta)

    for alerta in alertas_creadas:
        if alerta.nivel == Alerta.NIVEL_CRITICA:
            _notificar_telegram(alerta)

    return alertas_creadas


def _notificar_telegram(alerta):
    agricultor = alerta.agricultor
    cliente = TelegramClient()
    texto = f"⚠️ *{alerta.titulo}*\n{alerta.mensaje}"

    enviado = cliente.enviar_mensaje(getattr(agricultor, 'telegram_chat_id', None), texto)
    if enviado:
        alerta.notificado_telegram = True
        alerta.save(update_fields=['notificado_telegram'])


def evaluar_ultima_lectura_sublote(sublote_id):
    """
    Utilitario usado por la tarea de Celery / respaldo sincrono de la
    ingesta masiva: toma la ultima lectura de tipo 'sensores' del sublote
    y la evalua contra las reglas de alerta.
    """
    ultima = (
        RegistroActividad.objects.filter(sublote_id=sublote_id, tipo_actividad=RegistroActividad.SENSORES)
        .order_by('-fecha_hora')
        .first()
    )
    if ultima:
        with transaction.atomic():
            return evaluar_lectura(ultima)
    return []
