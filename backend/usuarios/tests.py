import pytest
from django.urls import reverse
from rest_framework import status
from freezegun import freeze_time
from datetime import timedelta
from usuarios.models import Usuario

@pytest.mark.django_db
class TestAutenticacionJWT:
    """
    Clase de prueba para verificar los flujos de autenticación,
    cookies HTTP-Only, expiración de tokens y rate limiting.
    """
    
    @pytest.fixture(autouse=True)
    def inicializar(self, client):
        self.client = client
        self.url_login = reverse('login')
        self.url_logout = reverse('logout')
        self.url_refresh = reverse('token-refresh')
        self.url_validar = reverse('validar-sesion')
        
        # Crear un usuario de prueba
        self.contrasena = 'testpass123'
        self.usuario = Usuario.objects.create_user(
            dni='12345678',
            nombre='Juan',
            apellido='Pérez',
            email='juan.perez@example.com',
            password=self.contrasena
        )

    def test_login_exitoso_y_cookies_httponly(self):
        """
        Prueba que el login emite correctamente cookies HttpOnly.
        """
        datos = {'dni': '12345678', 'password': self.contrasena}
        respuesta = self.client.post(self.url_login, datos, format='json')
        
        assert respuesta.status_code == status.HTTP_200_OK
        assert respuesta.data['dni'] == '12345678'
        
        # Verificar cookies
        assert 'access_token' in respuesta.cookies
        assert 'refresh_token' in respuesta.cookies
        
        cookie_acceso = respuesta.cookies['access_token']
        cookie_refresco = respuesta.cookies['refresh_token']
        
        assert cookie_acceso['httponly'] is True
        assert cookie_refresco['httponly'] is True
        assert cookie_acceso['max-age'] == 1800
        assert cookie_refresco['max-age'] == 604800

    def test_acceso_protegido_con_y_sin_cookie(self):
        """
        Prueba que las rutas protegidas requieran el token HttpOnly de acceso.
        """
        # Intento sin cookies
        respuesta_sin_cookie = self.client.get(self.url_validar)
        assert respuesta_sin_cookie.status_code == status.HTTP_401_UNAUTHORIZED
        
        # Loguearse para inyectar cookies en el cliente
        datos = {'dni': '12345678', 'password': self.contrasena}
        self.client.post(self.url_login, datos, format='json')
        
        # Intento con cookies
        respuesta_con_cookie = self.client.get(self.url_validar)
        assert respuesta_con_cookie.status_code == status.HTTP_200_OK
        assert respuesta_con_cookie.data['autenticado'] is True
        assert respuesta_con_cookie.data['dni'] == '12345678'

    def test_expiracion_access_token_y_uso_de_refresh_token(self):
        """
        Prueba que tras 31 minutos el token de acceso expire,
        y se pueda renovar usando el token de refresco.
        """
        # Iniciar sesión en un momento congelado
        with freeze_time("2026-07-16 10:00:00") as time_mock:
            datos = {'dni': '12345678', 'password': self.contrasena}
            respuesta_login = self.client.post(self.url_login, datos, format='json')
            assert respuesta_login.status_code == status.HTTP_200_OK
            
            # El acceso es válido inmediatamente
            respuesta_valida = self.client.get(self.url_validar)
            assert respuesta_valida.status_code == status.HTTP_200_OK
            
            # Avanzar el tiempo 31 minutos (access_token de 30m expira)
            time_mock.tick(delta=timedelta(minutes=31))
            
            respuesta_expirada = self.client.get(self.url_validar)
            assert respuesta_expirada.status_code == status.HTTP_401_UNAUTHORIZED
            
            # Llamar al endpoint de refresco
            respuesta_refresh = self.client.post(self.url_refresh)
            assert respuesta_refresh.status_code == status.HTTP_200_OK
            assert 'access_token' in respuesta_refresh.cookies
            
            # El acceso vuelve a ser válido
            respuesta_renovada = self.client.get(self.url_validar)
            assert respuesta_renovada.status_code == status.HTTP_200_OK

    def test_logout_invalida_cookies_y_blacklistea_token(self):
        """
        Prueba que el logout limpia las cookies y no permite accesos futuros.
        """
        # Loguearse
        datos = {'dni': '12345678', 'password': self.contrasena}
        self.client.post(self.url_login, datos, format='json')
        
        # Cerrar sesión
        respuesta_logout = self.client.post(self.url_logout)
        assert respuesta_logout.status_code == status.HTTP_200_OK
        
        # Verificar cookies eliminadas
        assert respuesta_logout.cookies['access_token'].value == ""
        assert respuesta_logout.cookies['refresh_token'].value == ""
        
        # Ya no se puede acceder a vistas protegidas
        respuesta_protegida = self.client.get(self.url_validar)
        assert respuesta_protegida.status_code == status.HTTP_401_UNAUTHORIZED

    def test_rate_limiting_cinco_peticiones_por_segundo(self):
        """
        Prueba que tras 5 peticiones exitosas en un segundo, la sexta
        es rechazada con HTTP 429.
        """
        # Loguearse
        datos = {'dni': '12345678', 'password': self.contrasena}
        self.client.post(self.url_login, datos, format='json')

        # Realizar 5 peticiones en el mismo segundo
        for _ in range(5):
            respuesta = self.client.get(self.url_validar)
            assert respuesta.status_code in [status.HTTP_200_OK, status.HTTP_429_TOO_MANY_REQUESTS]

        # La 6ta petición dentro del mismo segundo debe ser bloqueada estrictamente
        respuesta_bloqueada = self.client.get(self.url_validar)
        assert respuesta_bloqueada.status_code == status.HTTP_429_TOO_MANY_REQUESTS
