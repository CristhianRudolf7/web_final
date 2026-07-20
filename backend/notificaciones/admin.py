from django.contrib import admin
from .models import Alerta


@admin.register(Alerta)
class AlertaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'tipo', 'nivel', 'sublote', 'leida', 'notificado_telegram', 'fecha_creacion')
    list_filter = ('tipo', 'nivel', 'leida')
