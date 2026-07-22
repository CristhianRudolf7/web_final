from django.contrib import admin

from .models import LecturaSensor, Parcela, RegistroActividad, Sublote


@admin.register(Parcela)
class ParcelaAdmin(admin.ModelAdmin):
    """Configuración del admin para el modelo Parcela."""

    list_display = ('nombre', 'ubicacion', 'ancho', 'largo', 'agricultor', 'cultivo_actual', 'fecha_creacion')
    list_filter = ('cultivo_actual', 'fecha_creacion')
    search_fields = ('nombre', 'ubicacion')
    readonly_fields = ('id', 'fecha_creacion')


@admin.register(LecturaSensor)
class LecturaSensorAdmin(admin.ModelAdmin):
    """Configuración del admin para el modelo LecturaSensor."""

    list_display = ('parcela', 'temperatura', 'humedad', 'ph', 'fecha_registro')
    list_filter = ('parcela', 'fecha_registro')
    readonly_fields = ('id', 'fecha_registro')


@admin.register(Sublote)
class SubloteAdmin(admin.ModelAdmin):
    """Configuracion del admin para el modelo Sublote."""

    list_display = ('id', 'parcela', 'area_m2', 'fecha_creacion')
    list_filter = ('parcela', 'fecha_creacion')
    readonly_fields = ('id', 'fecha_creacion')


@admin.register(RegistroActividad)
class RegistroActividadAdmin(admin.ModelAdmin):
    """Configuracion del admin para actividades de sublotes."""

    list_display = (
        'sublote',
        'tipo_actividad',
        'litros_riego',
        'temperatura',
        'humedad',
        'ph',
        'fecha_hora',
    )
    list_filter = ('tipo_actividad', 'fecha_hora')
    readonly_fields = ('id', 'fecha_hora')
