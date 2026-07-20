import uuid
from django.db import models


class Alerta(models.Model):
    """
    Alerta o recomendacion generada automaticamente a partir del analisis
    de las ultimas lecturas de sensores de un Sublote.
    """
    TIPO_ALERTA = 'alerta'
    TIPO_RECOMENDACION = 'recomendacion'
    TIPO_CHOICES = [
        (TIPO_ALERTA, 'Alerta'),
        (TIPO_RECOMENDACION, 'Recomendacion'),
    ]

    NIVEL_INFO = 'info'
    NIVEL_ADVERTENCIA = 'advertencia'
    NIVEL_CRITICA = 'critica'
    NIVEL_CHOICES = [
        (NIVEL_INFO, 'Info'),
        (NIVEL_ADVERTENCIA, 'Advertencia'),
        (NIVEL_CRITICA, 'Critica'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sublote = models.ForeignKey('parcelas.Sublote', on_delete=models.CASCADE, related_name='alertas')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    codigo = models.CharField(max_length=50)  # ej: 'estres_hidrico', 'ph_alto'
    nivel = models.CharField(max_length=20, choices=NIVEL_CHOICES, default=NIVEL_INFO)
    titulo = models.CharField(max_length=150)
    mensaje = models.TextField()
    leida = models.BooleanField(default=False)
    notificado_telegram = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'alertas'
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['sublote', 'leida']),
        ]
        verbose_name = 'Alerta'
        verbose_name_plural = 'Alertas'

    def __str__(self):
        return f"[{self.get_tipo_display()}] {self.titulo}"

    @property
    def agricultor(self):
        return self.sublote.parcela.agricultor
