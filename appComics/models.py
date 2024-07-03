from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify

class Comic(models.Model):
    nombre = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(null=True, blank=True)
    foto = models.ImageField(upload_to='comics/', default='/img')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nombre)
            counter = 1
            while Comic.objects.filter(slug=self.slug).exists():
                self.slug = f"{slugify(self.nombre)}-{counter}"
                counter += 1
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nombre

class UsuarioComic(models.Model):
    usuario = models.CharField(max_length=100)
    correo = models.EmailField()
    contraseña = models.CharField(max_length=100)

    def __str__(self):
        return self.usuario

class Pedido(models.Model):
    nombre_completo = models.CharField(max_length=200)
    telefono = models.CharField(max_length=15)
    direccion = models.TextField()
    EFECTIVO = 'EF'
    DEBITO = 'DE'
    CREDITO = 'CR'
    TRANSFERENCIA = 'TR'
    FORMA_PAGO_CHOICES = [
        (EFECTIVO, 'Efectivo'),
        (DEBITO, 'Débito'),
        (CREDITO, 'Crédito'),
        (TRANSFERENCIA, 'Transferencia'),
    ]
    forma_pago = models.CharField(
        max_length=2,
        choices=FORMA_PAGO_CHOICES,
        default=EFECTIVO,
    )

    def __str__(self):
        return f"{self.nombre_completo} - {self.get_forma_pago_display()}"
    
class CarritoItem(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    comic = models.ForeignKey(Comic, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('usuario', 'comic')


class DetallesPedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='detalles')
    comic_nombre = models.CharField(max_length=200)
    cantidad = models.PositiveIntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.comic_nombre} - {self.cantidad} unidades"

    def subtotal(self):
        return self.cantidad * self.precio_unitario