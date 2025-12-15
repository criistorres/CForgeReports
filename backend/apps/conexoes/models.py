"""
Modelo de Conexão para bancos de dados externos.
"""
import uuid
from django.db import models


class Conexao(models.Model):
    """
    Representa uma conexão com banco de dados externo (SQL Server, PostgreSQL, MySQL).
    Isolada por empresa (multi-tenancy).
    """

    class TipoBanco(models.TextChoices):
        SQLSERVER = 'SQLSERVER', 'SQL Server'
        POSTGRESQL = 'POSTGRESQL', 'PostgreSQL'
        MYSQL = 'MYSQL', 'MySQL'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(
        'empresas.Empresa',
        on_delete=models.CASCADE,
        related_name='conexoes'
    )
    nome = models.CharField(max_length=255, help_text="Nome descritivo da conexão")
    tipo = models.CharField(
        max_length=20,
        choices=TipoBanco.choices,
        help_text="Tipo do banco de dados"
    )
    host = models.CharField(max_length=255, help_text="Servidor/hostname do banco")
    porta = models.IntegerField(help_text="Porta de conexão")
    database = models.CharField(max_length=255, help_text="Nome do database")
    usuario = models.CharField(max_length=255, help_text="Usuário do banco")
    senha_encriptada = models.TextField(help_text="Senha criptografada (AES)")
    ativo = models.BooleanField(default=True, help_text="Conexão ativa?")

    # Campos de teste de conexão
    ultimo_teste_em = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Data/hora do último teste de conexão"
    )
    ultimo_teste_ok = models.BooleanField(
        null=True,
        blank=True,
        help_text="Resultado do último teste (True=sucesso, False=falha, None=nunca testado)"
    )

    # Timestamps
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'conexoes'
        unique_together = ['empresa', 'nome']
        ordering = ['nome']
        verbose_name = 'Conexão'
        verbose_name_plural = 'Conexões'

    def __str__(self):
        return f"{self.nome} ({self.get_tipo_display()})"
