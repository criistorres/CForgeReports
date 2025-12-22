from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import Agendamento, ExecucaoAgendada
from .serializers import AgendamentoSerializer, ExecucaoAgendadaSerializer
from core.permissions import IsTecnicoOrAdmin

class AgendamentoViewSet(viewsets.ModelViewSet):
    serializer_class = AgendamentoSerializer
    permission_classes = [IsAuthenticated, IsTecnicoOrAdmin]
    
    def get_queryset(self):
        # Filtra agendamentos apenas da empresa do usuário
        return Agendamento.objects.filter(empresa=self.request.user.empresa).order_by('-criado_em')
    
    @action(detail=True, methods=['post'])
    def pausar(self, request, pk=None):
        agendamento = self.get_object()
        agendamento.ativo = False
        agendamento.save()
        return Response({'status': 'Agendamento pausado com sucesso'})
    
    @action(detail=True, methods=['post'])
    def retomar(self, request, pk=None):
        agendamento = self.get_object()
        agendamento.ativo = True
        agendamento.save()
        return Response({'status': 'Agendamento retomado com sucesso'})
        
    @action(detail=True, methods=['post'])
    def executar_agora(self, request, pk=None):
        """
        Gatilho para execução imediata (manual).
        Em um cenário real com Celery, isso dispararia a task.
        Por enquanto, vamos simular ou criar o registro de execução.
        """
        agendamento = self.get_object()
        
        # TODO: Integrar com a task do Celery na Fase 3
        # executar_relatorio_task.delay(agendamento.id)
        
        return Response({
            'status': 'Execução iniciada', 
            'message': 'O relatório será gerado e enviado por email em instantes.'
        })

    @action(detail=True, methods=['get'])
    def historico(self, request, pk=None):
        """Retorna o histórico de execuções deste agendamento"""
        agendamento = self.get_object()
        historico = ExecucaoAgendada.objects.filter(agendamento=agendamento).order_by('-iniciado_em')
        
        page = self.paginate_queryset(historico)
        if page is not None:
            serializer = ExecucaoAgendadaSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = ExecucaoAgendadaSerializer(historico, many=True)
        return Response(serializer.data)
