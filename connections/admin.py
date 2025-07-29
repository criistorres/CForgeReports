from django.contrib import admin
from .models import DatabaseConnection


@admin.register(DatabaseConnection)
class DatabaseConnectionAdmin(admin.ModelAdmin):
    list_display = ['nome', 'tipo_banco', 'servidor', 'banco', 'ativo', 'criado_por', 'criado_em']
    list_filter = ['tipo_banco', 'ativo', 'criado_em']
    search_fields = ['nome', 'servidor', 'banco']
    readonly_fields = ['criado_em', 'atualizado_em']
    
    def save_model(self, request, obj, form, change):
        if not change:  # Se é um novo objeto
            obj.criado_por = request.user
        super().save_model(request, obj, form, change)
