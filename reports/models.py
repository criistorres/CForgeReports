from django.db import models
from django.contrib.auth.models import User
from connections.models import DatabaseConnection


class ReportFolder(models.Model):
    nome = models.CharField(max_length=200, verbose_name='Nome da Pasta')
    pasta_pai = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, verbose_name='Pasta Pai')
    criado_por = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Criado por')
    criado_em = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')

    class Meta:
        verbose_name = 'Pasta de Relatórios'
        verbose_name_plural = 'Pastas de Relatórios'
        ordering = ['nome']

    def __str__(self):
        return self.nome

    def get_full_path(self):
        """Retorna o caminho completo da pasta"""
        if self.pasta_pai:
            return f"{self.pasta_pai.get_full_path()} / {self.nome}"
        return self.nome


class Report(models.Model):
    nome = models.CharField(max_length=200, verbose_name='Nome do Relatório')
    descricao = models.TextField(verbose_name='Descrição')
    sql_query = models.TextField(verbose_name='Query SQL')
    conexao_banco = models.ForeignKey(DatabaseConnection, on_delete=models.CASCADE, verbose_name='Conexão do Banco')
    pasta = models.ForeignKey(ReportFolder, null=True, blank=True, on_delete=models.SET_NULL, verbose_name='Pasta')
    criado_por = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Criado por')
    usuarios_permitidos = models.ManyToManyField(
        User, 
        related_name='reports_permitidos', 
        blank=True,
        verbose_name='Usuários Permitidos'
    )
    ativo = models.BooleanField(default=True, verbose_name='Ativo')
    criado_em = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')

    class Meta:
        verbose_name = 'Relatório'
        verbose_name_plural = 'Relatórios'
        ordering = ['nome']

    def __str__(self):
        return self.nome


class ReportFilter(models.Model):
    TIPOS_FILTRO = [
        ('texto', 'Texto'),
        ('select', 'Lista de Opções'),
        ('data', 'Data'),
    ]
    
    relatorio = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='filtros', verbose_name='Relatório')
    nome = models.CharField(max_length=100, verbose_name='Nome do Filtro')
    tipo = models.CharField(max_length=20, choices=TIPOS_FILTRO, verbose_name='Tipo do Filtro')
    opcoes_select = models.JSONField(null=True, blank=True, verbose_name='Opções do Select')  # Para filtros select
    obrigatorio = models.BooleanField(default=False, verbose_name='Obrigatório')
    ordem = models.IntegerField(default=0, verbose_name='Ordem')

    class Meta:
        verbose_name = 'Filtro de Relatório'
        verbose_name_plural = 'Filtros de Relatórios'
        ordering = ['relatorio', 'ordem', 'nome']

    def __str__(self):
        return f"{self.relatorio.nome} - {self.nome}"
