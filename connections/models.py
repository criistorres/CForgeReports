from django.db import models
from django.contrib.auth.models import User


class DatabaseConnection(models.Model):
    TIPOS_BANCO = [
        ('sqlserver', 'SQL Server'),
        ('postgresql', 'PostgreSQL'),
        ('mysql', 'MySQL'),
        ('oracle', 'Oracle'),
    ]
    
    nome = models.CharField(max_length=100, verbose_name='Nome da Conexão')
    tipo_banco = models.CharField(max_length=20, choices=TIPOS_BANCO, verbose_name='Tipo de Banco')
    servidor = models.CharField(max_length=200, verbose_name='Servidor')
    banco = models.CharField(max_length=100, verbose_name='Nome do Banco')
    usuario = models.CharField(max_length=100, verbose_name='Usuário')
    senha = models.CharField(max_length=200, verbose_name='Senha')  # Texto puro no MVP
    ativo = models.BooleanField(default=True, verbose_name='Ativo')
    criado_por = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Criado por')
    criado_em = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')

    class Meta:
        verbose_name = 'Conexão de Banco de Dados'
        verbose_name_plural = 'Conexões de Banco de Dados'
        ordering = ['nome']

    def __str__(self):
        return f"{self.nome} ({self.get_tipo_banco_display()})"
