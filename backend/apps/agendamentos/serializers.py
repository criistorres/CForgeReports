from rest_framework import serializers
from .models import Agendamento, ExecucaoAgendada
from apps.relatorios.serializers import RelatorioSerializer  # Importar se precisar exibir detalhes

class ExecucaoAgendadaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExecucaoAgendada
        fields = '__all__'
        read_only_fields = ['id', 'iniciado_em', 'finalizado_em', 'sucesso', 'erro', 'email_enviado']

class AgendamentoSerializer(serializers.ModelSerializer):
    ultima_execucao_detalhe = ExecucaoAgendadaSerializer(source='historico_execucoes.first', read_only=True)
    nome_relatorio = serializers.CharField(source='relatorio.titulo', read_only=True)

    class Meta:
        model = Agendamento
        fields = [
            'id', 'empresa', 'relatorio', 'criado_por',
            'nome', 'frequencia', 'hora_execucao',
            'dias_semana', 'dia_mes',
            'filtros_padrao', 'enviar_email', 'emails_destino',
            'ativo', 'proxima_execucao', 'ultima_execucao',
            'criado_em', 'atualizado_em',
            'nome_relatorio', 'ultima_execucao_detalhe'
        ]
        read_only_fields = ['id', 'empresa', 'criado_por', 'proxima_execucao', 'ultima_execucao', 'criado_em', 'atualizado_em']
        
    def validate(self, data):
        """Validações customizadas de frequência"""
        if data.get('frequencia') == 'SEMANAL' and not data.get('dias_semana'):
            raise serializers.ValidationError({"dias_semana": "Obrigatório para frequência semanal."})
            
        if data.get('frequencia') == 'MENSAL' and not data.get('dia_mes'):
            raise serializers.ValidationError({"dia_mes": "Obrigatório para frequência mensal."})
            
        return data

    def create(self, validated_data):
        # Atribuir empresa e usuario do request context
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['empresa'] = request.user.empresa
            validated_data['criado_por'] = request.user
            
        return super().create(validated_data)
