from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', auth_views.LoginView.as_view(template_name='login.html'), name='login'),
    path('register/', views.register, name='register'),
    path('productos/', views.productos, name='productos'),
    path('carro/', views.carro, name='carro'),
    path('carro/agregar/<int:comic_id>/', views.agregar_al_carro, name='agregar_al_carro'),
    path('carro/remover/<int:comic_id>/', views.remover_del_carro, name='remover_del_carro'),
    path('logout/', auth_views.LogoutView.as_view(next_page='/'), name='logout'),
    path('get_comics/', views.get_comics, name='get_comics'),
]