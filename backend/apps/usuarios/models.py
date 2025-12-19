import uuid
import secrets
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone


class Cargo(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(
        'empresas.Empresa',
        on_delete=models.CASCADE,
        related_name='cargos'
    )
    nome = models.CharField(max_length=100)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cargos'
        verbose_name = 'Cargo'
        verbose_name_plural = 'Cargos'
        unique_together = ['empresa', 'nome']

    def __str__(self):
        return f"{self.nome} ({self.empresa.nome})"


class Departamento(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(
        'empresas.Empresa',
        on_delete=models.CASCADE,
        related_name='departamentos'
    )
    nome = models.CharField(max_length=100)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'departamentos'
        verbose_name = 'Departamento'
        verbose_name_plural = 'Departamentos'
        unique_together = ['empresa', 'nome']

    def __str__(self):
        return f"{self.nome} ({self.empresa.nome})"


class UsuarioManager(BaseUserManager):
    def create_user(self, email, empresa, password=None, **extra_fields):
        if not email:
            raise ValueError('Email é obrigatório')
        
        email = self.normalize_email(email)
        
        # Verifica limite de usuários da empresa se empresa for fornecida
        if empresa:
            if empresa.usuarios.filter(ativo=True).count() >= empresa.max_usuarios:
                raise ValueError(f'Limite de {empresa.max_usuarios} usuários atingido')
        
        user = self.model(email=email, empresa=empresa, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Cria um superuser sem empresa (para uso admin do sistema)"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        extra_fields.setdefault('ativo', True)

        if not extra_fields.get('empresa'):
            # Para superuser, permite criar sem empresa
            email = self.normalize_email(email)
            user = self.model(email=email, **extra_fields)
            user.set_password(password)
            user.save(using=self._db)
            return user

        return self.create_user(email, password=password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrador'
        TECNICO = 'TECNICO', 'Técnico'
        USUARIO = 'USUARIO', 'Usuário'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(
        'empresas.Empresa',
        on_delete=models.CASCADE,
        related_name='usuarios',
        null=True,  # Permite null para superusers
        blank=True
    )
    nome = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USUARIO)

    # Novos campos corporativos
    telefone = models.CharField(max_length=20, blank=True, null=True)
    cargo = models.ForeignKey(
        Cargo,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='usuarios'
    )
    departamento = models.ForeignKey(
        Departamento,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='usuarios'
    )
    
    # Status e Ativação
    ativo = models.BooleanField(default=False)
    ativado_em = models.DateTimeField(null=True, blank=True)
    token_ativacao = models.CharField(max_length=100, null=True, blank=True)
    token_expira_em = models.DateTimeField(null=True, blank=True)
    
    # Controle
    is_staff = models.BooleanField(default=False)
    criado_em = models.DateTimeField(auto_now_add=True)
    criado_por = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='usuarios_criados'
    )
    atualizado_em = models.DateTimeField(auto_now=True)

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome']

    class Meta:
        db_table = 'usuarios'
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
        # Removemos unique_together de empresa+email pois email já é unique globalmente
        # unique_together = ['empresa', 'email'] 
        indexes = [
            models.Index(fields=['empresa', 'ativo']),
            models.Index(fields=['token_ativacao']),
        ]

    def __str__(self):
        return f"{self.nome} ({self.email})"

    @property
    def status(self):
        """Retorna status do usuário: 'ativo', 'pendente', 'inativo'"""
        if self.ativo:
            return 'ativo'
        elif self.token_ativacao and self.token_expira_em and self.token_expira_em > timezone.now():
            return 'pendente'
        return 'inativo'
    
    @property
    def is_active(self):
        """Compatibilidade com Django admin"""
        return self.ativo

    def gerar_token_ativacao(self):
        """Gera token de ativação válido por 48h"""
        self.token_ativacao = secrets.token_urlsafe(32)
        self.token_expira_em = timezone.now() + timezone.timedelta(hours=48)
        self.save()
        return self.token_ativacao
    
    def pode_ser_desativado(self):
        """Verifica se o usuário pode ser desativado (RN02, RN03)"""
        # Não pode desativar a si mesmo (verificação feita na view/permission, mas bom ter aqui)
        # Deve existir pelo menos 1 admin ativo
        if self.role == self.Role.ADMIN and self.empresa:
            admins_ativos = self.empresa.usuarios.filter(
                role=self.Role.ADMIN,
                ativo=True
            ).exclude(id=self.id).count()
            return admins_ativos > 0
        return True
