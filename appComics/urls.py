from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register, name='register'),
    path('productos/', views.productos, name='productos'),
    path('carro/', views.carro, name='carro'),
    path('carro/agregar/<int:comic_id>/', views.agregar_al_carro, name='agregar_al_carro'),
    path('carro/remover/<int:comic_id>/', views.remover_del_carro, name='remover_del_carro'),
    path('logout/', views.logout_view, name='logout'),
]