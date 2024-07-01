from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from .models import Comic

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

def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('login')
    else:
        form = UserCreationForm()
    return render(request, 'register.html', {'form': form})

def productos(request):
    comics = Comic.objects.all()
    return render(request, 'productos.html', {'comics': comics})

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

def logout_view(request):
    logout(request)
    return redirect('index')
