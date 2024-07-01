from django.urls import path
from django.contrib.auth import views as auth_views
from . import views
from .views import register_view
urlpatterns = [
    path('', views.index, name='index'),  # Página principal
    path('productos/', views.productos, name='productos'),  # Lista de productos
    path('productos/get_comics/', views.get_comics, name='get_comics'),  # Obtener cómics
    path('login/', auth_views.LoginView.as_view(template_name='login.html'), name='login'),  # Página de login
    path('register/', register_view, name='register'),  # Página de registro
    path('carro/', views.carro, name='carro'),  # Página del carro de compras
    path('carro/agregar/<int:comic_id>/', views.agregar_al_carro, name='agregar_al_carro'),  # Agregar al carro
    path('carro/remover/<int:comic_id>/', views.remover_del_carro, name='remover_del_carro'),  # Remover del carro
    path('logout/', auth_views.LogoutView.as_view(next_page='/'), name='logout'),  # Cerrar sesión
]
