from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Usuario


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['empresa_id'] = str(user.empresa_id) if user.empresa_id else None
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
            }
        }


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'nome', 'email', 'role', 'ativo', 'ativado_em', 'criado_em']
        read_only_fields = ['id', 'criado_em']
