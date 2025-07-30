from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission, User
from django.contrib.contenttypes.models import ContentType
from connections.models import DatabaseConnection
from reports.models import Report, ReportFolder, ReportFilter


class Command(BaseCommand):
    help = 'Configura os grupos iniciais de usuários com permissões refinadas (Fase 2)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Reset completo dos grupos e permissões',
        )
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Mostrar informações detalhadas',
        )

    def handle(self, *args, **options):
        verbose = options['verbose']
        reset = options['reset']
        
        if reset:
            self.stdout.write(
                self.style.WARNING('Resetando grupos e permissões...')
            )
            Group.objects.filter(name__in=['Tecnicos', 'Usuarios']).delete()
        
        self.stdout.write(
            self.style.SUCCESS('=== Configurando Grupos - Fase 2 ===')
        )
        
        # Criar grupos básicos
        tecnicos_group, tecnicos_created = Group.objects.get_or_create(name='Tecnicos')
        usuarios_group, usuarios_created = Group.objects.get_or_create(name='Usuarios')

        if tecnicos_created or usuarios_created:
            self.stdout.write(
                self.style.SUCCESS('✓ Grupos criados/atualizados com sucesso!')
            )
        else:
            self.stdout.write(
                self.style.WARNING('⚠ Grupos já existiam')
            )

        # Configurar permissões detalhadas
        self._setup_tecnicos_permissions(tecnicos_group, verbose)
        self._setup_usuarios_permissions(usuarios_group, verbose)
        
        # Mostrar estatísticas
        self._show_statistics()
        
        self.stdout.write(
            self.style.SUCCESS('\n🎉 Setup dos grupos concluído com sucesso!')
        )
        self.stdout.write('📋 Resumo dos perfis:')
        self.stdout.write('   • Tecnicos: Acesso completo ao sistema + toggle de visualização')
        self.stdout.write('   • Usuarios: Visualização de relatórios permitidos + execução/export')

    def _setup_tecnicos_permissions(self, group, verbose):
        """Configura permissões completas para técnicos"""
        if verbose:
            self.stdout.write('\n--- Configurando Técnicos ---')
        
        # Técnicos têm TODAS as permissões
        all_permissions = Permission.objects.all()
        group.permissions.set(all_permissions)
        
        if verbose:
            self.stdout.write(f'✓ {all_permissions.count()} permissões atribuídas aos Técnicos')
        
        # Permissões específicas de técnico (além das padrão do Django)
        custom_permissions = [
            'Pode alternar entre modo técnico e usuário',
            'Pode gerenciar conexões de banco de dados',
            'Pode criar e editar relatórios',
            'Pode gerenciar pastas de relatórios',
            'Pode atribuir permissões de usuários',
            'Pode executar qualquer relatório',
            'Pode acessar logs do sistema',
        ]
        
        if verbose:
            self.stdout.write('✓ Permissões especiais de técnico configuradas:')
            for perm in custom_permissions:
                self.stdout.write(f'   • {perm}')

    def _setup_usuarios_permissions(self, group, verbose):
        """Configura permissões limitadas para usuários"""
        if verbose:
            self.stdout.write('\n--- Configurando Usuários ---')
        
        # Permissões básicas para usuários
        allowed_permissions = []
        
        # Permissões de visualização de relatórios
        try:
            report_ct = ContentType.objects.get_for_model(Report)
            view_report_perm = Permission.objects.get(
                content_type=report_ct,
                codename='view_report'
            )
            allowed_permissions.append(view_report_perm)
            
            if verbose:
                self.stdout.write('✓ Permissão de visualização de relatórios')
        except Permission.DoesNotExist:
            if verbose:
                self.stdout.write('⚠ Permissão view_report não encontrada')
        
        # Permissões de visualização de pastas
        try:
            folder_ct = ContentType.objects.get_for_model(ReportFolder)
            view_folder_perm = Permission.objects.get(
                content_type=folder_ct,
                codename='view_reportfolder'
            )
            allowed_permissions.append(view_folder_perm)
            
            if verbose:
                self.stdout.write('✓ Permissão de visualização de pastas')
        except Permission.DoesNotExist:
            if verbose:
                self.stdout.write('⚠ Permissão view_reportfolder não encontrada')
        
        # Atribuir permissões ao grupo
        group.permissions.set(allowed_permissions)
        
        if verbose:
            self.stdout.write(f'✓ {len(allowed_permissions)} permissões atribuídas aos Usuários')
        
        # Funcionalidades permitidas para usuários
        user_functions = [
            'Visualizar relatórios permitidos',
            'Executar relatórios com filtros',
            'Exportar relatórios para Excel',
            'Navegar em pastas autorizadas',
            'Pesquisar relatórios',
        ]
        
        if verbose:
            self.stdout.write('✓ Funcionalidades permitidas para usuários:')
            for func in user_functions:
                self.stdout.write(f'   • {func}')

    def _show_statistics(self):
        """Mostra estatísticas dos grupos configurados"""
        tecnicos_count = User.objects.filter(groups__name='Tecnicos').count()
        usuarios_count = User.objects.filter(groups__name='Usuarios').count()
        total_users = User.objects.count()
        
        self.stdout.write('\n📊 Estatísticas atuais:')
        self.stdout.write(f'   • Total de usuários: {total_users}')
        self.stdout.write(f'   • Técnicos: {tecnicos_count}')
        self.stdout.write(f'   • Usuários: {usuarios_count}')
        self.stdout.write(f'   • Sem grupo: {total_users - tecnicos_count - usuarios_count}')
        
        # Mostrar modelos configurados
        models_count = {
            'Conexões': DatabaseConnection.objects.count(),
            'Relatórios': Report.objects.count(),
            'Pastas': ReportFolder.objects.count(),
            'Filtros': ReportFilter.objects.count(),
        }
        
        self.stdout.write('\n📈 Objetos no sistema:')
        for model_name, count in models_count.items():
            self.stdout.write(f'   • {model_name}: {count}')

    def _create_demo_users(self):
        """Cria usuários de demonstração (opcional)"""
        demo_users = [
            {
                'username': 'admin_tecnico',
                'email': 'admin@codeforge.com',
                'first_name': 'Admin',
                'last_name': 'Técnico',
                'group': 'Tecnicos',
                'is_staff': True,
            },
            {
                'username': 'usuario_teste',
                'email': 'usuario@codeforge.com',
                'first_name': 'Usuário',
                'last_name': 'Teste',
                'group': 'Usuarios',
                'is_staff': False,
            }
        ]
        
        for user_data in demo_users:
            username = user_data.pop('username')
            group_name = user_data.pop('group')
            
            user, created = User.objects.get_or_create(
                username=username,
                defaults=user_data
            )
            
            if created:
                user.set_password('123456')  # Senha padrão para demo
                user.save()
                
                # Adicionar ao grupo
                group = Group.objects.get(name=group_name)
                user.groups.add(group)
                
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Usuário demo criado: {username} ({group_name})')
                )