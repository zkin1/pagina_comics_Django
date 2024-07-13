from django.urls import path
from . import views
from .views import remove_cart_item
from .views import update_cart_item_quantity
from .views import get_cart_item_count
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin_comics/', views.admin_comics, name='admin_comics'),
    path('', views.index, name='index'),
    path('productos/', views.productos, name='productos'),
    path('productos/get_comics/', views.get_comics, name='get_comics'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('carro/', views.carro, name='carro'),
    path('carro/get_items/', views.get_cart_items, name='get_cart_items'),
    path('carro/count/', get_cart_item_count, name='get_cart_item_count'),
    path('carro/add_item/', views.add_to_cart, name='add_to_cart'),
    path('logout/', views.logout_view, name='logout'),
    path('carro/update_quantity/', views.update_cart_item_quantity, name='update_cart_item_quantity'),
    path('check-login-status/', views.check_login_status, name='check_login_status'),
    path('carro/remove_item/', views.remove_cart_item, name='remove_cart_item'),
    path('envio/', views.envio, name='envio'),
    path('admin_comics/', views.admin_comics, name='admin_comics'),
    path('submit_envio/', views.submit_envio, name='submit_envio'),
    path('carro/get_item_count/', views.get_item_count, name='get_item_count')
    
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)