"""
Serializers para a API de Execuções/Histórico.
"""
from rest_framework import serializers
from .models import Execucao


class ExecucaoSerializer(serializers.ModelSerializer):
    """Serializer para histórico de execuções"""
    relatorio_nome = serializers.CharField(source='relatorio.nome', read_only=True)
    relatorio_id = serializers.UUIDField(source='relatorio.id', read_only=True)
    usuario_nome = serializers.CharField(source='usuario.nome', read_only=True)
    usuario_email = serializers.CharField(source='usuario.email', read_only=True)

    class Meta:
        model = Execucao
        fields = [
            'id', 'relatorio_id', 'relatorio_nome', 'usuario_nome', 'usuario_email',
            'filtros_usados', 'iniciado_em', 'finalizado_em', 'tempo_execucao_ms',
            'sucesso', 'erro', 'qtd_linhas', 'exportou', 'exportado_em'
        ]
        read_only_fields = ['id']
