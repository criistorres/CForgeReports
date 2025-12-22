from django.db import models
from django.db.models import JSONField
import uuid
from apps.empresas.models import Empresa
from apps.relatorios.models import Relatorio
from apps.usuarios.models import Usuario
from apps.execucoes.models import Execucao


class Agendamento(models.Model):
    class Frequencia(models.TextChoices):
        DIARIO = 'DIARIO', 'Diário'
        SEMANAL = 'SEMANAL', 'Semanal'
        MENSAL = 'MENSAL', 'Mensal'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='agendamentos')
    relatorio = models.ForeignKey(Relatorio, on_delete=models.CASCADE, related_name='agendamentos')
    criado_por = models.ForeignKey(Usuario, on_delete=models.PROTECT, related_name='agendamentos_criados')

    nome = models.CharField(max_length=255)
    frequencia = models.CharField(max_length=20, choices=Frequencia.choices)
    hora_execucao = models.TimeField(help_text="Horário de execução (HH:MM:SS)")
    
    # Configuração de Dias
    dias_semana = JSONField(null=True, blank=True, help_text="Lista de dias [0-6] para semanal (0=Domingo)")
    dia_mes = models.IntegerField(null=True, blank=True, help_text="Dia do mês [1-31] para mensal")

    # Parâmetros de Execução
    filtros_padrao = JSONField(null=True, blank=True, help_text="Valores para os filtros do relatório")
    enviar_email = models.BooleanField(default=True)
    emails_destino = JSONField(default=list, help_text="Lista de emails destinatários")

    # Status
    ativo = models.BooleanField(default=True)
    proxima_execucao = models.DateTimeField(null=True, blank=True)
    ultima_execucao = models.DateTimeField(null=True, blank=True)
    
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'agendamentos'
        verbose_name = 'Agendamento'
        verbose_name_plural = 'Agendamentos'
        ordering = ['-criado_em']

    def __str__(self):
        return f"{self.nome} ({self.get_frequencia_display()})"


class ExecucaoAgendada(models.Model):
    """Histórico de execuções disparadas pelo agendamento"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agendamento = models.ForeignKey(Agendamento, on_delete=models.CASCADE, related_name='historico_execucoes')
    execucao = models.ForeignKey(Execucao, on_delete=models.SET_NULL, null=True, blank=True)
    
    iniciado_em = models.DateTimeField(auto_now_add=True)
    finalizado_em = models.DateTimeField(null=True, blank=True)
    
    sucesso = models.BooleanField(default=False)
    erro = models.TextField(null=True, blank=True)
    email_enviado = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'execucoes_agendadas'
        verbose_name = 'Execução Agendada'
        verbose_name_plural = 'Execuções Agendadas'
        ordering = ['-iniciado_em']
        
    def __str__(self):
        return f"Execução de {self.agendamento.nome} em {self.iniciado_em}"
