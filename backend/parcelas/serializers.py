from rest_framework import serializers

from .models import LecturaSensor, Parcela, RegistroActividad, Sublote


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
            'ancho',
            'largo',
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

    def validate_ancho(self, value):
        if value <= 0:
            raise serializers.ValidationError('El ancho debe ser mayor a cero.')
        return value

    def validate_largo(self, value):
        if value <= 0:
            raise serializers.ValidationError('El largo debe ser mayor a cero.')
        return value


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


class SubloteSerializer(serializers.ModelSerializer):
    """Serializador de sublotes con validacion de puntos normalizados y ultimo estado."""

    ancho = serializers.ReadOnlyField(source='parcela.ancho')
    largo = serializers.ReadOnlyField(source='parcela.largo')
    area_m2 = serializers.ReadOnlyField()
    ultimo_riego = serializers.SerializerMethodField()
    ultimo_sensores = serializers.SerializerMethodField()

    class Meta:
        model = Sublote
        fields = [
            'id',
            'parcela',
            'poligono',
            'ancho',
            'largo',
            'area_m2',
            'fecha_creacion',
            'ultimo_riego',
            'ultimo_sensores',
        ]
        read_only_fields = ['id', 'parcela', 'ancho', 'largo', 'area_m2', 'fecha_creacion']

    def get_ultimo_riego(self, obj):
        ultimo = obj.actividades.filter(tipo_actividad=RegistroActividad.RIEGO).first()
        return RegistroActividadSerializer(ultimo).data if ultimo else None

    def get_ultimo_sensores(self, obj):
        ultimo = obj.actividades.filter(tipo_actividad=RegistroActividad.SENSORES).first()
        return RegistroActividadSerializer(ultimo).data if ultimo else None

    def validate_poligono(self, value):
        if not isinstance(value, list) or len(value) < 3:
            raise serializers.ValidationError(
                'El poligono debe tener al menos 3 puntos.'
            )

        for punto in value:
            if not isinstance(punto, dict) or 'x' not in punto or 'y' not in punto:
                raise serializers.ValidationError(
                    'Cada punto debe tener coordenadas x e y.'
                )
            try:
                x = float(punto['x'])
                y = float(punto['y'])
            except (TypeError, ValueError):
                raise serializers.ValidationError(
                    'Las coordenadas deben ser numericas.'
                )
            if not 0 <= x <= 1 or not 0 <= y <= 1:
                raise serializers.ValidationError(
                    'Las coordenadas deben estar normalizadas entre 0.0 y 1.0.'
                )

        return value


class RegistroActividadSerializer(serializers.ModelSerializer):
    """Serializador para actividades de riego y sensores por sublote."""

    class Meta:
        model = RegistroActividad
        fields = [
            'id',
            'sublote',
            'tipo_actividad',
            'litros_riego',
            'temperatura',
            'humedad',
            'ph',
            'fecha_hora',
        ]
        read_only_fields = ['id', 'sublote', 'fecha_hora']

    def validate(self, attrs):
        tipo = attrs.get('tipo_actividad')

        if tipo == RegistroActividad.RIEGO:
            litros = attrs.get('litros_riego')
            if litros is None or litros <= 0:
                raise serializers.ValidationError({
                    'litros_riego': 'Debe registrar un volumen mayor que cero.'
                })

        if tipo == RegistroActividad.SENSORES:
            requeridos = ['temperatura', 'humedad', 'ph']
            faltantes = [campo for campo in requeridos if attrs.get(campo) is None]
            if faltantes:
                raise serializers.ValidationError(
                    {campo: 'Este campo es obligatorio.' for campo in faltantes}
                )

        return attrs

    def validate_temperatura(self, value):
        if value is not None and (value < -10 or value > 60):
            raise serializers.ValidationError(
                'La temperatura debe estar entre -10 y 60 grados.'
            )
        return value

    def validate_humedad(self, value):
        if value is not None and (value < 0 or value > 100):
            raise serializers.ValidationError(
                'La humedad debe estar entre 0 y 100 por ciento.'
            )
        return value

    def validate_ph(self, value):
        if value is not None and (value < 0 or value > 14):
            raise serializers.ValidationError('El pH debe estar entre 0 y 14.')
        return value


class UltimoEstadoSubloteSerializer(serializers.Serializer):
    sublote = serializers.UUIDField()
    ultimo_riego = RegistroActividadSerializer(allow_null=True)
    ultimo_sensores = RegistroActividadSerializer(allow_null=True)

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


class IngestaSensorItemSerializer(serializers.Serializer):
    """
    Item individual para la ingesta masiva de lecturas de sensores
    (Sprint 6). Es intencionalmente mas liviano que
    RegistroActividadSerializer para minimizar el costo de validacion
    sobre lotes grandes (hasta 50,000 lecturas/hora).
    """
    sublote = serializers.UUIDField()
    temperatura = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    humedad = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    ph = serializers.DecimalField(max_digits=4, decimal_places=2, required=False, allow_null=True)
    fecha_hora = serializers.DateTimeField(required=False)

    def validate_temperatura(self, value):
        if value is not None and (value < -10 or value > 60):
            raise serializers.ValidationError('La temperatura debe estar entre -10 y 60 grados.')
        return value

    def validate_humedad(self, value):
        if value is not None and (value < 0 or value > 100):
            raise serializers.ValidationError('La humedad debe estar entre 0 y 100 por ciento.')
        return value

    def validate_ph(self, value):
        if value is not None and (value < 0 or value > 14):
            raise serializers.ValidationError('El pH debe estar entre 0 y 14.')
        return value
