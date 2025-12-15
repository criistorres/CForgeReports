from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from apps.usuarios.views import CustomTokenObtainPairView, UsuarioViewSet, RegistroPublicoView

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/registrar/', RegistroPublicoView.as_view(), name='registro_publico'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include(router.urls)),
    path('api/', include('apps.conexoes.urls')),
    path('api/relatorios/', include('apps.relatorios.urls')),
]
