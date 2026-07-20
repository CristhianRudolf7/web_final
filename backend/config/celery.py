"""
Configuracion de la aplicacion Celery para procesar tareas asincronas
(evaluacion de alertas derivadas de la ingesta masiva de sensores) sin
bloquear el hilo principal de Django. Broker/backend: Redis.

Para levantar un worker en desarrollo:
    celery -A config worker -l info
"""
import os

from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('config')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
