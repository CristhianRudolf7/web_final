from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed

class CookieJWTAuthentication(JWTAuthentication):
    """
    Backend de autenticación personalizado que extrae el token de acceso JWT
    directamente desde las cookies HTTP-Only de la petición.
    """
    def authenticate(self, request):
        # Intentamos recuperar el token de acceso desde la cookie HttpOnly
        token_acceso = request.COOKIES.get('access_token')
        
        # Fallback opcional: si no existe en la cookie, buscar en la cabecera estándar de autorización
        if not token_acceso:
            cabecera = self.get_header(request)
            if cabecera is None:
                return None
            token_acceso = self.get_raw_token(cabecera)
            
        if token_acceso is None:
            return None

        try:
            # Validamos el token y recuperamos el usuario asociado
            token_validado = self.get_validated_token(token_acceso)
            usuario = self.get_user(token_validado)
            return usuario, token_validado
        except (InvalidToken, AuthenticationFailed):
            return None
