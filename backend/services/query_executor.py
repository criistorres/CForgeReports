"""
Serviço para execução de queries SQL.
Registra todas as execuções no banco para auditoria.
"""
import pandas as pd
from datetime import datetime
from django.utils import timezone
from apps.relatorios.models import Relatorio
from apps.execucoes.models import Execucao
from services.database_connector import DatabaseConnector
from services.query_params import substituir_parametros


class QueryExecutor:
    """
    Executa queries SQL e registra o histórico de execuções.
    Baseado no código funcional do MVP (forgereports/reports/views.py).
    """

    def __init__(self, relatorio: Relatorio):
        """
        Inicializa o executor com um relatório.

        Args:
            relatorio: Instância do modelo Relatorio
        """
        self.relatorio = relatorio
        self.connector = DatabaseConnector(relatorio.conexao)

    def executar(self, usuario, filtros_valores: dict = None, limite: int = None) -> dict:
        """
        Executa relatório e retorna resultado.

        Args:
            usuario: Usuário que está executando
            filtros_valores: Dicionário com valores dos filtros {parametro: valor}
            limite: Limite de linhas para exibição (padrão: limite_linhas_tela do relatório)

        Returns:
            Dicionário com resultado da execução:
            {
                'sucesso': bool,
                'colunas': list,
                'dados': list,
                'total_linhas': int,
                'linhas_exibidas': int,
                'tempo_ms': int,
                'execucao_id': str
            }
            Ou em caso de erro:
            {
                'sucesso': False,
                'erro': str
            }
        """
        inicio = datetime.now()
        limite = limite or self.relatorio.limite_linhas_tela

        # Buscar filtros do relatório
        filtros = list(self.relatorio.filtros.all())

        # Substituir parâmetros na query se houver filtros
        query = self.relatorio.query_sql
        if filtros and filtros_valores:
            query, erro = substituir_parametros(query, filtros, filtros_valores)
            if erro:
                return {'sucesso': False, 'erro': erro}

        # Criar registro de execução
        execucao = Execucao.objects.create(
            empresa=self.relatorio.empresa,
            relatorio=self.relatorio,
            usuario=usuario,
            filtros_usados=filtros_valores
        )

        try:
            # Executar query
            conn = self.connector.get_connection()
            df = pd.read_sql(query, conn)
            conn.close()

            tempo_ms = int((datetime.now() - inicio).total_seconds() * 1000)
            total_linhas = len(df)

            # Limitar linhas para exibição
            df_limitado = df.head(limite)

            # Converter para dicionário e tratar valores NaN/None
            import json
            import numpy as np

            # Substituir NaN, inf e -inf por None
            dados = df_limitado.replace([np.inf, -np.inf, np.nan], None).to_dict('records')

            # Garantir que todos os valores são JSON serializáveis
            dados_limpos = []
            for row in dados:
                row_limpo = {}
                for key, value in row.items():
                    if pd.isna(value) or value is pd.NaT or value is pd.NA:
                        row_limpo[key] = None
                    elif isinstance(value, (np.integer, np.floating)):
                        if np.isnan(value) or np.isinf(value):
                            row_limpo[key] = None
                        else:
                            row_limpo[key] = value.item()
                    else:
                        row_limpo[key] = value
                dados_limpos.append(row_limpo)

            # Atualizar execução
            execucao.finalizado_em = timezone.now()
            execucao.tempo_execucao_ms = tempo_ms
            execucao.sucesso = True
            execucao.qtd_linhas = total_linhas
            execucao.save()

            return {
                'sucesso': True,
                'colunas': df_limitado.columns.tolist(),
                'dados': dados_limpos,
                'total_linhas': total_linhas,
                'linhas_exibidas': len(df_limitado),
                'tempo_ms': tempo_ms,
                'execucao_id': str(execucao.id)
            }

        except Exception as e:
            tempo_ms = int((datetime.now() - inicio).total_seconds() * 1000)

            execucao.finalizado_em = timezone.now()
            execucao.tempo_execucao_ms = tempo_ms
            execucao.sucesso = False
            execucao.erro = str(e)
            execucao.save()

            return {
                'sucesso': False,
                'erro': str(e)
            }
