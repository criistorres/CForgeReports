import uuid
from django.db import models


class Empresa(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nome = models.CharField(max_length=255)
    cnpj = models.CharField(max_length=18, unique=True, null=True, blank=True, help_text="CNPJ no formato 00.000.000/0000-00")
    slug = models.SlugField(unique=True)
    ativo = models.BooleanField(default=True)
    max_usuarios = models.IntegerField(default=10)
    max_conexoes = models.IntegerField(default=5)
    max_relatorios = models.IntegerField(default=50)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'empresas'
        verbose_name = 'Empresa'
        verbose_name_plural = 'Empresas'

    def __str__(self):
        return self.nome


class ConfiguracaoEmpresa(models.Model):
    """
    Configurações da empresa - incluindo SMTP para envio de emails.
    Cada empresa pode ter suas próprias configurações de email.
    """
    empresa = models.OneToOneField(
        Empresa,
        on_delete=models.CASCADE,
        related_name='configuracao',
        primary_key=True
    )
    
    # Configurações de Email (SMTP)
    smtp_host = models.CharField(max_length=255, blank=True, verbose_name='Servidor SMTP')
    smtp_porta = models.IntegerField(default=587, verbose_name='Porta')
    smtp_usuario = models.CharField(max_length=255, blank=True, verbose_name='Usuário')
    smtp_senha = models.CharField(max_length=512, blank=True, verbose_name='Senha')  # Criptografada
    smtp_usar_tls = models.BooleanField(default=True, verbose_name='Usar TLS')
    smtp_email_remetente = models.EmailField(blank=True, verbose_name='Email Remetente')
    smtp_nome_remetente = models.CharField(
        max_length=255, 
        blank=True, 
        default='ForgeReports',
        verbose_name='Nome do Remetente'
    )
    
    # Validação do SMTP
    smtp_testado_em = models.DateTimeField(null=True, blank=True)
    smtp_ultimo_teste_ok = models.BooleanField(default=False)
    
    atualizado_em = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'configuracoes_empresa'
        verbose_name = 'Configuração da Empresa'
        verbose_name_plural = 'Configurações das Empresas'
    
    def __str__(self):
        return f"Configurações de {self.empresa.nome}"
    
    def set_smtp_senha(self, senha: str):
        """Criptografa e salva a senha SMTP"""
        from core.crypto import encrypt
        if senha:
            self.smtp_senha = encrypt(senha)
        else:
            self.smtp_senha = ''
    
    def get_smtp_senha(self) -> str:
        """Descriptografa e retorna a senha SMTP"""
        from core.crypto import decrypt
        if self.smtp_senha:
            return decrypt(self.smtp_senha)
        return ''
    
    @property
    def smtp_configurado(self) -> bool:
        """Verifica se SMTP está configurado"""
        return bool(self.smtp_host and self.smtp_usuario and self.smtp_senha)
