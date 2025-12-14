import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.empresas.models import Empresa
from apps.usuarios.models import Usuario


def seed():
    print("Iniciando seed do banco de dados...")

    # Criar empresa demo
    empresa, created = Empresa.objects.get_or_create(
        slug='demo',
        defaults={
            'nome': 'Empresa Demo',
            'max_usuarios': 10,
            'max_conexoes': 5,
            'max_relatorios': 50,
        }
    )
    print(f"Empresa: {empresa.nome} ({'criada' if created else 'já existia'})")

    # Criar admin
    admin, created = Usuario.objects.get_or_create(
        email='admin@demo.com',
        empresa=empresa,
        defaults={
            'nome': 'Administrador',
            'role': 'ADMIN',
            'ativo': True,
        }
    )
    if created:
        admin.set_password('admin123')
        admin.save()
        print(f"Admin criado: {admin.email} / admin123")
    else:
        print(f"Admin já existe: {admin.email}")

    # Criar um técnico
    tecnico, created = Usuario.objects.get_or_create(
        email='tecnico@demo.com',
        empresa=empresa,
        defaults={
            'nome': 'Técnico',
            'role': 'TECNICO',
            'ativo': True,
        }
    )
    if created:
        tecnico.set_password('tecnico123')
        tecnico.save()
        print(f"Técnico criado: {tecnico.email} / tecnico123")
    else:
        print(f"Técnico já existe: {tecnico.email}")

    # Criar um usuário comum
    usuario, created = Usuario.objects.get_or_create(
        email='usuario@demo.com',
        empresa=empresa,
        defaults={
            'nome': 'Usuário',
            'role': 'USUARIO',
            'ativo': True,
        }
    )
    if created:
        usuario.set_password('usuario123')
        usuario.save()
        print(f"Usuário criado: {usuario.email} / usuario123")
    else:
        print(f"Usuário já existe: {usuario.email}")

    print("\nSeed concluído com sucesso!")
    print("\nCredenciais de acesso:")
    print("- Admin: admin@demo.com / admin123")
    print("- Técnico: tecnico@demo.com / tecnico123")
    print("- Usuário: usuario@demo.com / usuario123")


if __name__ == '__main__':
    seed()
