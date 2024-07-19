from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required, user_passes_test
from django.views.decorators.http import require_POST, require_http_methods, require_GET
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib import messages
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.core.paginator import Paginator
from django.db.models import Q, Sum
from django.core.mail import send_mail
from django.contrib.auth.views import LoginView
from django.contrib.admin.views.decorators import staff_member_required
from django.conf import settings
from django.urls import reverse_lazy
from .models import Comic, UsuarioComic, CarritoItem, Pedido, DetallesPedido
from .forms import ComicForm, CustomUserCreationForm
import json
import traceback
import logging

logger = logging.getLogger(__name__)

@login_required
@require_POST
def add_to_cart(request):
    try:
        data = json.loads(request.body)
        comic_name = data.get('comicName')
        quantity = int(data.get('quantity', 1))
        
        if not comic_name:
            return JsonResponse({'success': False, 'error': 'Datos incompletos'}, status=400)
        
        comic = get_object_or_404(Comic, nombre=comic_name)
        
        cart_item, created = CarritoItem.objects.get_or_create(
            usuario=request.user,
            comic=comic,
            defaults={'cantidad': 0}
        )
        
        new_quantity = cart_item.cantidad + quantity
        if new_quantity > comic.stock:
            return JsonResponse({'success': False, 'error': 'Stock insuficiente'}, status=400)
        
        cart_item.cantidad = new_quantity
        cart_item.save()
        
        cart = request.session.get('cart', {})
        cart[comic_name] = {
            'precio': int(comic.precio),
            'foto': comic.foto.url,
            'quantity': new_quantity,
            'stock': comic.stock
        }
        request.session['cart'] = cart
        request.session.modified = True
        
        total_items = CarritoItem.objects.filter(usuario=request.user).aggregate(
            total=Sum('cantidad'))['total'] or 0
        
        return JsonResponse({
            'success': True,
            'message': 'Item agregado al carrito',
            'total_items': total_items
        })
    except Exception as e:
        logger.error(f"Error en add_to_cart: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

def logout_view(request):
    logout(request)
    return redirect('index')

def productos(request):
    search_query = request.GET.get('search', '')
    comics = Comic.objects.all()

    if search_query:
        comics = comics.filter(
            Q(nombre__icontains=search_query) | 
            Q(descripcion__icontains=search_query)
        )

    paginator = Paginator(comics, 10)  # 10 cómics por página
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'page_obj': page_obj,
        'search_query': search_query
    }

    return render(request, 'productos.html', context)

def get_comics(request):
    comics = Comic.objects.all()
    data = [{
        'id': comic.id,
        'nombre': comic.nombre,
        'precio': int(comic.precio),
        'foto': f'/static/img/{comic.foto.name.split("/")[-1]}' if comic.foto else '/static/img/default.jpg',
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
            
            cart_items = CarritoItem.objects.filter(usuario=user)
            cart = {}
            for item in cart_items:
                cart[item.comic.nombre] = {
                    'precio': int(item.comic.precio),
                    'foto': item.comic.foto.url,
                    'quantity': item.cantidad,
                    'stock': item.comic.stock
                }
            request.session['cart'] = cart
            request.session.modified = True
            
            if request.content_type == 'application/json':
                return JsonResponse({'success': True, 'username': user.username})
            else:
                return redirect('index')
        else:
            if request.content_type == 'application/json':
                return JsonResponse({'success': False, 'error': 'Credenciales incorrectas'}, status=400)
            else:
                return render(request, 'login.html', {'error': 'Credenciales incorrectas'})
    
    return render(request, 'login.html')

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
        print(f"Error in get_item_count: {str(e)}")
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
            
            CarritoItem.objects.filter(usuario=request.user, comic__nombre=comic_name).delete()
            
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
        print(f"Error en remove_cart_item: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@login_required
@require_POST
def update_cart_item_quantity(request):
    try:
        data = json.loads(request.body)
        comic_name = data.get('nombre')
        new_quantity = int(data.get('quantity'))
        
        if not comic_name or new_quantity is None:
            return JsonResponse({'success': False, 'error': 'Datos incompletos'}, status=400)
        
        try:
            comic = Comic.objects.get(nombre=comic_name)
        except Comic.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Comic no encontrado'}, status=404)
        
        cart = request.session.get('cart', {})
        
        if comic_name in cart:
            if new_quantity > comic.stock:
                new_quantity = comic.stock
            
            cart[comic_name]['quantity'] = new_quantity
            request.session['cart'] = cart
            request.session.modified = True
            
            CarritoItem.objects.filter(usuario=request.user, comic=comic).update(cantidad=new_quantity)
            
            cart_items = []
            for nombre, item in cart.items():
                cart_items.append({
                    'nombre': nombre,
                    'precio': item['precio'],
                    'foto': item['foto'],
                    'quantity': item['quantity'],
                    'subtotal': item['precio'] * item['quantity'],
                    'stock': Comic.objects.get(nombre=nombre).stock
                })
            
            return JsonResponse({'success': True, 'cart_items': cart_items})
        else:
            return JsonResponse({'success': False, 'error': 'El cómic no existe en el carrito'}, status=404)
    except Exception as e:
        print(f"Error en update_cart_item_quantity: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

def envio(request):
    return render(request, 'envio.html')

@login_required
@require_POST
@csrf_exempt
def submit_envio(request):
    try:
        logger.info("Iniciando submit_envio")
        data = {
            'nombre_completo': request.POST.get('nombre_completo'),
            'telefono': request.POST.get('telefono'),
            'direccion': request.POST.get('direccion'),
            'forma_pago': request.POST.get('forma_pago')
        }
        logger.info(f"Datos recibidos: {data}")
        for field, value in data.items():
            if not value:
                logger.warning(f"Campo requerido faltante: {field}")
                return JsonResponse({'success': False, 'error': f'Campo requerido: {field}'}, status=400)
        pedido = Pedido.objects.create(**data)
        logger.info(f"Pedido creado con ID: {pedido.id}")
        cart_items = json.loads(request.POST.get('cart_items', '[]'))
        logger.info(f"Items del carrito recibidos: {cart_items}")
        if not cart_items:
            logger.warning("No se encontraron items en el carrito")
            return JsonResponse({'success': False, 'error': 'No se encontraron items en el carrito'}, status=400)
        for item in cart_items:
            comic_nombre = item.get('nombre')
            cantidad = item.get('quantity')
            precio_unitario = item.get('precio')
            if not comic_nombre or not cantidad or not precio_unitario:
                logger.warning(f"Datos incompletos para el item: {item}")
                continue
            DetallesPedido.objects.create(
                pedido=pedido,
                comic_nombre=comic_nombre,
                cantidad=cantidad,
                precio_unitario=precio_unitario
            )
        user_email = request.user.email
        logger.info(f"Correo del usuario: {user_email}")
        subject = 'Confirmación de pedido'
        message = f"""
            Gracias por tu pedido, {data['nombre_completo']}!
            Detalles del pedido:
            Dirección de envío: {data['direccion']}
            Teléfono: {data['telefono']}
            Forma de pago: {pedido.get_forma_pago_display()}
            Cómics comprados:
        """
        from django.contrib.humanize.templatetags.humanize import intcomma
        for detalle in pedido.detalles.all():
            precio_unitario_formateado = intcomma(int(float(detalle.precio_unitario)))
            message += f"""
            - {detalle.comic_nombre} (Cantidad: {detalle.cantidad}, Precio unitario: ${precio_unitario_formateado})
            """
        message += """
            Nos pondremos en contacto contigo pronto para confirmar el envío.
        """
        from_email = settings.EMAIL_HOST_USER
        recipient_list = [user_email]
        logger.info("Enviando correo electrónico")
        send_mail(subject, message, from_email, recipient_list)
        logger.info("Correo electrónico enviado con éxito")
        request.session['cart'] = {}
        request.session.modified = True
        return JsonResponse({'success': True})
    except Exception as e:
        logger.error(f"Error en submit_envio: {str(e)}")
        logger.error(traceback.format_exc())
        return JsonResponse({'success': False, 'error': 'Error interno del servidor'}, status=500)

@ensure_csrf_cookie
def index(request):
    return render(request, 'index.html')

@login_required
@user_passes_test(lambda u: u.is_staff)
def edit_comic(request, comic_id):
    comic = get_object_or_404(Comic, id=comic_id)
    if request.method == 'POST':
        form = ComicForm(request.POST, request.FILES, instance=comic)
        if form.is_valid():
            form.save()
            return redirect('productos')
    else:
        form = ComicForm(instance=comic)
    return render(request, 'edit_comic.html', {'form': form, 'comic': comic})

@login_required
@user_passes_test(lambda u: u.is_staff)
def delete_comic(request, comic_id):
    comic = get_object_or_404(Comic, id=comic_id)
    if request.method == 'POST':
        comic.delete()
        return redirect('productos')
    

@staff_member_required(login_url='admin:login')
def admin_comics(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        return redirect('admin:login')
    comics = Comic.objects.all()
    return render(request, 'admin_comics.html', {'comics': comics})


class AdminLoginView(LoginView):
    template_name = 'admin/login.html'
    
    def get_success_url(self):
        return reverse_lazy('admin_comics')
    
    def form_valid(self, form):
        response = super().form_valid(form)
        if self.request.user.is_staff:
            return response
        else:
            messages.error(self.request, "No tienes permisos de administrador.")
            self.request.session.flush()
            return redirect('admin:login')
        

@login_required
@user_passes_test(lambda u: u.is_staff)
def edit_comic(request, comic_id):
    comic = get_object_or_404(Comic, id=comic_id)
    if request.method == 'POST':
        form = ComicForm(request.POST, request.FILES, instance=comic)
        if form.is_valid():
            form.save()
            return redirect('productos')
    else:
        form = ComicForm(instance=comic)
    return render(request, 'edit_comic.html', {'form': form, 'comic': comic})

def get_comic_details(request, comic_id):
    comic = get_object_or_404(Comic, id=comic_id)
    data = {
        'id': comic.id,
        'nombre': comic.nombre,
        'descripcion': comic.descripcion,
        'precio': str(comic.precio),
        'stock': comic.stock,
        'foto': comic.foto.url if comic.foto else ''
    }
    return JsonResponse(data)

@require_POST
def update_comic(request, comic_id):
    comic = get_object_or_404(Comic, id=comic_id)
    form = ComicForm(request.POST, request.FILES, instance=comic)
    if form.is_valid():
        comic = form.save()
        return JsonResponse({
            'success': True,
            'comic': {
                'id': comic.id,
                'nombre': comic.nombre,
                'descripcion': comic.descripcion,
                'precio': str(comic.precio),
                'stock': comic.stock,
                'foto': comic.foto.url if comic.foto else ''
            }
        })
    return JsonResponse({'success': False, 'errors': form.errors})

@require_POST
@login_required
@user_passes_test(lambda u: u.is_staff)
def delete_comic(request, comic_id):
    comic = get_object_or_404(Comic, id=comic_id)
    comic.delete()
    return JsonResponse({'success': True})

@require_POST
@login_required
@user_passes_test(lambda u: u.is_staff)
@csrf_exempt
def create_comic(request):
    if request.method == 'POST':
        nombre = request.POST.get('nombre')
        descripcion = request.POST.get('descripcion')
        precio = request.POST.get('precio')
        stock = request.POST.get('stock')
        foto = request.FILES.get('foto')

        if not nombre or not precio or not stock:
            return render(request, 'error.html', {'error': 'Todos los campos son obligatorios'})

        try:
            precio = float(precio)
            stock = int(stock)
        except ValueError:
            return render(request, 'error.html', {'error': 'Precio y stock deben ser números válidos'})

        comic = Comic(
            nombre=nombre,
            descripcion=descripcion,
            precio=precio,
            stock=stock,
            foto=foto
        )
        comic.save()

        return redirect('admin_comics')

    return render(request, 'create_comic.html')




@staff_member_required(login_url='admin:login')
def admin_comics(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        return redirect('admin:login')
    comics = Comic.objects.all()
    return render(request, 'admin_comics.html', {'comics': comics})