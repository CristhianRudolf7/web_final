from rest_framework import serializers
from .models import Alerta


class AlertaSerializer(serializers.ModelSerializer):
    parcela_nombre = serializers.CharField(source='sublote.parcela.nombre', read_only=True)
    sublote_id = serializers.UUIDField(source='sublote.id', read_only=True)

    class Meta:
        model = Alerta
        fields = [
            'id', 'sublote_id', 'parcela_nombre', 'tipo', 'codigo',
            'nivel', 'titulo', 'mensaje', 'leida', 'notificado_telegram', 'fecha_creacion',
        ]
        read_only_fields = fields
