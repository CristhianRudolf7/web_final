from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    """
    Serializador para exponer los datos estructurados del Usuario en formato JSON.
    """
    class Meta:
        model = Usuario
        fields = ['id', 'dni', 'nombre', 'apellido', 'celular', 'email', 'telegram_chat_id', 'fecha_registro']
        read_only_fields = ['id', 'dni', 'fecha_registro']

class LoginSerializer(serializers.Serializer):
    """
    Serializador para validar el inicio de sesión mediante DNI y contraseña.
    """
    dni = serializers.CharField(max_length=8)
    password = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    def validate(self, datos):
        dni = datos.get('dni')
        password = datos.get('password')

        if dni and password:
            # Dado que USERNAME_FIELD en Usuario es 'dni', authenticate buscará por el campo 'dni'
            usuario = authenticate(request=self.context.get('request'), username=dni, password=password)
            if not usuario:
                raise serializers.ValidationError('No se pudo iniciar sesión con las credenciales proporcionadas.')
        else:
            raise serializers.ValidationError('El DNI y la contraseña son campos requeridos.')

        datos['usuario'] = usuario
        return datos
