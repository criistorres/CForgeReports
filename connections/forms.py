from django import forms
from .models import DatabaseConnection


class DatabaseConnectionForm(forms.ModelForm):
    """
    Form simples para DatabaseConnection
    Sem validações complexas conforme solicitado
    """
    
    class Meta:
        model = DatabaseConnection
        fields = ['nome', 'tipo_banco', 'servidor', 'banco', 'usuario', 'senha', 'ativo']
        
        widgets = {
            'nome': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nome da conexão (ex: Servidor Teste)'
            }),
            'tipo_banco': forms.Select(attrs={
                'class': 'form-control'
            }),
            'servidor': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'IP ou nome do servidor (ex: 192.168.1.100)'
            }),
            'banco': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nome do banco de dados'
            }),
            'usuario': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Usuário do banco'
            }),
            'senha': forms.PasswordInput(attrs={
                'class': 'form-control',
                'placeholder': 'Senha do banco'
            }),
            'ativo': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            })
        }
        
        labels = {
            'nome': 'Nome da Conexão',
            'tipo_banco': 'Tipo do Banco',
            'servidor': 'Servidor',
            'banco': 'Nome do Banco',
            'usuario': 'Usuário',
            'senha': 'Senha',
            'ativo': 'Ativo'
        }
        
        help_texts = {
            'tipo_banco': 'Apenas SQL Server funciona no MVP',
            'servidor': 'IP ou nome do servidor de banco de dados',
            'senha': 'Senha será armazenada em texto puro (MVP)'
        }


class TestConnectionForm(forms.Form):
    """
    Form para testar conexão (apenas ID da conexão)
    """
    connection_id = forms.IntegerField(widget=forms.HiddenInput())