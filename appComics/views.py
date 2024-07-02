from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from .models import Comic
from django.db import connection
from django.http import JsonResponse
from django.contrib.auth.models import User
from .models import UsuarioComic
from django import forms
from django.views.decorators.http import require_http_methods
from django.contrib import messages

import json

def productos(request):
    comics = Comic.objects.all()
    return render(request, 'productos.html', {'comics': comics})

def get_comics(request):
    print("Entrando a la vista get_comics") 
    comics = Comic.objects.all()
    data = []
    for comic in comics:
        comic_data = {
            'nombre': comic.nombre,
            'precio': float(comic.precio),
            'foto': comic.foto.url,
            'descripcion': comic.descripcion,
            'stock': comic.stock
        }
        data.append(comic_data)
    print("Datos de los cómics:", data) 
    return JsonResponse(data, safe=False)


def lista_comics(request):
    # Usando objects.all()
    comics = Comic.objects.all()
    
    # Usando una consulta raw
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM appComics_comic WHERE stock > 0")
        comics_en_stock = cursor.fetchall()
    
    return render(request, 'lista_comics.html', {'comics': comics, 'comics_en_stock': comics_en_stock})


def index(request):
    return render(request, 'index.html')

def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('index')
        else:
            return render(request, 'login.html', {'error': 'Credenciales inválidas'})
    return render(request, 'login.html')

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Usuario'})
        self.fields['email'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Correo Electrónico'})
        self.fields['password1'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Contraseña'})
        self.fields['password2'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Confirmar Contraseña'})

def register(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=password)
            login(request, user)
            return redirect('index')
    else:
        form = CustomUserCreationForm()
    return render(request, 'register.html', {'form': form})

@require_http_methods(["GET", "POST"])
def register_view(request):
    if request.method == 'POST':
        if request.content_type == 'application/json':
            data = json.loads(request.body)
            form = CustomUserCreationForm(data)
        else:
            form = CustomUserCreationForm(request.POST)
        
        if form.is_valid():
            user = form.save(commit=False)

            # Crear el objeto UsuarioComic y guardarlo en la base de datos
            usuario_comic = UsuarioComic(
                usuario=user.username,
                correo=user.email,
                contraseña=user.password
            )
            usuario_comic.save()

            user.save()
            login(request, user)
            if request.content_type == 'application/json':
                return JsonResponse({'success': True})
            else:
                messages.success(request, 'Registro exitoso.')
                return redirect('index')
        else:
            if request.content_type == 'application/json':
                errors = form.errors.as_json()
                return JsonResponse({'success': False, 'errors': errors})
            else:
                messages.error(request, 'Error en el registro. Por favor, corrija los errores.')
    else:
        form = CustomUserCreationForm()
    return render(request, 'register.html', {'form': form})


@login_required
def carro(request):
    carrito = request.session.get('carrito', {})
    comics = Comic.objects.filter(id__in=carrito.keys())
    total = sum(item['cantidad'] * Comic.objects.get(id=item['id']).precio for item in carrito.values())
    return render(request, 'carro.html', {'carrito': carrito, 'comics': comics, 'total': total})

@login_required
def agregar_al_carro(request, comic_id):
    comic = get_object_or_404(Comic, id=comic_id)
    carrito = request.session.get('carrito', {})
    if str(comic_id) in carrito:
        carrito[str(comic_id)]['cantidad'] += 1
    else:
        carrito[str(comic_id)] = {'id': comic_id, 'cantidad': 1}
    request.session['carrito'] = carrito
    return redirect('productos')

@login_required
def remover_del_carro(request, comic_id):
    carrito = request.session.get('carrito', {})
    if str(comic_id) in carrito:
        del carrito[str(comic_id)]
    request.session['carrito'] = carrito
    return redirect('carro')

def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)  # Iniciar sesión después de una autenticación exitosa
            return redirect('index')
        else:
            return render(request, 'login.html', {'error': 'Credenciales inválidas'})
    return render(request, 'login.html')
