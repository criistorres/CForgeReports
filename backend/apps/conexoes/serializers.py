"""
Serializers para o app de conexões.
"""
from rest_framework import serializers
from .models import Conexao
from core.crypto import encrypt


class ConexaoSerializer(serializers.ModelSerializer):
    """
    Serializer para CRUD de conexões.
    - Senha é write-only (nunca retornada na API)
    - Senha é criptografada automaticamente ao criar/atualizar
    - Empresa é definida automaticamente pelo usuário logado
    """

    senha = serializers.CharField(
        write_only=True,
        required=False,
        help_text="Senha do banco (será criptografada)"
    )

    class Meta:
        model = Conexao
        fields = [
            'id',
            'nome',
            'tipo',
            'host',
            'porta',
            'database',
            'usuario',
            'senha',  # write-only
            'ativo',
            'ultimo_teste_em',
            'ultimo_teste_ok',
            'criado_em',
        ]
        read_only_fields = ['id', 'criado_em', 'ultimo_teste_em', 'ultimo_teste_ok']

    def create(self, validated_data):
        """
        Cria conexão criptografando a senha e associando à empresa do usuário.
        """
        senha = validated_data.pop('senha')
        validated_data['senha_encriptada'] = encrypt(senha)
        validated_data['empresa_id'] = self.context['request'].user.empresa_id
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        Atualiza conexão, criptografando senha se fornecida.
        """
        senha = validated_data.pop('senha', None)
        if senha:
            validated_data['senha_encriptada'] = encrypt(senha)
        return super().update(instance, validated_data)


class TestarConexaoSerializer(serializers.Serializer):
    """
    Serializer para testar conexão antes de salvar.
    Útil para validar credenciais no frontend antes de criar.
    """

    tipo = serializers.ChoiceField(
        choices=Conexao.TipoBanco.choices,
        help_text="Tipo do banco de dados"
    )
    host = serializers.CharField(
        max_length=255,
        help_text="Servidor/hostname"
    )
    porta = serializers.IntegerField(
        min_value=1,
        max_value=65535,
        help_text="Porta de conexão"
    )
    database = serializers.CharField(
        max_length=255,
        help_text="Nome do database"
    )
    usuario = serializers.CharField(
        max_length=255,
        help_text="Usuário do banco"
    )
    senha = serializers.CharField(
        help_text="Senha do banco (não será armazenada)"
    )
