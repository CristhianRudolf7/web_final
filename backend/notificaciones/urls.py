from django.urls import path
from .views import MarcarNotificacionLeidaView, MarcarTodasLeidasView, NotificacionesListView

urlpatterns = [
    path('notificaciones/', NotificacionesListView.as_view(), name='notificaciones-list'),
    path('notificaciones/<uuid:alerta_id>/leida/', MarcarNotificacionLeidaView.as_view(), name='notificacion-marcar-leida'),
    path('notificaciones/marcar-todas-leidas/', MarcarTodasLeidasView.as_view(), name='notificaciones-marcar-todas'),
]
