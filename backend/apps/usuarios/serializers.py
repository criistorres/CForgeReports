from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils.text import slugify
from django.utils import timezone
from .models import Usuario, Cargo, Departamento
from apps.empresas.models import Empresa


class CargoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cargo
        fields = ['id', 'nome']

    def validate(self, attrs):
        nome = attrs.get('nome')
        request = self.context.get('request')
        if not request:
            return attrs
            
        empresa = request.user.empresa
        qs = Cargo.objects.filter(empresa=empresa, nome__iexact=nome)
        
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
            
        if qs.exists():
            raise serializers.ValidationError({'nome': 'Já existe um cargo com este nome nesta empresa.'})
            
        return attrs


class DepartamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departamento
        fields = ['id', 'nome']

    def validate(self, attrs):
        nome = attrs.get('nome')
        request = self.context.get('request')
        if not request:
            return attrs
            
        empresa = request.user.empresa
        qs = Departamento.objects.filter(empresa=empresa, nome__iexact=nome)
        
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
            
        if qs.exists():
            raise serializers.ValidationError({'nome': 'Já existe um departamento com este nome nesta empresa.'})
            
        return attrs


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
                'telefone': user.telefone,
                'cargo_nome': user.cargo.nome if user.cargo else None,
                'departamento_nome': user.departamento.nome if user.departamento else None,
            }
        }


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


class UsuarioListSerializer(serializers.ModelSerializer):
    """Serializer para listagem de usuários"""
    status = serializers.CharField(read_only=True)
    
    class Meta:
        model = Usuario
        fields = [
            'id', 'nome', 'email', 'role', 'ativo', 
            'status', 'ativado_em', 'criado_em',
            'telefone', 'cargo_nome', 'departamento_nome'
        ]
        read_only_fields = ['id', 'ativado_em', 'criado_em']

    cargo_nome = serializers.CharField(source='cargo.nome', read_only=True)
    departamento_nome = serializers.CharField(source='departamento.nome', read_only=True)


class UsuarioCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de usuário"""
    
    class Meta:
        model = Usuario
        fields = ['nome', 'email', 'role', 'telefone', 'cargo', 'departamento']
    
    def validate_email(self, value):
        """Valida email único na empresa (RN01) - mas como email é unique global, já valida"""
        # Mantendo lógica extra se necessário, ou removendo se unique=True no model já pega.
        # No model novo, unique=True está setado.
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email já cadastrado no sistema")
        return value
    
    def create(self, validated_data):
        request = self.context['request']
        empresa = request.user.empresa
        
        # Cria usuário inativo
        # create_user do manager já lida com password, mas aqui estamos criando sem password inicial?
        # O prompt usa Usuario.objects.create, que NÃO usa o manager create_user diretamente para password hashing se não passar password.
        # Mas create_user é chamado se usarmos objects.create_user.
        # O prompt usa Usuario.objects.create(...)
        usuario = Usuario.objects.create(
            empresa=empresa,
            criado_por=request.user,
            ativo=False,
            **validated_data
        )
        
        # Gera token e envia email
        token = usuario.gerar_token_ativacao()
        self._enviar_email_convite(usuario, token)
        
        return usuario
    
    def _enviar_email_convite(self, usuario, token):
        """Envia email com link de ativação"""
        from django.core.mail import send_mail
        from django.conf import settings
        
        link = f"{settings.FRONTEND_URL}/ativar-conta/{token}"
        
        try:
            send_mail(
                subject=f"Convite - {usuario.empresa.nome}",
                message=f"""
                Olá {usuario.nome},
                
                Você foi convidado para acessar o ForgeReports da empresa {usuario.empresa.nome}.
                
                Clique no link abaixo para ativar sua conta:
                {link}
                
                Este link expira em 48 horas.
                """,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[usuario.email],
                fail_silently=False,
            )
        except Exception as e:
            # Em dev, pode falhar se não tiver configurado
            print(f"Erro ao enviar email: {e}")
            pass


class UsuarioUpdateSerializer(serializers.ModelSerializer):
    """Serializer para edição de usuário"""
    
    class Meta:
        model = Usuario
        fields = ['nome', 'role', 'telefone', 'cargo', 'departamento']
    
    def validate(self, attrs):
        """Valida regras de negócio"""
        if 'role' in attrs:
            usuario = self.instance
            # Se está tentando remover role ADMIN, verifica RN03
            if usuario.role == Usuario.Role.ADMIN and attrs['role'] != Usuario.Role.ADMIN:
                admins_ativos = usuario.empresa.usuarios.filter(
                    role=Usuario.Role.ADMIN,
                    ativo=True
                ).exclude(id=usuario.id).count()
                
                if admins_ativos == 0:
                    raise serializers.ValidationError({
                        'role': 'Deve existir pelo menos 1 administrador ativo'
                    })
        
        return attrs


class UsuarioDetailSerializer(serializers.ModelSerializer):
    """Serializer para detalhes do usuário"""
    status = serializers.CharField(read_only=True)
    criado_por_nome = serializers.CharField(source='criado_por.nome', read_only=True)
    
    class Meta:
        model = Usuario
        fields = [
            'id', 'nome', 'email', 'role', 'ativo', 'status',
            'ativado_em', 'criado_em', 'atualizado_em',
            'criado_por_nome', 'telefone', 'cargo', 'departamento'
        ]
        depth = 1  # Para trazer detalhes do cargo e departamento no detalhe
        read_only_fields = ['id', 'email', 'ativado_em', 'criado_em', 'atualizado_em']
