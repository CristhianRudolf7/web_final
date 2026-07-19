import uuid

from django.conf import settings
from django.db import models


class Parcela(models.Model):
    """Modelo que representa una parcela agrícola asignada a un agricultor."""

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )
    agricultor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='parcelas',
        verbose_name='Agricultor',
    )
    nombre = models.CharField('Nombre', max_length=255)
    ubicacion = models.CharField('Ubicación', max_length=255)
    cultivo_actual = models.ForeignKey(
        'productos.Producto',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='parcelas',
        verbose_name='Cultivo actual',
    )
    fecha_creacion = models.DateTimeField('Fecha de creación', auto_now_add=True)

    class Meta:
        db_table = 'parcelas'
        ordering = ['-fecha_creacion']
        verbose_name = 'Parcela'
        verbose_name_plural = 'Parcelas'

    def __str__(self):
        return f'{self.nombre} - {self.ubicacion}'


class LecturaSensor(models.Model):
    """Modelo que almacena las lecturas de sensores asociadas a una parcela."""

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )
    parcela = models.ForeignKey(
        Parcela,
        on_delete=models.CASCADE,
        related_name='lecturas',
        verbose_name='Parcela',
    )
    temperatura = models.DecimalField(
        'Temperatura', max_digits=5, decimal_places=2
    )
    humedad = models.DecimalField(
        'Humedad', max_digits=5, decimal_places=2
    )
    ph = models.DecimalField(
        'pH', max_digits=4, decimal_places=2
    )
    fecha_registro = models.DateTimeField(
        'Fecha de registro', auto_now_add=True
    )

    class Meta:
        db_table = 'lecturas_sensor'
        ordering = ['-fecha_registro']
        verbose_name = 'Lectura de sensor'
        verbose_name_plural = 'Lecturas de sensor'

    def __str__(self):
        return f'Lectura {self.parcela.nombre} - {self.fecha_registro}'
