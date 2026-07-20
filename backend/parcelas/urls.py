from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ActividadesSubloteView,
    ExportarDatosView,
    HistoricoLecturasView,
    IngestaMasivaSensoresView,
    ParcelaViewSet,
    SublotesParcelaView,
    UltimoEstadoSubloteView,
)

router = DefaultRouter()
router.register(r'parcelas', ParcelaViewSet, basename='parcelas')

urlpatterns = [
    path('', include(router.urls)),
    path(
        'parcelas/<uuid:parcela_id>/historico/',
        HistoricoLecturasView.as_view(),
        name='parcela-historico',
    ),
    path(
        'parcelas/<uuid:parcela_id>/exportar/',
        ExportarDatosView.as_view(),
        name='parcela-exportar',
    ),
    path(
        'parcelas/<uuid:parcela_id>/sublotes/',
        SublotesParcelaView.as_view(),
        name='parcela-sublotes',
    ),
    path(
        'sublotes/<uuid:sublote_id>/actividades/',
        ActividadesSubloteView.as_view(),
        name='sublote-actividades',
    ),
    path(
        'sublotes/<uuid:sublote_id>/ultimo-estado/',
        UltimoEstadoSubloteView.as_view(),
        name='sublote-ultimo-estado',
    ),
    path(
        'sensores/ingesta-masiva/',
        IngestaMasivaSensoresView.as_view(),
        name='sensores-ingesta-masiva',
    ),
]
