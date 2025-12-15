from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils.text import slugify
from .models import Usuario
from apps.empresas.models import Empresa


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['empresa_id'] = str(user.empresa_id) if user.empresa_id else None
        token['empresa_nome'] = user.empresa.nome if user.empresa else None
        token['role'] = user.role
        token['nome'] = user.nome
        return token

    def validate(self, attrs):
        # Buscar usuário por email
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = Usuario.objects.get(email=email, ativo=True)
        except Usuario.DoesNotExist:
            raise serializers.ValidationError('Credenciais inválidas')

        if not user.check_password(password):
            raise serializers.ValidationError('Credenciais inválidas')

        refresh = self.get_token(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': str(user.id),
                'nome': user.nome,
                'email': user.email,
                'role': user.role,
                'empresa_id': str(user.empresa_id) if user.empresa_id else None,
                'empresa_nome': user.empresa.nome if user.empresa else None,
            }
        }


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'nome', 'email', 'role', 'ativo', 'ativado_em', 'criado_em']
        read_only_fields = ['id', 'criado_em']


class RegistroPublicoSerializer(serializers.Serializer):
    """Serializer para cadastro público de nova empresa + admin"""
    # Dados da empresa
    empresa_nome = serializers.CharField(max_length=255)
    cnpj = serializers.CharField(max_length=18, required=True)

    # Dados do admin
    nome = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)

    def validate_email(self, value):
        """Verifica se o email já está em uso"""
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError('Este email já está cadastrado')
        return value

    def validate_cnpj(self, value):
        """Valida CNPJ"""
        # Remove pontuação
        cnpj_limpo = ''.join(filter(str.isdigit, value))

        if len(cnpj_limpo) != 14:
            raise serializers.ValidationError('CNPJ deve conter 14 dígitos')

        if Empresa.objects.filter(cnpj=value).exists():
            raise serializers.ValidationError('Este CNPJ já está cadastrado')

        return value

    def validate_empresa_nome(self, value):
        """Gera slug e verifica se já existe"""
        slug = slugify(value)
        if Empresa.objects.filter(slug=slug).exists():
            raise serializers.ValidationError('Já existe uma empresa com este nome')
        return value

    def create(self, validated_data):
        """Cria empresa + admin em uma transação"""
        from django.db import transaction

        with transaction.atomic():
            # Criar empresa
            empresa_nome = validated_data['empresa_nome']
            cnpj = validated_data['cnpj']
            slug = slugify(empresa_nome)

            empresa = Empresa.objects.create(
                nome=empresa_nome,
                cnpj=cnpj,
                slug=slug
            )

            # Criar admin
            usuario = Usuario.objects.create(
                empresa=empresa,
                nome=validated_data['nome'],
                email=validated_data['email'],
                role='ADMIN',
                ativo=True
            )
            usuario.set_password(validated_data['password'])
            usuario.save()

            return usuario
