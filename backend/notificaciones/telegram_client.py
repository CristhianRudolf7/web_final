"""
Cliente minimo para la API de bots de Telegram.

Realiza peticiones POST al metodo `sendMessage` del webhook del bot para
notificar de forma automatica al agricultor cuando se registra una alerta
critica en la base de datos.

Configuracion esperada:
  - settings.TELEGRAM_BOT_TOKEN: token del bot creado con @BotFather
    (variable de entorno TELEGRAM_BOT_TOKEN).

El chat_id de cada agricultor se guarda en Usuario.telegram_chat_id,
editable desde /api/perfil/ (ver usuarios/serializers.py) y desde la
pagina de Perfil del frontend.
"""
import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

TELEGRAM_API_BASE = 'https://api.telegram.org'
TIMEOUT_SEGUNDOS = 5


class TelegramClient:
    def __init__(self, token=None):
        self.token = token or getattr(settings, 'TELEGRAM_BOT_TOKEN', None)

    @property
    def configurado(self):
        return bool(self.token)

    def _url(self, metodo):
        return f"{TELEGRAM_API_BASE}/bot{self.token}/{metodo}"

    def enviar_mensaje(self, chat_id, texto, parse_mode='Markdown'):
        """
        Envia un mensaje de texto al chat_id indicado. Retorna True si
        Telegram respondio con exito. No lanza excepcion ante fallos de
        red o configuracion faltante: los registra y retorna False, para
        no interrumpir el flujo principal de creacion de alertas.
        """
        if not self.configurado:
            logger.warning('TELEGRAM_BOT_TOKEN no configurado; se omite el envio de notificacion.')
            return False
        if not chat_id:
            logger.info('El agricultor no tiene telegram_chat_id vinculado; se omite el envio.')
            return False

        try:
            respuesta = requests.post(
                self._url('sendMessage'),
                json={'chat_id': chat_id, 'text': texto, 'parse_mode': parse_mode},
                timeout=TIMEOUT_SEGUNDOS,
            )
            datos = respuesta.json()
            if respuesta.status_code == 200 and datos.get('ok'):
                return True
            logger.error('Fallo el envio a Telegram: %s', datos)
            return False
        except requests.RequestException as exc:
            logger.error('Excepcion al conectar con la API de Telegram: %s', exc)
            return False
