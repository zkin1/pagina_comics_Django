# Generated by Django 5.0.6 on 2024-07-03 04:37

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('appComics', '0006_carritoitem_delete_pedidoitem'),
    ]

    operations = [
        migrations.AddField(
            model_name='carritoitem',
            name='fecha_agregado',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
