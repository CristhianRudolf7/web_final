from django.contrib import admin

from .models import LecturaSensor, Parcela


@admin.register(Parcela)
class ParcelaAdmin(admin.ModelAdmin):
    """Configuración del admin para el modelo Parcela."""

    list_display = ('nombre', 'ubicacion', 'agricultor', 'cultivo_actual', 'fecha_creacion')
    list_filter = ('cultivo_actual', 'fecha_creacion')
    search_fields = ('nombre', 'ubicacion')
    readonly_fields = ('id', 'fecha_creacion')


@admin.register(LecturaSensor)
class LecturaSensorAdmin(admin.ModelAdmin):
    """Configuración del admin para el modelo LecturaSensor."""

    list_display = ('parcela', 'temperatura', 'humedad', 'ph', 'fecha_registro')
    list_filter = ('parcela', 'fecha_registro')
    readonly_fields = ('id', 'fecha_registro')
