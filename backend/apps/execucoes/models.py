import uuid
from django.db import models


class Execucao(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey('empresas.Empresa', on_delete=models.CASCADE)
    relatorio = models.ForeignKey('relatorios.Relatorio', on_delete=models.CASCADE)
    usuario = models.ForeignKey('usuarios.Usuario', on_delete=models.CASCADE)
    filtros_usados = models.JSONField(null=True, blank=True)
    iniciado_em = models.DateTimeField(auto_now_add=True)
    finalizado_em = models.DateTimeField(null=True)
    tempo_execucao_ms = models.IntegerField(null=True)
    sucesso = models.BooleanField(default=False)
    erro = models.TextField(null=True, blank=True)
    qtd_linhas = models.IntegerField(null=True)
    exportou = models.BooleanField(default=False)
    exportado_em = models.DateTimeField(null=True)

    class Meta:
        db_table = 'execucoes'
        ordering = ['-iniciado_em']

    def __str__(self):
        return f"Execução {self.id} - {self.relatorio.nome}"
