from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from apps.usuarios.views import CustomTokenObtainPairView, RegistroPublicoView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/registrar/', RegistroPublicoView.as_view(), name='registro_publico'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/usuarios/', include('apps.usuarios.urls')),
    path('api/', include('apps.conexoes.urls')),
    path('api/', include('apps.relatorios.urls')),
    path('api/', include('apps.execucoes.urls')),
    path('api/', include('apps.empresas.urls')),
]

