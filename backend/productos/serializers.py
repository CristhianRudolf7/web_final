from rest_framework import serializers
from .models import Producto

class ProductoSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Producto.
    Incluye validaciones y campos dinámicos para facilitar su integración con el frontend.
    """
    imagenUrl = serializers.SerializerMethodField(read_only=True)
    agricultorNombre = serializers.SerializerMethodField(read_only=True)
    agricultorContacto = serializers.CharField(source='agricultor.celular', read_only=True)

    class Meta:
        model = Producto
        fields = [
            'id',
            'nombre',
            'descripcion',
            'precio',
            'stock',
            'imagen',
            'imagenUrl',
            'agricultorNombre',
            'agricultorContacto',
            'fecha_creacion'
        ]
        read_only_fields = ['id', 'fecha_creacion']

    def get_imagenUrl(self, obj):
        """
        Retorna la URL absoluta de la imagen cargada, o None si no hay imagen.
        """
        request = self.context.get('request')
        if obj.imagen:
            if request:
                return request.build_absolute_uri(obj.imagen.url)
            return obj.imagen.url
        return None

    def get_agricultorNombre(self, obj):
        """
        Combina el nombre y apellido del agricultor.
        """
        if obj.agricultor:
            return f"{obj.agricultor.nombre} {obj.agricultor.apellido}".strip()
        return ""

    def validate_precio(self, value):
        """
        Evita precios negativos o cero (debe ser precio > 0).
        """
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser estrictamente mayor a cero.")
        return value

    def validate_stock(self, value):
        """
        Evita stocks menores a cero (debe ser stock >= 0).
        """
        if value < 0:
            raise serializers.ValidationError("El stock no puede ser menor a cero.")
        return value
