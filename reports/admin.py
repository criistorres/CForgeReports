from django.contrib import admin
from .models import ReportFolder, Report, ReportFilter


@admin.register(ReportFolder)
class ReportFolderAdmin(admin.ModelAdmin):
    list_display = ['nome', 'pasta_pai', 'criado_por', 'criado_em']
    list_filter = ['criado_em']
    search_fields = ['nome']
    readonly_fields = ['criado_em']
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.criado_por = request.user
        super().save_model(request, obj, form, change)


class ReportFilterInline(admin.TabularInline):
    model = ReportFilter
    extra = 1
    fields = ['nome', 'tipo', 'opcoes_select', 'obrigatorio', 'ordem']


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['nome', 'pasta', 'conexao_banco', 'ativo', 'criado_por', 'criado_em']
    list_filter = ['ativo', 'pasta', 'conexao_banco', 'criado_em']
    search_fields = ['nome', 'descricao']
    readonly_fields = ['criado_em', 'atualizado_em']
    filter_horizontal = ['usuarios_permitidos']
    inlines = [ReportFilterInline]
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('nome', 'descricao', 'pasta', 'ativo')
        }),
        ('Configuração SQL', {
            'fields': ('conexao_banco', 'sql_query')
        }),
        ('Permissões', {
            'fields': ('usuarios_permitidos',)
        }),
        ('Metadados', {
            'fields': ('criado_em', 'atualizado_em'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.criado_por = request.user
        super().save_model(request, obj, form, change)


@admin.register(ReportFilter)
class ReportFilterAdmin(admin.ModelAdmin):
    list_display = ['nome', 'relatorio', 'tipo', 'obrigatorio', 'ordem']
    list_filter = ['tipo', 'obrigatorio']
    search_fields = ['nome', 'relatorio__nome']
