import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone


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
    ancho = models.DecimalField(
        'Ancho en metros', max_digits=10, decimal_places=2, default=100.00
    )
    largo = models.DecimalField(
        'Largo en metros', max_digits=10, decimal_places=2, default=100.00
    )
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
        return f'{self.nombre} - {self.ubicacion} ({self.ancho}m x {self.largo}m)'


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


class Sublote(models.Model):
    """Poligono normalizado que delimita un sublote dentro de una parcela."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parcela = models.ForeignKey(
        Parcela,
        on_delete=models.CASCADE,
        related_name='sublotes',
        verbose_name='Parcela',
    )
    poligono = models.JSONField('Poligono')
    fecha_creacion = models.DateTimeField('Fecha de creacion', auto_now_add=True)

    class Meta:
        db_table = 'sublotes'
        ordering = ['-fecha_creacion']
        verbose_name = 'Sublote'
        verbose_name_plural = 'Sublotes'

    @property
    def area_m2(self):
        """Calcula el área estimada del polígono en m² usando el ancho y largo de la parcela padre."""
        if not self.poligono or len(self.poligono) < 3:
            return 0.0
        suma = 0.0
        n = len(self.poligono)
        for i in range(n):
            j = (i + 1) % n
            xi, yi = float(self.poligono[i]['x']), float(self.poligono[i]['y'])
            xj, yj = float(self.poligono[j]['x']), float(self.poligono[j]['y'])
            suma += (xi * yj) - (xj * yi)
        area_norm = abs(suma) / 2.0
        area_real = area_norm * (float(self.parcela.ancho) * float(self.parcela.largo))
        return round(area_real, 2)

    def __str__(self):
        return f'Sublote {self.id} - {self.parcela.nombre}'


class RegistroActividad(models.Model):
    """Registro de riego o datos ambientales asociado a un sublote."""

    RIEGO = 'riego'
    SENSORES = 'sensores'

    TIPOS_ACTIVIDAD = [
        (RIEGO, 'Riego'),
        (SENSORES, 'Sensores'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sublote = models.ForeignKey(
        Sublote,
        on_delete=models.CASCADE,
        related_name='actividades',
        verbose_name='Sublote',
    )
    tipo_actividad = models.CharField(max_length=20, choices=TIPOS_ACTIVIDAD)
    litros_riego = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
    temperatura = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    humedad = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    ph = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    fecha_hora = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'registros_actividad'
        ordering = ['-fecha_hora']
        verbose_name = 'Registro de actividad'
        verbose_name_plural = 'Registros de actividad'

    def save(self, *args, **kwargs):
        if not self.fecha_hora:
            self.fecha_hora = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.get_tipo_actividad_display()} - {self.sublote_id}'
