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
