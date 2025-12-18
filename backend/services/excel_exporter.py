"""
Serviço para exportação de dados para Excel.
"""
import pandas as pd
from io import BytesIO


class ExcelExporter:
    """
    Exporta resultados de queries para Excel.
    Baseado no código funcional do MVP (forgereports/reports/views.py).
    """

    def exportar(self, relatorio, filtros: dict = None) -> BytesIO:
        """
        Exporta relatório completo para Excel.

        Args:
            relatorio: Instância do modelo Relatorio
            filtros: Dicionário com filtros aplicados

        Returns:
            BytesIO com o arquivo Excel
        """
        from services.database_connector import DatabaseConnector
        from services.query_params import substituir_parametros

        # Buscar filtros do relatório
        filtros_objetos = list(relatorio.filtros.all())

        # Substituir parâmetros na query se houver filtros
        query = relatorio.query_sql
        if filtros_objetos and filtros:
            query, erro = substituir_parametros(query, filtros_objetos, filtros)
            if erro:
                raise ValueError(erro)

        connector = DatabaseConnector(relatorio.conexao)
        conn = connector.get_connection()

        df = pd.read_sql(query, conn)
        conn.close()

        # Remover timezone de colunas datetime para compatibilidade com Excel
        for col in df.columns:
            if pd.api.types.is_datetime64tz_dtype(df[col]):
                df[col] = df[col].dt.tz_localize(None)

        # Substituir NaN, inf e -inf por None para compatibilidade com Excel
        import numpy as np
        df = df.replace([np.inf, -np.inf, np.nan], None)

        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Dados', index=False)

            # Auto-ajustar largura das colunas
            worksheet = writer.sheets['Dados']
            for idx, col in enumerate(df.columns):
                try:
                    col_max = df[col].astype(str).map(len).max() if len(df) > 0 else 0
                    max_length = max(col_max, len(str(col))) + 2
                    # Limitar largura máxima em 50 caracteres
                    col_letter = self._get_column_letter(idx)
                    worksheet.column_dimensions[col_letter].width = min(max_length, 50)
                except:
                    # Se houver erro, usar largura padrão
                    col_letter = self._get_column_letter(idx)
                    worksheet.column_dimensions[col_letter].width = 15

        output.seek(0)
        return output

    def _get_column_letter(self, idx: int) -> str:
        """
        Converte índice de coluna (0-based) para letra Excel (A, B, ..., Z, AA, AB, ...).

        Args:
            idx: Índice da coluna (0 = A, 1 = B, etc.)

        Returns:
            Letra da coluna no formato Excel
        """
        result = ''
        idx += 1  # Excel é 1-based
        while idx > 0:
            idx -= 1
            result = chr(65 + (idx % 26)) + result
            idx //= 26
        return result
