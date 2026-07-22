import os
import sys
import django

# Configuración del entorno de Django para ejecución independiente del script
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from datetime import datetime, timedelta
from decimal import Decimal
from django.utils import timezone
from django.contrib.auth import get_user_model
from productos.models import Producto
from parcelas.models import Parcela, LecturaSensor, Sublote, RegistroActividad
from notificaciones.models import Alerta

Usuario = get_user_model()

def limpiar_base_datos():
    print("Limpiando registros antiguos de la base de datos...")
    Alerta.objects.all().delete()
    RegistroActividad.objects.all().delete()
    LecturaSensor.objects.all().delete()
    Sublote.objects.all().delete()
    Parcela.objects.all().delete()
    Producto.objects.all().delete()
    Usuario.objects.all().delete()
    print("Base de datos vaciada correctamente.")

def crear_datos_semilla():
    # 0. Limpiar la base de datos previa
    limpiar_base_datos()

    print("\nIniciando la siembra de datos de prueba con cronología perfecta...")

    ahora = timezone.now()

    # 1. Crear el usuario agricultor principal (DNI: 12345678, Clave: 123456)
    # Fecha de registro del usuario: hace 60 días
    agricultor = Usuario.objects.create_user(
        dni='12345678',
        password='123456',
        nombre='Cristhian',
        apellido='Egoavil',
        email='agricultor@eco.com',
        celular='987654321',
        is_staff=True,
        is_superuser=True
    )
    fecha_usuario = ahora - timedelta(days=60)
    Usuario.objects.filter(pk=agricultor.pk).update(fecha_registro=fecha_usuario)
    print(f"Usuario agricultor creado: DNI {agricultor.dni} (Registrado: {fecha_usuario.strftime('%Y-%m-%d')})")

    # 2. Crear Productos con fechas de creación coherentes (hace 50, 45, 40, 35 días)
    lista_productos_datos = [
        {
            'nombre': 'Piña Orgánica Golden',
            'descripcion': 'Piña jugosa y dulce cultivada con métodos 100% orgánicos sin pesticidas.',
            'precio': Decimal('12.50'),
            'stock': 150,
            'imagen': 'productos/pinia.jpg',
            'dias_atras': 50
        },
        {
            'nombre': 'Manzana Delicia',
            'descripcion': 'Manzana roja crujiente cosechada en el punto óptimo de maduración.',
            'precio': Decimal('6.80'),
            'stock': 300,
            'imagen': 'productos/manzana.jpg',
            'dias_atras': 45
        },
        {
            'nombre': 'Kiwi Especial Premium',
            'descripcion': 'Kiwi fresco rico en vitamina C y nutrientes naturales.',
            'precio': Decimal('14.20'),
            'stock': 90,
            'imagen': 'productos/kiwi.jpg',
            'dias_atras': 40
        },
        {
            'nombre': 'Plátano de Seda',
            'descripcion': 'Plátano de seda suave y dulce seleccionado de los mejores cultivos.',
            'precio': Decimal('4.50'),
            'stock': 500,
            'imagen': 'productos/platano.jpg',
            'dias_atras': 35
        }
    ]

    productos_creados = []
    for datos in lista_productos_datos:
        producto = Producto.objects.create(
            nombre=datos['nombre'],
            descripcion=datos['descripcion'],
            precio=datos['precio'],
            stock=datos['stock'],
            imagen=datos['imagen'],
            agricultor=agricultor
        )
        fecha_prod = ahora - timedelta(days=datos['dias_atras'], hours=4, minutes=10)
        Producto.objects.filter(pk=producto.pk).update(fecha_creacion=fecha_prod)
        productos_creados.append(producto)
        print(f"Producto registrado: {producto.nombre} ({fecha_prod.strftime('%Y-%m-%d %H:%M')})")

    # 3. Configuración cronológica por Parcela
    # Cada parcela se crea en una fecha pasada y sus lecturas/actividades ocurren POSTERIORMENTE a la creación de la parcela.
    configuracion_parcelas = [
        {
            'nombre': 'Fundo San José - Lote Piña',
            'ubicacion': 'Huaral, Lima',
            'cultivo_actual': productos_creados[0],
            'dias_creacion_parcela': 40,
            'dias_creacion_sublote': 38,
            'dias_lecturas': [35, 28, 21, 14, 7],
            'dias_riego': 25,
            'dias_sensores': 12,
            'dias_alerta': 5
        },
        {
            'nombre': 'Valle Fértil - Lote Manzana',
            'ubicacion': 'Cañete, Lima',
            'cultivo_actual': productos_creados[1],
            'dias_creacion_parcela': 30,
            'dias_creacion_sublote': 28,
            'dias_lecturas': [25, 20, 15, 10, 5],
            'dias_riego': 18,
            'dias_sensores': 9,
            'dias_alerta': 3
        },
        {
            'nombre': 'Fundo El Mirador - Lote Kiwi',
            'ubicacion': 'Oxapampa, Pasco',
            'cultivo_actual': productos_creados[2],
            'dias_creacion_parcela': 20,
            'dias_creacion_sublote': 18,
            'dias_lecturas': [16, 13, 10, 7, 3],
            'dias_riego': 12,
            'dias_sensores': 6,
            'dias_alerta': 2
        },
        {
            'nombre': 'Hacienda La Palma - Lote Plátano',
            'ubicacion': 'Satipo, Junín',
            'cultivo_actual': productos_creados[3],
            'dias_creacion_parcela': 10,
            'dias_creacion_sublote': 9,
            'dias_lecturas': [8, 6, 4, 2, 1],
            'dias_riego': 5,
            'dias_sensores': 3,
            'dias_alerta': 1
        }
    ]

    for idx, config in enumerate(configuracion_parcelas):
        # A. Crear Parcela
        fecha_parcela = ahora - timedelta(days=config['dias_creacion_parcela'], hours=2, minutes=30)
        parcela = Parcela.objects.create(
            nombre=config['nombre'],
            agricultor=agricultor,
            ubicacion=config['ubicacion'],
            cultivo_actual=config['cultivo_actual']
        )
        Parcela.objects.filter(pk=parcela.pk).update(fecha_creacion=fecha_parcela)
        print(f"\nParcela registrada: {parcela.nombre} (Creada: {fecha_parcela.strftime('%Y-%m-%d %H:%M')})")

        # B. Crear Sublote con coordenadas JSON normalizadas (polígono pequeño en esquina superior izquierda)
        fecha_sublote = ahora - timedelta(days=config['dias_creacion_sublote'], hours=3, minutes=15)
        sublote = Sublote.objects.create(
            parcela=parcela,
            poligono=[
                {'x': 0.05, 'y': 0.05},
                {'x': 0.35, 'y': 0.05},
                {'x': 0.35, 'y': 0.35},
                {'x': 0.05, 'y': 0.35}
            ],
            ancho_escala=Decimal('100.00'),
            largo_escala=Decimal('100.00')
        )
        Sublote.objects.filter(pk=sublote.pk).update(fecha_creacion=fecha_sublote)

        # C. Crear Lecturas de Sensores cronológicamente posteriores a la creación de la parcela
        for i_lect, dias_atras in enumerate(config['dias_lecturas']):
            fecha_lectura = ahora - timedelta(days=dias_atras, hours=(i_lect * 3 + 1) % 24, minutes=20)
            lectura = LecturaSensor.objects.create(
                parcela=parcela,
                temperatura=Decimal('21.00') + Decimal((idx + 1) * 1.2 + i_lect * 0.7),
                humedad=Decimal('68.00') - Decimal((idx + 1) * 1.8 + i_lect * 1.2),
                ph=Decimal('6.30') + Decimal(i_lect * 0.1)
            )
            LecturaSensor.objects.filter(pk=lectura.pk).update(fecha_registro=fecha_lectura)

        print(f"  └─ 5 Lecturas de sensores registradas entre {config['dias_lecturas'][0]} y {config['dias_lecturas'][-1]} días atrás")

        # D. Registro de Actividad (Riego) posterior a la creación del sublote
        fecha_riego = ahora - timedelta(days=config['dias_riego'], hours=5, minutes=40)
        act_riego = RegistroActividad.objects.create(
            sublote=sublote,
            tipo_actividad=RegistroActividad.RIEGO,
            litros_riego=Decimal('250.00') + Decimal(idx * 40)
        )
        RegistroActividad.objects.filter(pk=act_riego.pk).update(fecha_hora=fecha_riego)

        # E. Registro de Actividad (Sensores) posterior a la creación del sublote
        fecha_sensores = ahora - timedelta(days=config['dias_sensores'], hours=7, minutes=10)
        act_sensores = RegistroActividad.objects.create(
            sublote=sublote,
            tipo_actividad=RegistroActividad.SENSORES,
            temperatura=Decimal('23.20') + Decimal(idx),
            humedad=Decimal('64.00') - Decimal(idx * 2),
            ph=Decimal('6.50') + Decimal(idx * 0.05)
        )
        RegistroActividad.objects.filter(pk=act_sensores.pk).update(fecha_hora=fecha_sensores)

        # F. Alerta posterior a la creación del sublote
        fecha_alerta = ahora - timedelta(days=config['dias_alerta'], hours=1, minutes=5)
        alerta = Alerta.objects.create(
            sublote=sublote,
            titulo=f"Recomendación para {parcela.nombre}",
            tipo=Alerta.TIPO_RECOMENDACION,
            codigo='riego_optimo',
            nivel=Alerta.NIVEL_INFO,
            mensaje='Los niveles de humedad del suelo son óptimos para la etapa actual del cultivo.',
            leida=False
        )
        Alerta.objects.filter(pk=alerta.pk).update(fecha_creacion=fecha_alerta)

        print(f"  └─ Actividades y alerta asociadas al sublote ({fecha_sublote.strftime('%Y-%m-%d')})")

    print("\n¡Sembrado de datos finalizado exitosamente con cronología impecable!")

if __name__ == '__main__':
    crear_datos_semilla()
