"""
Views para gerenciamento de conexões de banco.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import Conexao
from .serializers import ConexaoSerializer, TestarConexaoSerializer
from core.mixins import EmpresaQuerySetMixin
from core.permissions import IsTecnicoOrAdmin
from services.database_connector import DatabaseConnector, test_connection_params


class ConexaoViewSet(EmpresaQuerySetMixin, viewsets.ModelViewSet):
    """
    ViewSet para CRUD de conexões.

    Endpoints:
    - GET /api/conexoes/ - Lista conexões da empresa
    - POST /api/conexoes/ - Cria nova conexão
    - GET /api/conexoes/{id}/ - Detalhe de conexão
    - PUT/PATCH /api/conexoes/{id}/ - Atualiza conexão
    - DELETE /api/conexoes/{id}/ - Remove conexão
    - POST /api/conexoes/testar/ - Testa conexão antes de salvar
    - POST /api/conexoes/{id}/testar_existente/ - Testa conexão já salva

    Permissões:
    - Apenas ADMIN e TECNICO podem gerenciar conexões
    - Isolamento por empresa (multi-tenancy)
    """

    serializer_class = ConexaoSerializer
    permission_classes = [IsAuthenticated, IsTecnicoOrAdmin]

    def get_queryset(self):
        """Retorna apenas conexões da empresa do usuário"""
        return Conexao.objects.filter(empresa_id=self.request.user.empresa_id)

    @action(detail=False, methods=['post'], url_path='testar')
    def testar(self, request):
        """
        Testa conexão com parâmetros fornecidos (sem salvar).

        Útil para validar credenciais no frontend antes de criar a conexão.

        POST /api/conexoes/testar/
        Body:
        {
            "tipo": "SQLSERVER",
            "host": "servidor.com",
            "porta": 1433,
            "database": "meu_db",
            "usuario": "user",
            "senha": "pass"
        }

        Response:
        {
            "sucesso": true,
            "mensagem": "Conexão estabelecida com sucesso"
        }
        """
        serializer = TestarConexaoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        sucesso, mensagem = test_connection_params(**serializer.validated_data)

        return Response({
            'sucesso': sucesso,
            'mensagem': mensagem
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='testar-existente')
    def testar_existente(self, request, pk=None):
        """
        Testa uma conexão já salva no banco.

        Atualiza os campos ultimo_teste_em e ultimo_teste_ok.

        POST /api/conexoes/{id}/testar-existente/

        Response:
        {
            "sucesso": true,
            "mensagem": "Conexão estabelecida com sucesso"
        }
        """
        conexao = self.get_object()
        connector = DatabaseConnector(conexao)
        sucesso, mensagem = connector.test_connection()

        # Atualizar status do teste
        conexao.ultimo_teste_em = timezone.now()
        conexao.ultimo_teste_ok = sucesso
        conexao.save(update_fields=['ultimo_teste_em', 'ultimo_teste_ok'])

        return Response({
            'sucesso': sucesso,
            'mensagem': mensagem
        }, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        """Hook para ações ao criar conexão"""
        conexao = serializer.save()
        # Log ou auditoria pode ser adicionado aqui

    def perform_destroy(self, instance):
        """
        Hook para validações ao deletar conexão.
        Futuramente: verificar se há relatórios usando esta conexão.
        """
        # TODO: Verificar se há relatórios ativos usando esta conexão
        instance.delete()
