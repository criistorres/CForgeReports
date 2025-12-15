"""
URLs para a API de Relatórios.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RelatorioViewSet

router = DefaultRouter()
router.register(r'', RelatorioViewSet, basename='relatorio')

urlpatterns = [
    path('', include(router.urls)),
]
