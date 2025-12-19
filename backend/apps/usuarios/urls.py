from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomTokenObtainPairView,
    RegistroPublicoView,
    UsuarioViewSet,
    CargoViewSet,
    DepartamentoViewSet
)

router = DefaultRouter()
router.register('cargos', CargoViewSet, basename='cargos')
router.register('departamentos', DepartamentoViewSet, basename='departamentos')
router.register('', UsuarioViewSet, basename='usuarios')

urlpatterns = [
    path('', include(router.urls)),
]
