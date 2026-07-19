from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ExportarDatosView, HistoricoLecturasView, ParcelaViewSet

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
]
