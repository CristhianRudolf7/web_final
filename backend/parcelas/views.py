import csv

from django.http import HttpResponse, JsonResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .cache_utils import invalidar_ultimo_estado, obtener_ultimo_estado_cacheado
from .models import LecturaSensor, Parcela, RegistroActividad, Sublote
from .serializers import (
    IngestaSensorItemSerializer,
    LecturaSensorSerializer,
    ParcelaSerializer,
    RegistroActividadSerializer,
    SubloteSerializer,
)


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


def punto_en_poligono_py(px, py, poligono):
    dentro = False
    n = len(poligono)
    j = n - 1
    for i in range(n):
        xi, yi = float(poligono[i]['x']), float(poligono[i]['y'])
        xj, yj = float(poligono[j]['x']), float(poligono[j]['y'])
        intersecta = ((yi > py) != (yj > py)) and (px < (xj - xi) * (py - yi) / (yj - yi) + xi)
        if intersecta:
            dentro = not dentro
        j = i
    return dentro

def ccw_py(A, B, C):
    return (C['y'] - A['y']) * (B['x'] - A['x']) > (B['y'] - A['y']) * (C['x'] - A['x'])

def segmentos_se_intersecan_py(A, B, C, D):
    return ccw_py(A, C, D) != ccw_py(B, C, D) and ccw_py(A, B, C) != ccw_py(A, B, D)

def poligonos_se_solapan_py(polyA, polyB):
    if not polyA or not polyB or len(polyA) < 3 or len(polyB) < 3:
        return False
    for i in range(len(polyA)):
        a1, a2 = polyA[i], polyA[(i + 1) % len(polyA)]
        for j in range(len(polyB)):
            b1, b2 = polyB[j], polyB[(j + 1) % len(polyB)]
            if segmentos_se_intersecan_py(a1, a2, b1, b2):
                return True
    for pt in polyA:
        if punto_en_poligono_py(float(pt['x']), float(pt['y']), polyB):
            return True
    for pt in polyB:
        if punto_en_poligono_py(float(pt['x']), float(pt['y']), polyA):
            return True
    return False


class SublotesParcelaView(APIView):
    """Lista y crea sublotes dentro de una parcela del usuario autenticado."""

    permission_classes = [permissions.IsAuthenticated]

    def get_parcela(self, request, parcela_id):
        try:
            return Parcela.objects.get(id=parcela_id, agricultor=request.user)
        except Parcela.DoesNotExist:
            return None

    def get(self, request, parcela_id):
        parcela = self.get_parcela(request, parcela_id)
        if parcela is None:
            return Response(
                {'error': 'Parcela no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        sublotes = Sublote.objects.filter(parcela=parcela)
        serializer = SubloteSerializer(sublotes, many=True)
        return Response(serializer.data)

    def post(self, request, parcela_id):
        parcela = self.get_parcela(request, parcela_id)
        if parcela is None:
            return Response(
                {'error': 'Parcela no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        poligono_nuevo = request.data.get('poligono', [])
        sublotes_existentes = Sublote.objects.filter(parcela=parcela)
        for s in sublotes_existentes:
            if poligonos_se_solapan_py(poligono_nuevo, s.poligono):
                return Response(
                    {'error': 'El sublote se solapa con un sublote existente en la parcela.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        serializer = SubloteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(parcela=parcela)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ActividadesSubloteView(APIView):
    """Registra actividades de riego o sensores en un sublote propio."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, sublote_id):
        try:
            sublote = Sublote.objects.select_related('parcela').get(
                id=sublote_id,
                parcela__agricultor=request.user,
            )
        except Sublote.DoesNotExist:
            return Response(
                {'error': 'Sublote no encontrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = RegistroActividadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(sublote=sublote)
        invalidar_ultimo_estado(str(sublote.id))
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UltimoEstadoSubloteView(APIView):
    """
    Retorna los ultimos registros de sensores y riego de un sublote propio.

    Sprint 6: el resultado se guarda en cache (Redis/LocMem) por 60s para
    que la consulta rapida del estado no repita la misma consulta SQL en
    cada llamada. La respuesta incluye "cache_hit" para poder verificarlo.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, sublote_id):
        try:
            sublote = Sublote.objects.select_related('parcela').get(
                id=sublote_id,
                parcela__agricultor=request.user,
            )
        except Sublote.DoesNotExist:
            return Response(
                {'error': 'Sublote no encontrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        def construir_estado():
            ultimo_riego = (
                RegistroActividad.objects
                .filter(sublote=sublote, tipo_actividad=RegistroActividad.RIEGO)
                .first()
            )
            ultimo_sensores = (
                RegistroActividad.objects
                .filter(sublote=sublote, tipo_actividad=RegistroActividad.SENSORES)
                .first()
            )
            return {
                'sublote': str(sublote.id),
                'ultimo_riego': (
                    RegistroActividadSerializer(ultimo_riego).data
                    if ultimo_riego else None
                ),
                'ultimo_sensores': (
                    RegistroActividadSerializer(ultimo_sensores).data
                    if ultimo_sensores else None
                ),
            }

        estado, cache_hit = obtener_ultimo_estado_cacheado(str(sublote.id), construir_estado)
        return Response({**estado, 'cache_hit': cache_hit})


class IngestaMasivaSensoresView(APIView):
    """
    POST /api/sensores/ingesta-masiva/

    Endpoint disenado para soportar la carga de hasta 50,000 lecturas por
    hora sin bloquear el hilo principal de Django:
      - Valida el lote con un serializer liviano (IngestaSensorItemSerializer).
      - Inserta todo el lote con `bulk_create` (una sola sentencia SQL por
        bloque, en vez de N sentencias individuales) en bloques (chunks)
        para limitar el uso de memoria.
      - Si Celery + Redis estan configurados (ver config/celery.py), el
        analisis de alertas/recomendaciones derivado de las lecturas se
        delega a una tarea asincrona en vez de ejecutarse en el
        request-response cycle. Si no, se procesa de forma sincrona como
        respaldo (solo para desarrollo, sin Redis).

    Body esperado:
    {
      "lecturas": [
        {"sublote": "<uuid>", "temperatura": 24.5, "humedad": 55.2, "ph": 6.8},
        ...
      ]
    }

    Nota: al usar bulk_create, esta vista NO dispara la señal post_save de
    RegistroActividad (Django no la ejecuta en inserciones masivas), por
    eso el analisis de alertas se dispara explicitamente aqui.
    """

    permission_classes = [permissions.IsAuthenticated]
    TAMANO_LOTE = 1000

    def post(self, request):
        lecturas = request.data.get('lecturas', [])
        if not isinstance(lecturas, list) or not lecturas:
            return Response(
                {'detalle': 'Se esperaba una lista no vacia en "lecturas".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Solo se permite ingestar sobre sublotes propios del usuario.
        sublotes_ids_solicitados = {item.get('sublote') for item in lecturas if item.get('sublote')}
        sublotes_propios = set(
            str(pk) for pk in Sublote.objects.filter(
                id__in=sublotes_ids_solicitados, parcela__agricultor=request.user
            ).values_list('id', flat=True)
        )
        no_autorizados = {str(sid) for sid in sublotes_ids_solicitados} - sublotes_propios
        if no_autorizados:
            return Response(
                {'detalle': 'Uno o mas sublotes no pertenecen al usuario autenticado.', 'sublotes': list(no_autorizados)},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = IngestaSensorItemSerializer(data=lecturas, many=True)
        serializer.is_valid(raise_exception=True)
        datos_validados = serializer.validated_data

        objetos = [
            RegistroActividad(
                sublote_id=item['sublote'],
                tipo_actividad=RegistroActividad.SENSORES,
                temperatura=item.get('temperatura'),
                humedad=item.get('humedad'),
                ph=item.get('ph'),
                **({'fecha_hora': item['fecha_hora']} if item.get('fecha_hora') else {}),
            )
            for item in datos_validados
        ]

        creados_total = 0
        for i in range(0, len(objetos), self.TAMANO_LOTE):
            lote = objetos[i:i + self.TAMANO_LOTE]
            RegistroActividad.objects.bulk_create(lote, batch_size=self.TAMANO_LOTE)
            creados_total += len(lote)

        sublotes_afectados = list({str(obj.sublote_id) for obj in objetos})
        for sublote_id in sublotes_afectados:
            invalidar_ultimo_estado(sublote_id)

        try:
            from notificaciones.tasks import evaluar_sublotes_task
            evaluar_sublotes_task.delay(sublotes_afectados)
        except Exception:
            from notificaciones.services import evaluar_ultima_lectura_sublote
            for sublote_id in sublotes_afectados:
                evaluar_ultima_lectura_sublote(sublote_id)

        return Response(
            {'lecturas_insertadas': creados_total, 'sublotes_afectados': len(sublotes_afectados)},
            status=status.HTTP_201_CREATED,
        )


class SubloteDetalleView(APIView):
    """Vista para eliminar un sublote propio."""

    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, sublote_id):
        try:
            sublote = Sublote.objects.select_related('parcela').get(
                id=sublote_id,
                parcela__agricultor=request.user,
            )
            sublote.delete()
            invalidar_ultimo_estado(str(sublote_id))
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Sublote.DoesNotExist:
            return Response(
                {'error': 'Sublote no encontrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )
