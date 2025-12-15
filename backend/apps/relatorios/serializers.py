"""
Serializers para a API de Relatórios.
"""
from rest_framework import serializers
from .models import Relatorio
from services.query_validator import validar_query


class RelatorioSerializer(serializers.ModelSerializer):
    """Serializer para CRUD de relatórios"""
    conexao_nome = serializers.CharField(source='conexao.nome', read_only=True)

    class Meta:
        model = Relatorio
        fields = [
            'id', 'nome', 'descricao', 'conexao', 'conexao_nome',
            'query_sql', 'ativo', 'limite_linhas_tela',
            'permite_exportar', 'criado_em'
        ]
        read_only_fields = ['id', 'criado_em']

    def validate_query_sql(self, value):
        """Valida se a query é segura (apenas SELECT)"""
        valida, erro = validar_query(value)
        if not valida:
            raise serializers.ValidationError(erro)
        return value

    def create(self, validated_data):
        """Cria relatório vinculado à empresa e criador"""
        validated_data['empresa_id'] = self.context['request'].user.empresa_id
        validated_data['criado_por'] = self.context['request'].user
        return super().create(validated_data)


class ExecutarRelatorioSerializer(serializers.Serializer):
    """Serializer para execução de relatórios"""
    filtros = serializers.DictField(required=False, default=dict)
