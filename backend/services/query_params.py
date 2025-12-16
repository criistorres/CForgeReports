"""
Serviço para substituição de parâmetros em queries SQL.
Usado para filtros dinâmicos em relatórios.
"""
from datetime import datetime, date
import re


def substituir_parametros(query: str, filtros: list, valores: dict) -> tuple[str, str | None]:
    """
    Substitui placeholders na query pelos valores dos filtros.

    Args:
        query: Query SQL com placeholders (ex: @data_inicio)
        filtros: Lista de objetos Filtro do relatório
        valores: Dicionário com valores fornecidos pelo usuário {parametro: valor}

    Returns:
        Tupla (query_final, erro):
        - query_final: Query com parâmetros substituídos
        - erro: Mensagem de erro ou None se sucesso

    Example:
        >>> filtros = [Filtro(parametro='@data', tipo='DATA', obrigatorio=True, label='Data')]
        >>> valores = {'@data': '2024-01-01'}
        >>> query_final, erro = substituir_parametros(
        ...     "SELECT * FROM vendas WHERE data = @data",
        ...     filtros,
        ...     valores
        ... )
        >>> query_final
        "SELECT * FROM vendas WHERE data = '2024-01-01'"
    """
    query_final = query

    for filtro in filtros:
        param = filtro.parametro
        valor = valores.get(param)

        # Validar obrigatórios
        if filtro.obrigatorio and (valor is None or valor == ''):
            return '', f'Filtro "{filtro.label}" é obrigatório'

        # Se não for obrigatório e não tiver valor, usar valor padrão ou pular
        if valor is None or valor == '':
            if filtro.valor_padrao:
                valor = filtro.valor_padrao
            else:
                # Se não tem valor e não é obrigatório, substituir por NULL
                valor_formatado = 'NULL'
                query_final = query_final.replace(param, valor_formatado)
                continue

        # Formatar valor de acordo com o tipo
        try:
            valor_formatado = formatar_valor(valor, filtro.tipo)
        except ValueError as e:
            return '', f'Erro no filtro "{filtro.label}": {str(e)}'

        # Substituir na query
        query_final = query_final.replace(param, valor_formatado)

    return query_final, None


def formatar_valor(valor, tipo: str) -> str:
    """
    Formata valor para uso seguro em SQL.

    Args:
        valor: Valor a ser formatado
        tipo: Tipo do filtro (DATA, TEXTO, NUMERO, LISTA)

    Returns:
        String formatada para inserção na query SQL

    Raises:
        ValueError: Se o valor não puder ser formatado para o tipo especificado
    """
    if valor is None or valor == '':
        return 'NULL'

    if tipo == 'DATA':
        # Aceita string ISO ou objeto date/datetime
        if isinstance(valor, datetime):
            return f"'{valor.strftime('%Y-%m-%d')}'"
        elif isinstance(valor, date):
            return f"'{valor.strftime('%Y-%m-%d')}'"
        else:
            # Validar formato de data
            try:
                # Tenta parsear para validar
                date_obj = datetime.strptime(str(valor), '%Y-%m-%d')
                return f"'{date_obj.strftime('%Y-%m-%d')}'"
            except ValueError:
                raise ValueError(f'Data inválida: {valor}. Use formato YYYY-MM-DD')

    elif tipo == 'TEXTO' or tipo == 'LISTA':
        # Escapar aspas simples para prevenir SQL injection
        valor_escapado = str(valor).replace("'", "''")
        return f"'{valor_escapado}'"

    elif tipo == 'NUMERO':
        try:
            # Tenta converter para float para validar
            valor_num = float(valor)
            return str(valor_num)
        except (ValueError, TypeError):
            raise ValueError(f'Número inválido: {valor}')

    # Tipo desconhecido - tratar como texto
    valor_escapado = str(valor).replace("'", "''")
    return f"'{valor_escapado}'"


def extrair_parametros_query(query: str) -> list[str]:
    """
    Extrai todos os parâmetros (placeholders) de uma query SQL.
    Busca por padrão @nome_parametro.

    Args:
        query: Query SQL

    Returns:
        Lista de parâmetros encontrados (ex: ['@data_inicio', '@vendedor'])

    Example:
        >>> extrair_parametros_query("SELECT * FROM vendas WHERE data = @data AND vendedor = @vendedor")
        ['@data', '@vendedor']
    """
    # Padrão: @ seguido de letras, números ou underscore
    parametros = re.findall(r'@\w+', query)
    # Retornar lista única (sem duplicatas)
    return list(set(parametros))
