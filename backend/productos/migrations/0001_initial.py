import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Producto',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=255)),
                ('descripcion', models.TextField()),
                ('precio', models.DecimalField(decimal_places=2, max_digits=10)),
                ('stock', models.IntegerField()),
                ('imagen', models.ImageField(blank=True, null=True, upload_to='productos/')),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
                ('agricultor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='productos', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'producto',
                'verbose_name_plural': 'productos',
                'db_table': 'productos',
                'ordering': ['-fecha_creacion'],
            },
        ),
    ]
