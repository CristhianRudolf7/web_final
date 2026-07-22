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

class RegistroSerializer(serializers.ModelSerializer):
    """
    Serializador para el registro de nuevos usuarios en la plataforma.
    """
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    celular = serializers.CharField(required=True, max_length=15)
    password = serializers.CharField(write_only=True, min_length=6)
    confirmar_password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = Usuario
        fields = ['dni', 'nombre', 'apellido', 'email', 'celular', 'password', 'confirmar_password']

    def validate(self, datos):
        if datos.get('password') != datos.get('confirmar_password'):
            raise serializers.ValidationError({'password': 'Las contraseñas no coinciden.'})
        # Si el correo viene vacío o como string con espacios, convertirlo a None para evitar violaciones de unique constraint
        email = datos.get('email')
        if not email or not str(email).strip():
            datos['email'] = None
        return datos

    def create(self, datos_validados):
        datos_validados.pop('confirmar_password')
        password = datos_validados.pop('password')
        usuario = Usuario.objects.create_user(password=password, **datos_validados)
        return usuario

