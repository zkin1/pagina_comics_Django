# Generated by Django 5.0.6 on 2024-07-03 06:01

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('appComics', '0006_carritoitem_delete_pedidoitem'),
    ]

    operations = [
        migrations.CreateModel(
            name='DetallesPedido',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('comic_nombre', models.CharField(max_length=200)),
                ('cantidad', models.PositiveIntegerField()),
                ('precio_unitario', models.DecimalField(decimal_places=2, max_digits=10)),
                ('pedido', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='detalles', to='appComics.pedido')),
            ],
        ),
    ]