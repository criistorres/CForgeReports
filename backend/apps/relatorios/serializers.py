"""
Serializers para a API de Relatórios.
"""
from rest_framework import serializers
from .models import Relatorio, Filtro, Pasta, Favorito
from services.query_validator import validar_query


class RelatorioSerializer(serializers.ModelSerializer):
    """Serializer para CRUD de relatórios"""
    conexao_nome = serializers.CharField(source='conexao.nome', read_only=True)
    pode_exportar = serializers.SerializerMethodField()

    class Meta:
        model = Relatorio
        fields = [
            'id', 'nome', 'descricao', 'pasta', 'conexao', 'conexao_nome',
            'query_sql', 'ativo', 'limite_linhas_tela',
            'permite_exportar', 'pode_exportar', 'criado_em'
        ]
        read_only_fields = ['id', 'criado_em', 'pode_exportar']

    def get_pode_exportar(self, obj):
        """Verifica se o usuário atual pode exportar este relatório"""
        request = self.context.get('request')
        if not request or not request.user:
            return False

        user = request.user

        # Admin e Técnico sempre podem exportar
        if user.role in ['ADMIN', 'TECNICO']:
            return True

        # Buscar permissão explícita
        perm = obj.permissoes.filter(usuario=user).first()
        return perm and perm.nivel == 'EXPORTAR' if perm else False

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


class FiltroSerializer(serializers.ModelSerializer):
    """Serializer para filtros dinâmicos"""
    class Meta:
        model = Filtro
        fields = ['id', 'parametro', 'label', 'tipo', 'obrigatorio', 'valor_padrao', 'opcoes', 'ordem']
        read_only_fields = ['id']


class RelatorioComFiltrosSerializer(RelatorioSerializer):
    """Serializer de relatório incluindo seus filtros"""
    filtros = FiltroSerializer(many=True, read_only=True)

    class Meta(RelatorioSerializer.Meta):
        fields = RelatorioSerializer.Meta.fields + ['filtros']


class SalvarFiltrosSerializer(serializers.Serializer):
    """Serializer para salvar múltiplos filtros de uma vez"""
    filtros = FiltroSerializer(many=True)

    def save(self, relatorio):
        """
        Substitui todos os filtros do relatório pelos novos.

        Args:
            relatorio: Instância de Relatorio
        """
        # Deletar filtros existentes
        relatorio.filtros.all().delete()

        # Criar novos filtros
        for i, filtro_data in enumerate(self.validated_data['filtros']):
            Filtro.objects.create(
                relatorio=relatorio,
                ordem=i,
                **filtro_data
            )


class PastaSerializer(serializers.ModelSerializer):
    """Serializer para pastas de organização"""
    qtd_relatorios = serializers.SerializerMethodField()
    qtd_subpastas = serializers.SerializerMethodField()

    class Meta:
        model = Pasta
        fields = ['id', 'nome', 'pasta_pai', 'criado_em', 'qtd_relatorios', 'qtd_subpastas']
        read_only_fields = ['id', 'criado_em']

    def get_qtd_relatorios(self, obj):
        """Retorna quantidade de relatórios na pasta"""
        return obj.relatorios.filter(ativo=True).count()

    def get_qtd_subpastas(self, obj):
        """Retorna quantidade de subpastas"""
        return obj.subpastas.count()


class FavoritoSerializer(serializers.ModelSerializer):
    """Serializer para favoritos"""
    relatorio_nome = serializers.CharField(source='relatorio.nome', read_only=True)
    relatorio_descricao = serializers.CharField(source='relatorio.descricao', read_only=True)

    class Meta:
        model = Favorito
        fields = ['id', 'relatorio', 'relatorio_nome', 'relatorio_descricao', 'criado_em']
        read_only_fields = ['id', 'criado_em']
