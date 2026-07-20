from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Alerta
from .serializers import AlertaSerializer


class NotificacionesListView(APIView):
    """
    GET /api/notificaciones/

    Lista las alertas y recomendaciones de todos los sublotes cuyas
    parcelas pertenecen al agricultor autenticado. Soporta el filtro
    opcional ?leida=false para mostrar solo las pendientes (usado por el
    componente de campana en el Header del panel).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = Alerta.objects.filter(sublote__parcela__agricultor=request.user)

        leida_param = request.query_params.get('leida')
        if leida_param is not None:
            queryset = queryset.filter(leida=leida_param.lower() == 'true')

        queryset = queryset.select_related('sublote', 'sublote__parcela')[:100]
        return Response({
            'total_no_leidas': Alerta.objects.filter(
                sublote__parcela__agricultor=request.user, leida=False
            ).count(),
            'resultados': AlertaSerializer(queryset, many=True).data,
        }, status=status.HTTP_200_OK)


class MarcarNotificacionLeidaView(APIView):
    """PATCH /api/notificaciones/<uuid:alerta_id>/leida/"""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, alerta_id):
        alerta = get_object_or_404(Alerta, id=alerta_id)
        if alerta.sublote.parcela.agricultor_id != request.user.id:
            return Response({'detalle': 'No tiene permisos sobre esta notificacion.'}, status=status.HTTP_403_FORBIDDEN)

        alerta.leida = True
        alerta.save(update_fields=['leida'])
        return Response(AlertaSerializer(alerta).data, status=status.HTTP_200_OK)


class MarcarTodasLeidasView(APIView):
    """POST /api/notificaciones/marcar-todas-leidas/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        actualizadas = Alerta.objects.filter(
            sublote__parcela__agricultor=request.user, leida=False
        ).update(leida=True)
        return Response({'actualizadas': actualizadas}, status=status.HTTP_200_OK)
