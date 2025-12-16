import uuid
from django.db import models


class Relatorio(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey('empresas.Empresa', on_delete=models.CASCADE)
    conexao = models.ForeignKey('conexoes.Conexao', on_delete=models.PROTECT)
    nome = models.CharField(max_length=255)
    descricao = models.TextField(blank=True)
    query_sql = models.TextField()
    ativo = models.BooleanField(default=True)
    limite_linhas_tela = models.IntegerField(default=1000)
    permite_exportar = models.BooleanField(default=True)
    criado_por = models.ForeignKey('usuarios.Usuario', on_delete=models.PROTECT)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'relatorios'
        unique_together = ['empresa', 'nome']

    def __str__(self):
        return f"{self.nome} ({self.empresa.nome})"


class Filtro(models.Model):
    """
    Filtros dinâmicos para relatórios.
    Permite ao usuário preencher parâmetros antes de executar a query.
    """
    class TipoFiltro(models.TextChoices):
        DATA = 'DATA', 'Data'
        TEXTO = 'TEXTO', 'Texto'
        NUMERO = 'NUMERO', 'Número'
        LISTA = 'LISTA', 'Lista'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    relatorio = models.ForeignKey(Relatorio, on_delete=models.CASCADE, related_name='filtros')
    parametro = models.CharField(max_length=100, help_text='Nome do parâmetro na query (ex: @data_inicio)')
    label = models.CharField(max_length=255, help_text='Label exibido ao usuário')
    tipo = models.CharField(max_length=20, choices=TipoFiltro.choices)
    obrigatorio = models.BooleanField(default=False)
    valor_padrao = models.CharField(max_length=255, blank=True)
    opcoes = models.JSONField(null=True, blank=True, help_text='Lista de opções para tipo LISTA')
    ordem = models.IntegerField(default=0)

    class Meta:
        db_table = 'filtros'
        unique_together = ['relatorio', 'parametro']
        ordering = ['ordem']

    def __str__(self):
        return f"{self.label} ({self.parametro})"
