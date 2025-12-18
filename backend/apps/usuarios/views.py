from rest_framework import viewsets, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.utils import timezone
from .models import Usuario
from .serializers import (
    CustomTokenObtainPairSerializer, 
    RegistroPublicoSerializer, 
    UsuarioListSerializer, 
    UsuarioCreateSerializer, 
    UsuarioUpdateSerializer, 
    UsuarioDetailSerializer
)
from .permissions import IsAdmin, CannotDeactivateSelf, MustKeepOneAdmin


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

            return Response({
                'detail': 'Empresa e usuário criados com sucesso!'
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UsuarioViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciamento de usuários"""
    permission_classes = [IsAuthenticated, IsAdmin, CannotDeactivateSelf, MustKeepOneAdmin]
    
    def get_queryset(self):
        """Retorna apenas usuários da empresa do admin"""
        if getattr(self.request.user, 'empresa', None):
            return Usuario.objects.filter(
                empresa=self.request.user.empresa
            ).select_related('criado_por').order_by('-criado_em')
        return Usuario.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UsuarioListSerializer
        elif self.action == 'create':
            return UsuarioCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UsuarioUpdateSerializer
        return UsuarioDetailSerializer
    
    @action(detail=True, methods=['post'])
    def desativar(self, request, pk=None):
        """Desativa um usuário (RN02, RN03)"""
        usuario = self.get_object()
        
        if not usuario.pode_ser_desativado():
            return Response(
                {'detail': 'Não é possível desativar este usuário'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        usuario.ativo = False
        usuario.save()
        
        return Response(
            UsuarioDetailSerializer(usuario).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def reativar(self, request, pk=None):
        """Reativa um usuário desativado"""
        usuario = self.get_object()
        
        # Verifica limite de usuários (RN05)
        if usuario.empresa and usuario.empresa.usuarios.filter(ativo=True).count() >= usuario.empresa.max_usuarios:
            return Response(
                {'detail': f'Limite de {usuario.empresa.max_usuarios} usuários atingido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        usuario.ativo = True
        if not usuario.ativado_em:
            usuario.ativado_em = timezone.now()
        usuario.save()
        
        return Response(
            UsuarioDetailSerializer(usuario).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def reenviar_convite(self, request, pk=None):
        """Reenvia email de convite para usuário pendente"""
        usuario = self.get_object()
        
        if usuario.status != 'pendente':
            return Response(
                {'detail': 'Usuário não está pendente'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Invalida token anterior e gera novo
        token = usuario.gerar_token_ativacao()
        
        # Envia novo email
        serializer = UsuarioCreateSerializer(context={'request': request})
        serializer._enviar_email_convite(usuario, token)
        
        return Response(
            {'detail': 'Convite reenviado com sucesso'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UsuarioDetailSerializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def redefinir_senha(self, request, pk=None):
        """Redefine a senha de um usuário manualmente (Admin)"""
        usuario = self.get_object()
        senha = request.data.get('senha')

        if not senha or len(senha) < 6:
            return Response(
                {'detail': 'A senha deve ter pelo menos 6 caracteres'},
                status=status.HTTP_400_BAD_REQUEST
            )

        usuario.set_password(senha)
        usuario.save()

        return Response(
            {'detail': 'Senha redefinida com sucesso'},
            status=status.HTTP_200_OK
        )
