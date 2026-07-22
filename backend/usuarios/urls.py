from django.urls import path
from .views import LoginView, LogoutView, TokenRefreshView, ValidarSesionView, PerfilView, RegistroView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('registro/', RegistroView.as_view(), name='registro'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('validar-sesion/', ValidarSesionView.as_view(), name='validar-sesion'),
    path('perfil/', PerfilView.as_view(), name='perfil'),
]
