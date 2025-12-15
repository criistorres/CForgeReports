from rest_framework import viewsets, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Usuario
from .serializers import CustomTokenObtainPairSerializer, UsuarioSerializer, RegistroPublicoSerializer
from core.mixins import EmpresaQuerySetMixin
from core.permissions import IsAdmin


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


class RegistroPublicoView(views.APIView):
    """View para cadastro público de nova empresa + admin"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistroPublicoSerializer(data=request.data)

        if serializer.is_valid():
            # Criar empresa + admin
            usuario = serializer.save()

            # Gerar tokens JWT para auto-login
            refresh = RefreshToken.for_user(usuario)
            refresh['empresa_id'] = str(usuario.empresa_id)
            refresh['empresa_nome'] = usuario.empresa.nome
            refresh['role'] = usuario.role
            refresh['nome'] = usuario.nome

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': str(usuario.id),
                    'nome': usuario.nome,
                    'email': usuario.email,
                    'role': usuario.role,
                    'empresa_id': str(usuario.empresa_id),
                    'empresa_nome': usuario.empresa.nome,
                }
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UsuarioViewSet(EmpresaQuerySetMixin, viewsets.ModelViewSet):
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Usuario.objects.filter(empresa_id=self.request.user.empresa_id)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
