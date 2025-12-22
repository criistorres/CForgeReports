from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ConfiguracaoEmpresaViewSet

router = DefaultRouter()
router.register(r'configuracoes', ConfiguracaoEmpresaViewSet, basename='configuracoes')

urlpatterns = router.urls
