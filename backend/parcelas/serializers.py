from rest_framework import serializers

from .models import LecturaSensor, Parcela


class ParcelaSerializer(serializers.ModelSerializer):
    """Serializador para el modelo Parcela con campos calculados."""

    cultivo_nombre = serializers.SerializerMethodField()
    agricultor_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Parcela
        fields = [
            'id',
            'agricultor',
            'nombre',
            'ubicacion',
            'cultivo_actual',
            'fecha_creacion',
            'cultivo_nombre',
            'agricultor_nombre',
        ]
        read_only_fields = ['id', 'agricultor', 'fecha_creacion']

    def get_cultivo_nombre(self, obj):
        """Retorna el nombre del cultivo actual o None si no tiene."""
        return obj.cultivo_actual.nombre if obj.cultivo_actual else None

    def get_agricultor_nombre(self, obj):
        """Retorna el nombre completo del agricultor."""
        return f'{obj.agricultor.nombre} {obj.agricultor.apellido}'


class LecturaSensorSerializer(serializers.ModelSerializer):
    """Serializador para el modelo LecturaSensor con validaciones de rango."""

    class Meta:
        model = LecturaSensor
        fields = [
            'id',
            'parcela',
            'temperatura',
            'humedad',
            'ph',
            'fecha_registro',
        ]
        read_only_fields = ['id', 'fecha_registro']

    def validate_temperatura(self, value):
        """Valida que la temperatura esté entre -10 y 60 grados."""
        if value < -10 or value > 60:
            raise serializers.ValidationError(
                'La temperatura debe estar entre -10 y 60 grados.'
            )
        return value

    def validate_humedad(self, value):
        """Valida que la humedad esté entre 0 y 100 por ciento."""
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                'La humedad debe estar entre 0 y 100 por ciento.'
            )
        return value

    def validate_ph(self, value):
        """Valida que el pH esté entre 0 y 14."""
        if value < 0 or value > 14:
            raise serializers.ValidationError(
                'El pH debe estar entre 0 y 14.'
            )
        return value
