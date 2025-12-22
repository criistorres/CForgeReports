import os
import django
import random
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
from apps.empresas.models import Empresa
from apps.usuarios.models import Usuario
from apps.conexoes.models import Conexao
from apps.relatorios.models import Relatorio, Pasta, Filtro, Permissao, Favorito
from core.crypto import encrypt

def seed():
    print("🧹 Iniciando limpeza e seed realista...")

    # Limpar tudo
    Favorito.objects.all().delete()
    Permissao.objects.all().delete()
    Filtro.objects.all().delete()
    Relatorio.objects.all().delete()
    Pasta.objects.all().delete()
    Usuario.objects.all().delete()
    Conexao.objects.all().delete()
    Empresa.objects.all().delete()

    print("✅ Banco de dados limpo.")

    # 1. Criar Empresa
    empresa = Empresa.objects.create(
        nome='CForge Soluções Corporativas',
        slug='cforge',
        max_usuarios=100,
        max_conexoes=20,
        max_relatorios=500,
    )

    # 2. Conector com o Banco do Próprio Projeto (para os relatórios funcionarem)
    db_settings = settings.DATABASES['default']
    
    # Criar a conexão real
    conexao_real = Conexao.objects.create(
        empresa=empresa,
        nome='Banco Principal (PostgreSQL)',
        tipo='POSTGRESQL',
        host=db_settings.get('HOST', 'localhost'),
        porta=int(db_settings.get('PORT', 5432)),
        database=db_settings.get('NAME', 'forgereports'),
        usuario=db_settings.get('USER', 'postgres'),
        senha_encriptada=encrypt(db_settings.get('PASSWORD', '')),
        ativo=True
    )

    # Conexões Fake para o UI
    Conexao.objects.create(
        empresa=empresa,
        nome='ERP Legado (SQL Server)',
        tipo='SQLSERVER',
        host='192.168.1.50',
        porta=1433,
        database='erp_db',
        usuario='sa',
        senha_encriptada=encrypt('dummy'),
        ativo=True
    )
    
    Conexao.objects.create(
        empresa=empresa,
        nome='BI Analytics (MySQL)',
        tipo='MYSQL',
        host='db-analytics.internal',
        porta=3306,
        database='warehouse',
        usuario='read_only',
        senha_encriptada=encrypt('dummy'),
        ativo=False
    )

    print("🔌 Conexões configuradas (Principal + Fakes).")

    # 3. Usuários
    admin = Usuario.objects.create(email='admin@cforge.com', nome='Admin Sistema', role='ADMIN', empresa=empresa, ativo=True)
    admin.set_password('admin123')
    admin.save()

    tecnicos = []
    for nome in ['Ricardo Técnico', 'Juliana Dev', 'Marcos DevOps']:
        u = Usuario.objects.create(
            email=f"{nome.split()[0].lower()}@cforge.com",
            nome=nome,
            role='TECNICO',
            empresa=empresa,
            ativo=True
        )
        u.set_password('senha123')
        u.save()
        tecnicos.append(u)

    usuarios_comuns = []
    nomes = [
        'Ana Silva', 'Bruno Souza', 'Carla Dias', 'Daniel Oliveira', 'Elena Martins',
        'Fabio Lima', 'Gisele Costa', 'Hugo Ferreira', 'Iara Santos', 'João Prado',
        'Kelly Rocha', 'Leonardo Vaz', 'Márcia Luz', 'Nivaldo Bento', 'Otávio Melo',
        'Paola Bracho', 'Quitéria Silva', 'Renato Russo', 'Sabrina Sato', 'Tiago Abravanel'
    ]
    for nome in nomes:
        email = f"{nome.replace(' ', '.').lower()}@cforge.com"
        u = Usuario.objects.create(email=email, nome=nome, role='USUARIO', empresa=empresa, ativo=True)
        u.set_password('senha123')
        u.save()
        usuarios_comuns.append(u)

    print(f"👥 {Usuario.objects.count()} Usuários criados.")

    # 4. Pastas
    pastas_data = {
        'Administração': ['Usuários', 'Empresas', 'Configurações'],
        'Técnico': ['Logs', 'Bancos de Dados', 'Queries Lentas'],
        'Relatórios de Auditoria': ['Acessos', 'Permissões'],
    }
    
    pastas_obj = {}
    for p_pai, subs in pastas_data.items():
        pai = Pasta.objects.create(nome=p_pai, empresa=empresa)
        pastas_obj[p_pai] = pai
        for s in subs:
            Pasta.objects.create(nome=s, empresa=empresa, pasta_pai=pai)

    print("📂 Estrutura de pastas hierárquica criada.")

    # 5. Relatórios que FUNCIONAM (usam o banco do projeto)
    relatorios_def = [
        {
            'nome': 'Listagem Geral de Usuários',
            'pasta': 'Administração',
            'sql': 'SELECT id, nome, email, role, ativo FROM usuarios ORDER BY nome',
            'desc': 'Retorna todos os usuários cadastrados no sistema.'
        },
        {
            'nome': 'Auditoria de Administradores',
            'pasta': 'Administração',
            'sql': "SELECT nome, email, criado_em FROM usuarios WHERE role = 'ADMIN'",
            'desc': 'Lista apenas os usuários com perfil de administrador.'
        },
        {
            'nome': 'Status das Conexões de Banco',
            'pasta': 'Técnico',
            'sql': 'SELECT nome, tipo, host, database, ativo FROM conexoes',
            'desc': 'Visão geral das conexões configuradas.'
        },
        {
            'nome': 'Relatórios por Empresa',
            'pasta': 'Administração',
            'sql': 'SELECT e.nome as empresa, count(r.id) as total_relatorios FROM empresas e LEFT JOIN relatorios r ON e.id = r.empresa_id GROUP BY e.nome',
            'desc': 'Resumo da quantidade de relatórios por empresa.'
        },
        {
            'nome': 'Histórico de Pastas Criadas',
            'pasta': 'Técnico',
            'sql': 'SELECT nome, criado_em FROM pastas ORDER BY criado_em DESC',
            'desc': 'Lista cronológica das pastas de organização.'
        },
        {
            'nome': 'Mapeamento de Permissões',
            'pasta': 'Relatórios de Auditoria',
            'sql': 'SELECT u.nome as usuario, r.nome as relatorio, p.nivel FROM permissoes p JOIN usuarios u ON p.usuario_id = u.id JOIN relatorios r ON p.relatorio_id = r.id',
            'desc': 'Relatório cruzado de quem pode ver o quê.'
        }
    ]

    todos_relatorios = []
    for r_data in relatorios_def:
        # Tentar pegar pasta pai
        p_obj = Pasta.objects.filter(nome=r_data['pasta'], empresa=empresa).first()
        
        r = Relatorio.objects.create(
            empresa=empresa,
            conexao=conexao_real,
            pasta=p_obj,
            nome=r_data['nome'],
            descricao=r_data['desc'],
            query_sql=r_data['sql'],
            criado_por=random.choice(tecnicos),
            ativo=True
        )
        todos_relatorios.append(r)
        
        # Adicionar alguns filtros mock
        if 'WHERE' in r_data['sql'].upper():
            Filtro.objects.create(
                relatorio=r,
                parametro='ativo',
                label='Mostrar apenas ativos?',
                tipo='LISTA',
                opcoes=['true', 'false'],
                obrigatorio=False,
                ordem=1
            )

    print(f"📊 {len(todos_relatorios)} Relatórios funcionais (PostgreSQL) criados.")

    # 6. Permissões e Favoritos
    for u in usuarios_comuns:
        # Acesso a 3 relatórios aleatórios
        selecionados = random.sample(todos_relatorios, 3)
        for r in selecionados:
            Permissao.objects.create(
                relatorio=r,
                usuario=u,
                nivel=random.choice(['VISUALIZAR', 'EXPORTAR']),
                criado_por=admin
            )
            if random.random() < 0.3:
                Favorito.objects.create(usuario=u, relatorio=r)

    # Técnicos e Admins têm acesso a tudo
    for staff in tecnicos:
        for r in todos_relatorios:
            Permissao.objects.get_or_create(relatorio=r, usuario=staff, defaults={'nivel': 'EXPORTAR', 'criado_por': admin})

    print("🔑 Permissões distribuídas.")
    print("\n🚀 Seed Finalizado!")
    print(f"Admin: admin@cforge.com / admin123")
    print(f"Usuário Exemplo: {usuarios_comuns[0].email} / senha123")

if __name__ == '__main__':
    seed()
