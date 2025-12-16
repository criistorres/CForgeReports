"""
Views para a API de Relatórios.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.utils import timezone
from .models import Relatorio
from .serializers import (
    RelatorioSerializer,
    ExecutarRelatorioSerializer,
    FiltroSerializer,
    SalvarFiltrosSerializer,
    RelatorioComFiltrosSerializer
)
from core.mixins import EmpresaQuerySetMixin
from core.permissions import IsTecnicoOrAdmin, IsAdmin
from services.query_executor import QueryExecutor
from services.excel_exporter import ExcelExporter
from services.permissoes import verificar_permissao
from .models import Permissao


class RelatorioViewSet(EmpresaQuerySetMixin, viewsets.ModelViewSet):
    """ViewSet para CRUD de relatórios"""
    serializer_class = RelatorioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retorna apenas relatórios ativos da empresa do usuário"""
        user = self.request.user
        qs = Relatorio.objects.filter(
            empresa_id=user.empresa_id,
            ativo=True
        )

        # Admin e Técnico veem todos os relatórios
        if user.role in ['ADMIN', 'TECNICO']:
            return qs.select_related('conexao')

        # Usuário comum só vê relatórios com permissão explícita
        return qs.filter(
            permissoes__usuario=user
        ).select_related('conexao').distinct()

    def get_permissions(self):
        """Apenas técnicos e admins podem criar/editar/deletar"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsTecnicoOrAdmin()]
        return super().get_permissions()

    @action(detail=True, methods=['post'])
    def executar(self, request, pk=None):
        """Executa o relatório e retorna dados"""
        relatorio = self.get_object()

        # Verificar permissão
        perm = verificar_permissao(relatorio.id, request.user)
        if not perm['tem_acesso']:
            return Response(
                {'erro': 'Você não tem permissão para acessar este relatório'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ExecutarRelatorioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        executor = QueryExecutor(relatorio)
        resultado = executor.executar(
            usuario=request.user,
            filtros_valores=serializer.validated_data.get('filtros')
        )

        return Response(resultado)

    @action(detail=True, methods=['post'])
    def testar(self, request, pk=None):
        """Testa a query com limite de 10 linhas"""
        relatorio = self.get_object()

        executor = QueryExecutor(relatorio)
        resultado = executor.executar(
            usuario=request.user,
            limite=10
        )

        return Response(resultado)

    @action(detail=True, methods=['post'])
    def exportar(self, request, pk=None):
        """Exporta relatório para Excel"""
        relatorio = self.get_object()

        # Verificar permissão de exportar
        perm = verificar_permissao(relatorio.id, request.user)
        if not perm['pode_exportar']:
            return Response(
                {'erro': 'Você não tem permissão para exportar este relatório'},
                status=status.HTTP_403_FORBIDDEN
            )

        if not relatorio.permite_exportar:
            return Response(
                {'erro': 'Exportação não permitida para este relatório'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            exporter = ExcelExporter()
            excel_file = exporter.exportar(relatorio)

            timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{relatorio.nome}_{timestamp}.xlsx"

            response = HttpResponse(
                excel_file.read(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        except Exception as e:
            return Response(
                {'erro': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get', 'put'], url_path='filtros')
    def filtros(self, request, pk=None):
        """
        GET: Retorna filtros do relatório
        PUT: Salva filtros do relatório (substitui todos)
        """
        relatorio = self.get_object()

        if request.method == 'GET':
            serializer = FiltroSerializer(relatorio.filtros.all(), many=True)
            return Response(serializer.data)

        elif request.method == 'PUT':
            # Apenas técnicos e admins podem editar filtros
            if not (request.user.role in ['ADMIN', 'TECNICO']):
                return Response(
                    {'erro': 'Você não tem permissão para editar filtros'},
                    status=status.HTTP_403_FORBIDDEN
                )

            serializer = SalvarFiltrosSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(relatorio)

            return Response({'success': True})

    @action(detail=True, methods=['get', 'post', 'delete'], url_path='permissoes')
    def permissoes(self, request, pk=None):
        """
        Gerenciamento de permissões do relatório.
        GET: Lista permissões
        POST: Adiciona/atualiza permissão
        DELETE: Remove permissão
        """
        relatorio = self.get_object()

        # Apenas Admin pode gerenciar permissões
        if request.user.role != 'ADMIN':
            return Response(
                {'erro': 'Apenas administradores podem gerenciar permissões'},
                status=status.HTTP_403_FORBIDDEN
            )

        if request.method == 'GET':
            perms = relatorio.permissoes.select_related('usuario')
            data = [
                {
                    'id': str(p.id),
                    'usuario_id': str(p.usuario_id),
                    'usuario_nome': p.usuario.nome,
                    'usuario_email': p.usuario.email,
                    'nivel': p.nivel
                }
                for p in perms
            ]
            return Response(data)

        elif request.method == 'POST':
            usuario_id = request.data.get('usuario_id')
            nivel = request.data.get('nivel', 'VISUALIZAR')

            if not usuario_id:
                return Response(
                    {'erro': 'usuario_id é obrigatório'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            Permissao.objects.update_or_create(
                relatorio=relatorio,
                usuario_id=usuario_id,
                defaults={
                    'nivel': nivel,
                    'criado_por': request.user
                }
            )
            return Response({'success': True})

        elif request.method == 'DELETE':
            usuario_id = request.data.get('usuario_id')

            if not usuario_id:
                return Response(
                    {'erro': 'usuario_id é obrigatório'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            Permissao.objects.filter(
                relatorio=relatorio,
                usuario_id=usuario_id
            ).delete()
            return Response({'success': True})
