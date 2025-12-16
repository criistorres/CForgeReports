"""
Serviço de verificação de permissões de relatórios.
"""
from apps.relatorios.models import Permissao


def verificar_permissao(relatorio_id: str, usuario) -> dict:
    """
    Verifica permissão do usuário no relatório.

    Args:
        relatorio_id: ID do relatório
        usuario: Instância do usuário

    Returns:
        dict: {'tem_acesso': bool, 'pode_exportar': bool}
    """
    # Admin e Técnico sempre têm acesso total
    if usuario.role in ['ADMIN', 'TECNICO']:
        return {'tem_acesso': True, 'pode_exportar': True}

    # Buscar permissão explícita
    try:
        permissao = Permissao.objects.get(
            relatorio_id=relatorio_id,
            usuario=usuario
        )
        return {
            'tem_acesso': True,
            'pode_exportar': permissao.nivel == 'EXPORTAR'
        }
    except Permissao.DoesNotExist:
        return {'tem_acesso': False, 'pode_exportar': False}


def usuario_pode_ver_relatorio(relatorio_id: str, usuario) -> bool:
    """
    Verifica se o usuário tem permissão para visualizar o relatório.

    Args:
        relatorio_id: ID do relatório
        usuario: Instância do usuário

    Returns:
        bool: True se pode visualizar
    """
    perm = verificar_permissao(relatorio_id, usuario)
    return perm['tem_acesso']


def usuario_pode_exportar_relatorio(relatorio_id: str, usuario) -> bool:
    """
    Verifica se o usuário tem permissão para exportar o relatório.

    Args:
        relatorio_id: ID do relatório
        usuario: Instância do usuário

    Returns:
        bool: True se pode exportar
    """
    perm = verificar_permissao(relatorio_id, usuario)
    return perm['pode_exportar']
