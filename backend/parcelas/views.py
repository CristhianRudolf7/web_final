import csv

from django.http import HttpResponse, JsonResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import LecturaSensor, Parcela
from .serializers import LecturaSensorSerializer, ParcelaSerializer


class ParcelaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para operaciones CRUD sobre parcelas.
    Solo muestra las parcelas del usuario autenticado.
    """

    serializer_class = ParcelaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['cultivo_actual', 'nombre']
    search_fields = ['nombre']

    def get_queryset(self):
        """Retorna las parcelas del usuario autenticado."""
        return Parcela.objects.filter(
            agricultor=self.request.user
        ).select_related('cultivo_actual', 'agricultor')

    def perform_create(self, serializer):
        """Asigna automáticamente el agricultor al usuario autenticado."""
        serializer.save(agricultor=self.request.user)


class HistoricoLecturasView(APIView):
    """
    Vista para obtener el histórico de lecturas de sensores de una parcela.
    Soporta filtrado por rango de fechas con fecha_inicio y fecha_fin.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, parcela_id):
        """Retorna las lecturas de sensores de la parcela indicada."""
        # Verificar que la parcela existe y pertenece al usuario
        try:
            parcela = Parcela.objects.get(
                id=parcela_id, agricultor=request.user
            )
        except Parcela.DoesNotExist:
            return Response(
                {'error': 'Parcela no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        lecturas = LecturaSensor.objects.filter(parcela=parcela)

        # Filtrado por rango de fechas
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')

        if fecha_inicio:
            lecturas = lecturas.filter(fecha_registro__gte=fecha_inicio)
        if fecha_fin:
            lecturas = lecturas.filter(fecha_registro__lte=fecha_fin)

        serializer = LecturaSensorSerializer(lecturas, many=True)
        return Response(serializer.data)


class ExportarDatosView(APIView):
    """
    Vista para exportar las lecturas de sensores de una parcela
    en formato CSV o JSON.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, parcela_id):
        """Exporta las lecturas de la parcela en el formato solicitado."""
        # Verificar que la parcela existe y pertenece al usuario
        try:
            parcela = Parcela.objects.get(
                id=parcela_id, agricultor=request.user
            )
        except Parcela.DoesNotExist:
            return Response(
                {'error': 'Parcela no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        lecturas = LecturaSensor.objects.filter(parcela=parcela)

        # Filtrado por rango de fechas
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')

        if fecha_inicio:
            lecturas = lecturas.filter(fecha_registro__gte=fecha_inicio)
        if fecha_fin:
            lecturas = lecturas.filter(fecha_registro__lte=fecha_fin)

        formato = request.query_params.get('format', 'json')

        if formato == 'csv':
            return self._exportar_csv(lecturas, parcela)
        return self._exportar_json(lecturas)

    def _exportar_csv(self, lecturas, parcela):
        """Genera y retorna un archivo CSV con las lecturas."""
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = (
            f'attachment; filename="lecturas_{parcela.nombre}.csv"'
        )

        writer = csv.writer(response)
        writer.writerow([
            'ID', 'Temperatura', 'Humedad', 'pH', 'Fecha de registro',
        ])

        for lectura in lecturas:
            writer.writerow([
                str(lectura.id),
                lectura.temperatura,
                lectura.humedad,
                lectura.ph,
                lectura.fecha_registro.isoformat(),
            ])

        return response

    def _exportar_json(self, lecturas):
        """Genera y retorna las lecturas en formato JSON."""
        serializer = LecturaSensorSerializer(lecturas, many=True)
        return JsonResponse(serializer.data, safe=False)
