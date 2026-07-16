from django.urls import path
from .views import LoginView, LogoutView, TokenRefreshView, ValidarSesionView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('validar-sesion/', ValidarSesionView.as_view(), name='validar-sesion'),
]
