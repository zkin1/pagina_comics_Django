from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST, require_http_methods
from django.views.decorators.http import require_GET
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib import messages
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import Comic, UsuarioComic
from django import forms
import json

@login_required
@require_POST
def add_to_cart(request):
    try:
        data = json.loads(request.body)
        comic_name = data.get('comicName')
        quantity = data.get('quantity', 1)
        
        if not comic_name:
            return JsonResponse({'success': False, 'error': 'Datos incompletos'}, status=400)
        
        try:
            comic = Comic.objects.get(nombre=comic_name)
        except Comic.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Comic no encontrado'}, status=404)
        
        if quantity > comic.stock:
            return JsonResponse({'success': False, 'error': 'Stock insuficiente'}, status=400)
        
        cart = request.session.get('cart', {})
        
        if comic_name in cart:
            cart[comic_name]['quantity'] += quantity
        else:
            cart[comic_name] = {
                'precio': float(comic.precio),
                'foto': comic.foto.url,
                'quantity': quantity
            }
        
        comic.stock -= quantity
        comic.save()
        
        request.session['cart'] = cart
        request.session.modified = True
        
        total_items = sum(item['quantity'] for item in cart.values())
        
        return JsonResponse({
            'success': True,
            'message': 'Item agregado al carrito',
            'total_items': total_items
        })
    except Exception as e:
        print(f"Error en add_to_cart: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


def logout_view(request):
    logout(request)
    return redirect('index')

def productos(request):
    comics = Comic.objects.all()
    return render(request, 'productos.html', {'comics': comics})

def get_comics(request):
    comics = Comic.objects.all()
    data = [{
        'nombre': comic.nombre,
        'precio': float(comic.precio),
        'foto': comic.foto.url,
        'descripcion': comic.descripcion,
        'stock': comic.stock
    } for comic in comics]
    return JsonResponse(data, safe=False)

@require_GET
def check_login_status(request):
    return JsonResponse({
        'is_authenticated': request.user.is_authenticated,
        'username': request.user.username if request.user.is_authenticated else None
    })

@require_http_methods(["GET", "POST"])
def login_view(request):
    if request.method == 'POST':
        if request.content_type == 'application/json':
            data = json.loads(request.body)
            username = data.get('usuario')
            password = data.get('contraseña')
        else:
            username = request.POST.get('username')
            password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            if request.content_type == 'application/json':
                return JsonResponse({'success': True, 'username': user.username})
            else:
                return redirect('index')  # Redirige a la página principal después del login
        else:
            if request.content_type == 'application/json':
                return JsonResponse({'success': False, 'error': 'Credenciales incorrectas'}, status=400)
            else:
                return render(request, 'login.html', {'error': 'Credenciales incorrectas'})
    
    return render(request, 'login.html')

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update({'class': 'form-control', 'placeholder': field.capitalize()})

@require_http_methods(["GET", "POST"])
def register_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(json.loads(request.body) if request.content_type == 'application/json' else request.POST)
        
        if form.is_valid():
            user = form.save()
            UsuarioComic.objects.create(
                usuario=user.username,
                correo=user.email,
                contraseña=user.password
            )
            login(request, user)
            return JsonResponse({'success': True}) if request.content_type == 'application/json' else redirect('index')
        else:
            return JsonResponse({'success': False, 'errors': form.errors.as_json()}) if request.content_type == 'application/json' else render(request, 'register.html', {'form': form})
    else:
        form = CustomUserCreationForm()
    return render(request, 'register.html', {'form': form})

@login_required
def carro(request):
    cart = request.session.get('cart', {})
    return render(request, 'carro.html', {'cart': cart})

def get_item_count(request):
    try:
        cart = request.session.get('cart', {})
        count = sum(item.get('quantity', 0) for item in cart.values())
        return JsonResponse({'count': count})
    except Exception as e:
        print(f"Error in get_item_count: {str(e)}")  # Para depuración
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def get_cart_items(request):
    cart = request.session.get('cart', {})
    cart_items = []
    for nombre, item in cart.items():
        cart_items.append({
            'nombre': nombre,
            'precio': item['precio'],
            'foto': item['foto'],
            'quantity': item['quantity'],
            'subtotal': item['precio'] * item['quantity']
        })
    return JsonResponse({'cart_items': cart_items})


def get_cart_item_count(request):
    cart = request.session.get('cart', {})
    count = sum(item['quantity'] for item in cart.values())
    return JsonResponse({'count': count})

@login_required
@require_POST
def remove_cart_item(request):
    try:
        data = json.loads(request.body)
        comic_name = data.get('nombre')
        
        if not comic_name:
            return JsonResponse({'success': False, 'error': 'Nombre del cómic no proporcionado'}, status=400)
        
        cart = request.session.get('cart', {})
        
        if comic_name in cart:
            del cart[comic_name]
            request.session['cart'] = cart
            request.session.modified = True
            
            cart_items = []
            for nombre, item in cart.items():
                cart_items.append({
                    'nombre': nombre,
                    'precio': item['precio'],
                    'foto': item['foto'],
                    'quantity': item['quantity'],
                    'subtotal': item['precio'] * item['quantity']
                })
            
            return JsonResponse({'success': True, 'cart_items': cart_items})
        else:
            return JsonResponse({'success': False, 'error': 'El cómic no existe en el carrito'}, status=404)
    except Exception as e:
        print(f"Error en remove_cart_item: {str(e)}")  # Para depuración
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@login_required
@require_POST
def update_cart_item_quantity(request):
    try:
        data = json.loads(request.body)
        comic_name = data.get('nombre')
        quantity = data.get('quantity')
        
        if not comic_name or not quantity:
            return JsonResponse({'success': False, 'error': 'Datos incompletos'}, status=400)
        
        try:
            comic = Comic.objects.get(nombre=comic_name)
        except Comic.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Comic no encontrado'}, status=404)
        
        cart = request.session.get('cart', {})
        
        if comic_name in cart:
            current_quantity = cart[comic_name]['quantity']
            new_quantity = quantity
            
            if new_quantity > comic.stock + current_quantity:
                return JsonResponse({'success': False, 'error': 'Stock insuficiente'}, status=400)
            
            comic.stock += current_quantity - new_quantity
            comic.save()
            
            cart[comic_name]['quantity'] = new_quantity
            request.session['cart'] = cart
            request.session.modified = True
            
            cart_items = []
            for nombre, item in cart.items():
                cart_items.append({
                    'nombre': nombre,
                    'precio': item['precio'],
                    'foto': item['foto'],
                    'quantity': item['quantity'],
                    'subtotal': item['precio'] * item['quantity']
                })
            
            return JsonResponse({'success': True, 'cart_items': cart_items})
        else:
            return JsonResponse({'success': False, 'error': 'El cómic no existe en el carrito'}, status=404)
    except Exception as e:
        print(f"Error en update_cart_item_quantity: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@ensure_csrf_cookie
def index(request):
    return render(request, 'index.html')