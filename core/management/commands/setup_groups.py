from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from connections.models import DatabaseConnection
from reports.models import Report, ReportFolder, ReportFilter


class Command(BaseCommand):
    help = 'Configura os grupos iniciais de usuários (Tecnicos e Usuarios)'

    def handle(self, *args, **options):
        # Criar grupos
        tecnicos_group, created = Group.objects.get_or_create(name='Tecnicos')
        usuarios_group, created = Group.objects.get_or_create(name='Usuarios')

        if created:
            self.stdout.write(
                self.style.SUCCESS('Grupos criados com sucesso!')
            )
        else:
            self.stdout.write(
                self.style.WARNING('Grupos já existem')
            )

        # Configurar permissões para Técnicos (acesso total)
        all_permissions = Permission.objects.all()
        tecnicos_group.permissions.set(all_permissions)

        # Configurar permissões para Usuários (apenas visualização de relatórios)
        report_content_type = ContentType.objects.get_for_model(Report)
        view_report_permission = Permission.objects.get(
            content_type=report_content_type,
            codename='view_report'
        )
        usuarios_group.permissions.set([view_report_permission])

        self.stdout.write(
            self.style.SUCCESS('Permissões configuradas com sucesso!')
        )
        
        self.stdout.write(
            self.style.SUCCESS('Setup dos grupos concluído!')
        )
        self.stdout.write('- Tecnicos: Acesso completo ao sistema')
        self.stdout.write('- Usuarios: Apenas visualização de relatórios permitidos')