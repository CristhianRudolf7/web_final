from django.db.models import Avg, Sum
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from parcelas.models import Parcela, RegistroActividad


class DashboardResumenView(APIView):
    """
    GET /api/dashboard/resumen/

    Endpoint agregador para la seccion "Dashboard" general del panel del
    agricultor autenticado. Provee los datos que el frontend visualiza con
    Recharts:

      - historico: evolucion de temperatura/humedad/ph por parcela
        (lecturas de sensores registradas en sus sublotes).
      - riego_vs_humedad: litros de riego totales comparados contra la
        humedad promedio actual, por parcela.
      - cultivos_productivos: estadisticas generales de los cultivos con
        mayor actividad (como no existe todavia un modulo de cosecha/venta,
        se usa el volumen de riego invertido y la cantidad de parcelas
        asociadas como proxy de productividad).
    """
    permission_classes = [permissions.IsAuthenticated]
    LIMITE_HISTORICO = 300

    def get(self, request):
        parcelas = Parcela.objects.filter(agricultor=request.user)

        historico = self._construir_historico(parcelas)
        riego_vs_humedad = self._construir_riego_vs_humedad(parcelas)
        cultivos_productivos = self._construir_cultivos_productivos(parcelas)

        return Response({
            'historico': historico,
            'riego_vs_humedad': riego_vs_humedad,
            'cultivos_productivos': cultivos_productivos,
        }, status=status.HTTP_200_OK)

    def _construir_historico(self, parcelas):
        lecturas = (
            RegistroActividad.objects.filter(
                sublote__parcela__in=parcelas, tipo_actividad=RegistroActividad.SENSORES
            )
            .select_related('sublote', 'sublote__parcela')
            .order_by('fecha_hora')[: self.LIMITE_HISTORICO]
        )
        return [
            {
                'parcela_id': str(lectura.sublote.parcela_id),
                'parcela_nombre': lectura.sublote.parcela.nombre,
                'sublote_id': str(lectura.sublote.id),
                'fecha_hora': lectura.fecha_hora.isoformat(),
                'temperatura': float(lectura.temperatura) if lectura.temperatura is not None else None,
                'humedad': float(lectura.humedad) if lectura.humedad is not None else None,
                'ph': float(lectura.ph) if lectura.ph is not None else None,
            }
            for lectura in lecturas
        ]

    def _construir_riego_vs_humedad(self, parcelas):
        resultado = []
        for parcela in parcelas:
            litros_totales = RegistroActividad.objects.filter(
                sublote__parcela=parcela, tipo_actividad=RegistroActividad.RIEGO
            ).aggregate(total=Sum('litros_riego'))['total'] or 0

            humedad_promedio = RegistroActividad.objects.filter(
                sublote__parcela=parcela, tipo_actividad=RegistroActividad.SENSORES
            ).aggregate(promedio=Avg('humedad'))['promedio']

            resultado.append({
                'parcela_id': str(parcela.id),
                'parcela_nombre': parcela.nombre,
                'litros_riego_totales': float(litros_totales),
                'humedad_promedio': round(float(humedad_promedio), 2) if humedad_promedio is not None else None,
            })
        return resultado

    def _construir_cultivos_productivos(self, parcelas):
        productivos = {}
        parcelas_con_cultivo = parcelas.select_related('cultivo_actual').exclude(cultivo_actual__isnull=True)

        for parcela in parcelas_con_cultivo:
            producto = parcela.cultivo_actual
            litros = RegistroActividad.objects.filter(
                sublote__parcela=parcela, tipo_actividad=RegistroActividad.RIEGO
            ).aggregate(total=Sum('litros_riego'))['total'] or 0

            item = productivos.setdefault(str(producto.id), {
                'producto_id': str(producto.id),
                'nombre': producto.nombre,
                'parcelas_asociadas': 0,
                'litros_riego_totales': 0.0,
            })
            item['parcelas_asociadas'] += 1
            item['litros_riego_totales'] += float(litros)

        return sorted(productivos.values(), key=lambda item: item['litros_riego_totales'], reverse=True)[:5]
