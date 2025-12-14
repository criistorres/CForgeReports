import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UsuarioManager(BaseUserManager):
    def create_user(self, email, empresa, password=None, **extra_fields):
        if not email:
            raise ValueError('Email é obrigatório')
        if not empresa:
            raise ValueError('Empresa é obrigatória')
        email = self.normalize_email(email)
        user = self.model(email=email, empresa=empresa, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Cria um superuser sem empresa (para uso admin do sistema)"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')

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
    email = models.EmailField(unique=True)  # Email deve ser único no sistema
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USUARIO)
    ativo = models.BooleanField(default=True)
    ativado_em = models.DateTimeField(null=True, blank=True)
    is_staff = models.BooleanField(default=False)  # Para acesso ao admin do Django
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome']

    class Meta:
        db_table = 'usuarios'
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'

    def __str__(self):
        return f"{self.nome} ({self.email})"

    @property
    def is_active(self):
        """Compatibilidade com Django admin"""
        return self.ativo
