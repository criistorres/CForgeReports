import uuid
from django.db import models


class Empresa(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nome = models.CharField(max_length=255)
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
