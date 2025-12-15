"""
URLs para o app de conexões.
"""
from rest_framework.routers import DefaultRouter
from .views import ConexaoViewSet

router = DefaultRouter()
router.register(r'conexoes', ConexaoViewSet, basename='conexao')

urlpatterns = router.urls
