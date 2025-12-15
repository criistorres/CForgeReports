"""
Serviço para validação de queries SQL.
Garante que apenas queries SELECT são executadas.
"""
import re

BLOCKED_KEYWORDS = [
    'INSERT', 'UPDATE', 'DELETE', 'DROP', 'TRUNCATE',
    'ALTER', 'CREATE', 'EXEC', 'EXECUTE', 'GRANT', 'REVOKE',
    'BACKUP', 'RESTORE', 'SHUTDOWN'
]


def validar_query(query: str) -> tuple[bool, str | None]:
    """
    Valida se a query é segura (apenas SELECT).

    Args:
        query: Query SQL a ser validada

    Returns:
        Tupla (valida: bool, mensagem_erro: str | None)
    """
    if not query or not query.strip():
        return False, 'Query não pode estar vazia'

    query_upper = query.upper().strip()

    # Remover comentários
    query_sem_comentarios = re.sub(r'--.*$', '', query_upper, flags=re.MULTILINE)
    query_sem_comentarios = re.sub(r'/\*.*?\*/', '', query_sem_comentarios, flags=re.DOTALL)
    query_sem_comentarios = query_sem_comentarios.strip()

    if not query_sem_comentarios:
        return False, 'Query não pode conter apenas comentários'

    # Deve começar com SELECT
    if not query_sem_comentarios.startswith('SELECT'):
        return False, 'Query deve começar com SELECT'

    # Verificar keywords bloqueadas
    for keyword in BLOCKED_KEYWORDS:
        pattern = rf'\b{keyword}\b'
        if re.search(pattern, query_sem_comentarios, re.IGNORECASE):
            return False, f'Comando {keyword} não é permitido'

    return True, None
