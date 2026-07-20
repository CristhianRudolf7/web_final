import django.db.models.deletion
import django.utils.timezone
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('productos', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Parcela',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=255, verbose_name='Nombre')),
                ('ubicacion', models.CharField(max_length=255, verbose_name='Ubicacion')),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creacion')),
                ('agricultor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='parcelas', to=settings.AUTH_USER_MODEL, verbose_name='Agricultor')),
                ('cultivo_actual', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='parcelas', to='productos.producto', verbose_name='Cultivo actual')),
            ],
            options={
                'verbose_name': 'Parcela',
                'verbose_name_plural': 'Parcelas',
                'db_table': 'parcelas',
                'ordering': ['-fecha_creacion'],
            },
        ),
        migrations.CreateModel(
            name='LecturaSensor',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('temperatura', models.DecimalField(decimal_places=2, max_digits=5, verbose_name='Temperatura')),
                ('humedad', models.DecimalField(decimal_places=2, max_digits=5, verbose_name='Humedad')),
                ('ph', models.DecimalField(decimal_places=2, max_digits=4, verbose_name='pH')),
                ('fecha_registro', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de registro')),
                ('parcela', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='lecturas', to='parcelas.parcela', verbose_name='Parcela')),
            ],
            options={
                'verbose_name': 'Lectura de sensor',
                'verbose_name_plural': 'Lecturas de sensor',
                'db_table': 'lecturas_sensor',
                'ordering': ['-fecha_registro'],
            },
        ),
        migrations.CreateModel(
            name='Sublote',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('poligono', models.JSONField(verbose_name='Poligono')),
                ('ancho_escala', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Ancho real del plano en metros')),
                ('largo_escala', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Largo real del plano en metros')),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creacion')),
                ('parcela', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sublotes', to='parcelas.parcela', verbose_name='Parcela')),
            ],
            options={
                'verbose_name': 'Sublote',
                'verbose_name_plural': 'Sublotes',
                'db_table': 'sublotes',
                'ordering': ['-fecha_creacion'],
            },
        ),
        migrations.CreateModel(
            name='RegistroActividad',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('tipo_actividad', models.CharField(choices=[('riego', 'Riego'), ('sensores', 'Sensores')], max_length=20)),
                ('litros_riego', models.DecimalField(blank=True, decimal_places=2, max_digits=8, null=True)),
                ('temperatura', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('humedad', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('ph', models.DecimalField(blank=True, decimal_places=2, max_digits=4, null=True)),
                ('fecha_hora', models.DateTimeField(default=django.utils.timezone.now)),
                ('sublote', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='actividades', to='parcelas.sublote', verbose_name='Sublote')),
            ],
            options={
                'verbose_name': 'Registro de actividad',
                'verbose_name_plural': 'Registros de actividad',
                'db_table': 'registros_actividad',
                'ordering': ['-fecha_hora'],
            },
        ),
    ]
