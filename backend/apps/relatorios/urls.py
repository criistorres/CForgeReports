"""
URLs para a API de Relatórios.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RelatorioViewSet, PastaViewSet, FavoritoViewSet

router = DefaultRouter()
router.register(r'relatorios', RelatorioViewSet, basename='relatorio')
router.register(r'pastas', PastaViewSet, basename='pasta')
router.register(r'favoritos', FavoritoViewSet, basename='favorito')

urlpatterns = [
    path('', include(router.urls)),
]
