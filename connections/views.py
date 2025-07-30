from django.shortcuts import render, get_object_or_404
from django.contrib import messages
from django.views.generic import ListView, CreateView, UpdateView, DeleteView, View
from django.urls import reverse_lazy
from django.http import JsonResponse
from core.mixins import TecnicoRequiredMixin
from .models import DatabaseConnection
from .forms import DatabaseConnectionForm
from .services import ConnectionService


class ConnectionListView(TecnicoRequiredMixin, ListView):
    """
    Lista todas as conexões de banco
    """
    model = DatabaseConnection
    template_name = 'connections/connection_list.html'
    context_object_name = 'connections'
    paginate_by = 20
    
    def get_queryset(self):
        return DatabaseConnection.objects.all().order_by('-criado_em')


class ConnectionCreateView(TecnicoRequiredMixin, CreateView):
    """
    Cria nova conexão de banco
    """
    model = DatabaseConnection
    form_class = DatabaseConnectionForm
    template_name = 'connections/connection_form.html'
    success_url = reverse_lazy('connections:list')
    
    def form_valid(self, form):
        form.instance.criado_por = self.request.user
        messages.success(self.request, f'Conexão "{form.instance.nome}" criada com sucesso!')
        return super().form_valid(form)


class ConnectionUpdateView(TecnicoRequiredMixin, UpdateView):
    """
    Edita conexão existente
    """
    model = DatabaseConnection
    form_class = DatabaseConnectionForm
    template_name = 'connections/connection_form.html'
    success_url = reverse_lazy('connections:list')
    
    def form_valid(self, form):
        messages.success(self.request, f'Conexão "{form.instance.nome}" atualizada com sucesso!')
        return super().form_valid(form)


class ConnectionDeleteView(TecnicoRequiredMixin, DeleteView):
    """
    Exclui conexão
    """
    model = DatabaseConnection
    template_name = 'connections/connection_confirm_delete.html'
    success_url = reverse_lazy('connections:list')
    
    def delete(self, request, *args, **kwargs):
        obj = self.get_object()
        messages.success(request, f'Conexão "{obj.nome}" excluída com sucesso!')
        return super().delete(request, *args, **kwargs)


class TestConnectionView(TecnicoRequiredMixin, View):
    """
    Testa conexão via AJAX
    """
    
    def post(self, request, pk):
        """
        Testa a conexão e retorna JSON
        """
        try:
            connection = get_object_or_404(DatabaseConnection, pk=pk)
            
            # Testar conexão usando o service
            success, message = ConnectionService.test_connection(connection)
            
            return JsonResponse({
                'success': success,
                'message': message,
                'connection_name': connection.nome,
                'connection_type': connection.get_tipo_banco_display()
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Erro interno: {str(e)}',
                'connection_name': 'Desconhecido',
                'connection_type': 'N/A'
            })


class ConnectionDetailView(TecnicoRequiredMixin, View):
    """
    Exibe detalhes da conexão (simples)
    """
    
    def get(self, request, pk):
        connection = get_object_or_404(DatabaseConnection, pk=pk)
        
        # Informações do servidor atual
        server_info = ConnectionService.get_server_info()
        
        context = {
            'connection': connection,
            'server_info': server_info
        }
        
        return render(request, 'connections/connection_detail.html', context)