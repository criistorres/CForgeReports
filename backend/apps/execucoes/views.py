"""
Views para a API de Execuções/Histórico.
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Execucao
from .serializers import ExecucaoSerializer


class HistoricoViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para consulta de histórico de execuções"""
    serializer_class = ExecucaoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retorna execuções filtradas por permissões do usuário"""
        user = self.request.user
        qs = Execucao.objects.filter(empresa_id=user.empresa_id)

        # Usuário comum só vê seu próprio histórico
        if user.role == 'USUARIO':
            qs = qs.filter(usuario=user)

        # Filtros opcionais via query params
        relatorio_id = self.request.query_params.get('relatorio_id')
        if relatorio_id:
            qs = qs.filter(relatorio_id=relatorio_id)

        usuario_id = self.request.query_params.get('usuario_id')
        if usuario_id and user.role in ['ADMIN', 'TECNICO']:
            qs = qs.filter(usuario_id=usuario_id)

        sucesso = self.request.query_params.get('sucesso')
        if sucesso is not None:
            qs = qs.filter(sucesso=sucesso == 'true')

        # Limitar a 100 registros mais recentes
        return qs.select_related('relatorio', 'usuario')[:100]
