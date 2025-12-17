"""
URLs para a API de Execuções/Histórico.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HistoricoViewSet

router = DefaultRouter()
router.register(r'historico', HistoricoViewSet, basename='historico')

urlpatterns = [
    path('', include(router.urls)),
]
