import uuid
from django.db import models
from django.conf import settings

class Producto(models.Model):
    """
    Modelo que representa un producto agrícola en el inventario.
    Asociado al agricultor (usuario autenticado).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField()
    imagen = models.ImageField(upload_to='productos/', null=True, blank=True)
    
    # agricultor referenciado a la clase Usuario configurada como AUTH_USER_MODEL
    agricultor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='productos'
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'producto'
        verbose_name_plural = 'productos'
        db_table = 'productos'
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f"{self.nombre} (Stock: {self.stock})"
