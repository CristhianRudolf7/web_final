import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UsuarioManager(BaseUserManager):
    """
    Gestor personalizado para el modelo de Usuario utilizando el DNI como identificador.
    """
    def create_user(self, dni, nombre, apellido, email, password=None, **campos_adicionales):
        if not dni:
            raise ValueError('El DNI es obligatorio')
        if not email:
            raise ValueError('El correo electrónico es obligatorio')
        
        email = self.normalize_email(email)
        usuario = self.model(
            dni=dni,
            nombre=nombre,
            apellido=apellido,
            email=email,
            **campos_adicionales
        )
        usuario.set_password(password)
        usuario.save(using=self._db)
        return usuario

    def create_superuser(self, dni, nombre, apellido, email, password=None, **campos_adicionales):
        campos_adicionales.setdefault('is_staff', True)
        campos_adicionales.setdefault('is_superuser', True)

        if campos_adicionales.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if campos_adicionales.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')

        return self.create_user(dni, nombre, apellido, email, password, **campos_adicionales)

class Usuario(AbstractBaseUser, PermissionsMixin):
    """
    Modelo de Usuario personalizado que utiliza UUIDs como clave primaria
    y DNI como credencial de acceso principal.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dni = models.CharField(max_length=8, unique=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    celular = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(unique=True)
    telegram_chat_id = models.CharField(
        max_length=64, blank=True, null=True,
        help_text='Chat ID de Telegram vinculado para recibir alertas críticas.'
    )
    
    # Atributos booleanos requeridos por el contrato de autenticación de Django
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    objects = UsuarioManager()

    USERNAME_FIELD = 'dni'
    REQUIRED_FIELDS = ['nombre', 'apellido', 'email']

    class Meta:
        verbose_name = 'usuario'
        verbose_name_plural = 'usuarios'
        db_table = 'usuarios'

    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.dni})"
