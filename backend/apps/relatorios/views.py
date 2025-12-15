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
from .serializers import RelatorioSerializer, ExecutarRelatorioSerializer
from core.mixins import EmpresaQuerySetMixin
from core.permissions import IsTecnicoOrAdmin
from services.query_executor import QueryExecutor
from services.excel_exporter import ExcelExporter


class RelatorioViewSet(EmpresaQuerySetMixin, viewsets.ModelViewSet):
    """ViewSet para CRUD de relatórios"""
    serializer_class = RelatorioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retorna apenas relatórios ativos da empresa do usuário"""
        return Relatorio.objects.filter(
            empresa_id=self.request.user.empresa_id,
            ativo=True
        ).select_related('conexao')

    def get_permissions(self):
        """Apenas técnicos e admins podem criar/editar/deletar"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsTecnicoOrAdmin()]
        return super().get_permissions()

    @action(detail=True, methods=['post'])
    def executar(self, request, pk=None):
        """Executa o relatório e retorna dados"""
        relatorio = self.get_object()
        serializer = ExecutarRelatorioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        executor = QueryExecutor(relatorio)
        resultado = executor.executar(
            usuario=request.user,
            filtros=serializer.validated_data.get('filtros')
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
