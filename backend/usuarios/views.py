from django.conf import settings
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .serializers import LoginSerializer, UsuarioSerializer, RegistroSerializer

class LoginView(APIView):
    """
    Vista para iniciar sesión. Valida credenciales, genera el par de tokens JWT
    e inyecta ambos tokens en cookies HTTP-Only de la respuesta.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        usuario = serializer.validated_data['usuario']
        
        # Generar tokens
        token_refresco = RefreshToken.for_user(usuario)
        token_acceso = token_refresco.access_token

        usuario_serializer = UsuarioSerializer(usuario)
        respuesta = Response(usuario_serializer.data, status=status.HTTP_200_OK)

        # Guardar access token en cookie HttpOnly (validez de 30 minutos)
        respuesta.set_cookie(
            key='access_token',
            value=str(token_acceso),
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            max_age=1800,  # 30 minutos en segundos
            path='/'
        )

        # Guardar refresh token en cookie HttpOnly (validez de 7 días)
        respuesta.set_cookie(
            key='refresh_token',
            value=str(token_refresco),
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            max_age=604800,  # 7 días en segundos
            path='/'
        )

        return respuesta

class LogoutView(APIView):
    """
    Vista para cerrar sesión. Coloca el token de refresco en la lista negra
    y remueve las cookies HttpOnly de la respuesta.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        token_refresco = request.COOKIES.get('refresh_token')
        
        if token_refresco:
            try:
                # Blacklistea el token para invalidarlo en el backend
                token = RefreshToken(token_refresco)
                token.blacklist()
            except TokenError:
                pass

        respuesta = Response({'detalle': 'Sesión cerrada exitosamente.'}, status=status.HTTP_200_OK)
        
        # Borra las cookies asignándoles expiración inmediata
        respuesta.delete_cookie('access_token', path='/')
        respuesta.delete_cookie('refresh_token', path='/')
        
        return respuesta

class TokenRefreshView(APIView):
    """
    Vista para regenerar el access_token y rotar el refresh_token
    utilizando la cookie HttpOnly del cliente.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        token_refresco = request.COOKIES.get('refresh_token')
        
        if not token_refresco:
            return Response({'error': 'No se encontró el refresh token en las cookies.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            token = RefreshToken(token_refresco)
            nuevo_token_acceso = str(token.access_token)
            nuevo_token_refresco = str(token)
        except TokenError:
            return Response({'error': 'El token de refresco ha expirado o es inválido.'}, status=status.HTTP_401_UNAUTHORIZED)
            
        respuesta = Response({'detalle': 'Tokens renovados exitosamente.'}, status=status.HTTP_200_OK)
        
        # Inyecta el nuevo access token de 30 minutos
        respuesta.set_cookie(
            key='access_token',
            value=nuevo_token_acceso,
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            max_age=1800,
            path='/'
        )
        
        # Inyecta el nuevo refresh token rotado de 7 días
        respuesta.set_cookie(
            key='refresh_token',
            value=nuevo_token_refresco,
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            max_age=604800,
            path='/'
        )
        
        return respuesta

class ValidarSesionView(APIView):
    """
    Vista protegida de prueba para validar que el usuario está autenticado
    mediante su cookie HttpOnly de token de acceso.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({'autenticado': True, 'dni': request.user.dni}, status=status.HTTP_200_OK)


class PerfilView(APIView):
    """
    Vista protegida para obtener y actualizar el perfil del usuario autenticado.
    Soporta peticiones GET (obtener perfil), PUT (actualización completa) y PATCH (actualización parcial).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = UsuarioSerializer(request.user, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = UsuarioSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class RegistroView(APIView):
    """
    Vista para registrar un nuevo usuario en la plataforma.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializador = RegistroSerializer(data=request.data)
        if serializador.is_valid():
            usuario = serializador.save()
            usuario_serializador = UsuarioSerializer(usuario)
            return Response(usuario_serializador.data, status=status.HTTP_201_CREATED)
        return Response(serializador.errors, status=status.HTTP_400_BAD_REQUEST)


