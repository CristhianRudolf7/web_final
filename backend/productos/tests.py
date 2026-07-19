import pytest
import io
from PIL import Image
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from usuarios.models import Usuario
from .models import Producto

def generate_mock_image():
    """
    Genera un archivo de imagen simple en memoria para pruebas de subida.
    """
    file = io.BytesIO()
    image = Image.new('RGB', size=(100, 100), color=(0, 200, 0))
    image.save(file, 'png')
    file.name = 'test.png'
    file.seek(0)
    return SimpleUploadedFile(file.name, file.read(), content_type='image/png')

@pytest.mark.django_db
class TestProductosCRUD:
    """
    Clase de pruebas de integración para el inventario de productos.
    """

    @pytest.fixture(autouse=True)
    def inicializar(self):
        # Usamos APIClient de DRF para soportar correctamente request formats (json, multipart)
        self.client = APIClient()
        self.url_login = reverse('login')
        self.url_productos_list = reverse('producto-list')

        # Crear Agricultor Propietario
        self.contrasena_prop = 'propietario123'
        self.propietario = Usuario.objects.create_user(
            dni='10101010',
            nombre='Juan',
            apellido='Valdez',
            email='juan.valdez@example.com',
            password=self.contrasena_prop
        )

        # Crear Otro Agricultor
        self.contrasena_otro = 'otro123456'
        self.otro_usuario = Usuario.objects.create_user(
            dni='20202020',
            nombre='Pedro',
            apellido='Páramo',
            email='pedro.paramo@example.com',
            password=self.contrasena_otro
        )

    def test_crear_producto_con_imagen(self):
        """
        Verifica que se pueda crear un producto subiendo una imagen mockeada.
        """
        # Iniciar sesión como el propietario
        login_res = self.client.post(self.url_login, {'dni': '10101010', 'password': self.contrasena_prop}, format='json')
        assert login_res.status_code == status.HTTP_200_OK

        imagen_mock = generate_mock_image()
        datos = {
            'nombre': 'Café Bourbon',
            'descripcion': 'Café arábica suave y aromático.',
            'precio': '24.50',
            'stock': 85,
            'imagen': imagen_mock
        }

        # Enviar petición POST multipart/form-data
        respuesta = self.client.post(self.url_productos_list, datos, format='multipart')
        assert respuesta.status_code == status.HTTP_201_CREATED

        # Verificar aserciones
        assert respuesta.data['nombre'] == 'Café Bourbon'
        assert respuesta.data['precio'] == '24.50'
        assert respuesta.data['stock'] == 85
        assert 'imagenUrl' in respuesta.data
        assert respuesta.data['imagenUrl'] is not None
        assert respuesta.data['agricultorNombre'] == 'Juan Valdez'

    def test_editar_y_borrar_producto_exitoso(self):
        """
        Verifica que el propietario de un producto pueda editarlo y eliminarlo.
        """
        # Crear un producto de prueba
        producto = Producto.objects.create(
            nombre='Yuca Amarilla',
            descripcion='Yuca fresca cosechada en Chanchamayo.',
            precio=3.80,
            stock=150,
            agricultor=self.propietario
        )
        url_detalle = reverse('producto-detail', kwargs={'pk': producto.id})

        # Iniciar sesión como el propietario
        self.client.post(self.url_login, {'dni': '10101010', 'password': self.contrasena_prop}, format='json')

        # 1. Edición (PATCH)
        datos_edicion = {
            'nombre': 'Yuca Amarilla de Selva',
            'stock': 120
        }
        respuesta_edit = self.client.patch(url_detalle, datos_edicion, format='json')
        assert respuesta_edit.status_code == status.HTTP_200_OK
        assert respuesta_edit.data['nombre'] == 'Yuca Amarilla de Selva'
        assert respuesta_edit.data['stock'] == 120

        # 2. Eliminación (DELETE)
        respuesta_delete = self.client.delete(url_detalle)
        assert respuesta_delete.status_code == status.HTTP_204_NO_CONTENT
        assert not Producto.objects.filter(id=producto.id).exists()

    def test_bloqueo_edicion_y_borrado_no_propietario(self):
        """
        Verifica que si otro usuario intenta editar o borrar el producto, se le bloquee con 403 Forbidden.
        """
        # Crear un producto del agricultor propietario
        producto = Producto.objects.create(
            nombre='Miel Pura de Abejas',
            descripcion='Miel natural sin refinar.',
            precio=18.00,
            stock=30,
            agricultor=self.propietario
        )
        url_detalle = reverse('producto-detail', kwargs={'pk': producto.id})

        # Iniciar sesión como el OTRO agricultor
        self.client.post(self.url_login, {'dni': '20202020', 'password': self.contrasena_otro}, format='json')

        # Intentar editar el producto ajeno (PATCH)
        datos_intento = {'stock': 5}
        respuesta_edit = self.client.patch(url_detalle, datos_intento, format='json')
        assert respuesta_edit.status_code == status.HTTP_403_FORBIDDEN

        # Intentar borrar el producto ajeno (DELETE)
        respuesta_delete = self.client.delete(url_detalle)
        assert respuesta_delete.status_code == status.HTTP_403_FORBIDDEN
