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

    def executar(self, usuario, filtros: dict = None, limite: int = None) -> dict:
        """
        Executa relatório e retorna resultado.

        Args:
            usuario: Usuário que está executando
            filtros: Dicionário com filtros aplicados (para fase 4)
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

        # Criar registro de execução
        execucao = Execucao.objects.create(
            empresa=self.relatorio.empresa,
            relatorio=self.relatorio,
            usuario=usuario,
            filtros_usados=filtros
        )

        try:
            # Executar query
            conn = self.connector.get_connection()
            df = pd.read_sql(self.relatorio.query_sql, conn)
            conn.close()

            tempo_ms = int((datetime.now() - inicio).total_seconds() * 1000)
            total_linhas = len(df)

            # Limitar linhas para exibição
            df_limitado = df.head(limite)

            # Atualizar execução
            execucao.finalizado_em = timezone.now()
            execucao.tempo_execucao_ms = tempo_ms
            execucao.sucesso = True
            execucao.qtd_linhas = total_linhas
            execucao.save()

            return {
                'sucesso': True,
                'colunas': df_limitado.columns.tolist(),
                'dados': df_limitado.to_dict('records'),
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
