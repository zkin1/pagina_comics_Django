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

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    direccion_envio = models.CharField(max_length=255, blank=True)
    telefono = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.user.username

class UsuarioComic(models.Model):
    usuario = models.CharField(max_length=100)
    correo = models.EmailField()
    contraseña = models.CharField(max_length=100)

    def __str__(self):
        return self.usuario