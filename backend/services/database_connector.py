"""
Serviço para conexão com bancos de dados externos.
Suporta SQL Server, PostgreSQL e MySQL.
"""
import pyodbc
from apps.conexoes.models import Conexao
from core.crypto import decrypt


class DatabaseConnector:
    """
    Gerencia conexões com bancos de dados externos.
    Baseado no código funcional do MVP (forgereports/reports/views.py).
    """

    TIMEOUT = 30  # Timeout padrão de 30 segundos

    def __init__(self, conexao: Conexao):
        """
        Inicializa o conector com uma instância de Conexao.

        Args:
            conexao: Instância do modelo Conexao
        """
        self.conexao = conexao
        self.senha = decrypt(conexao.senha_encriptada)

    def get_connection(self):
        """
        Retorna uma conexão ativa com o banco.

        Returns:
            Conexão do pyodbc, psycopg2 ou pymysql (dependendo do tipo)

        Raises:
            ValueError: Se o tipo de banco não for suportado
            Exception: Se houver erro na conexão
        """
        if self.conexao.tipo == 'SQLSERVER':
            return self._connect_sqlserver()
        elif self.conexao.tipo == 'POSTGRESQL':
            return self._connect_postgresql()
        elif self.conexao.tipo == 'MYSQL':
            return self._connect_mysql()
        else:
            raise ValueError(f"Tipo de banco não suportado: {self.conexao.tipo}")

    def _connect_sqlserver(self):
        """Conecta ao SQL Server via ODBC"""
        conn_str = (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={self.conexao.host},{self.conexao.porta};"
            f"DATABASE={self.conexao.database};"
            f"UID={self.conexao.usuario};"
            f"PWD={self.senha};"
            f"Connection Timeout={self.TIMEOUT};"
        )
        return pyodbc.connect(conn_str)

    def _connect_postgresql(self):
        """Conecta ao PostgreSQL"""
        import psycopg2
        return psycopg2.connect(
            host=self.conexao.host,
            port=self.conexao.porta,
            database=self.conexao.database,
            user=self.conexao.usuario,
            password=self.senha,
            connect_timeout=self.TIMEOUT
        )

    def _connect_mysql(self):
        """Conecta ao MySQL"""
        import pymysql
        return pymysql.connect(
            host=self.conexao.host,
            port=self.conexao.porta,
            database=self.conexao.database,
            user=self.conexao.usuario,
            password=self.senha,
            connect_timeout=self.TIMEOUT
        )

    def test_connection(self) -> tuple[bool, str]:
        """
        Testa a conexão com o banco de dados.

        Returns:
            Tupla (sucesso: bool, mensagem: str)
        """
        try:
            conn = self.get_connection()
            conn.close()
            return True, "Conexão estabelecida com sucesso"
        except Exception as e:
            return False, str(e)


def test_connection_params(tipo: str, host: str, porta: int, database: str,
                           usuario: str, senha: str) -> tuple[bool, str]:
    """
    Testa conexão sem salvar no banco (útil para validação antes de criar).

    Args:
        tipo: Tipo do banco (SQLSERVER, POSTGRESQL, MYSQL)
        host: Servidor
        porta: Porta
        database: Nome do database
        usuario: Usuário
        senha: Senha (não criptografada)

    Returns:
        Tupla (sucesso: bool, mensagem: str)
    """
    timeout = 10  # Timeout menor para testes

    try:
        if tipo == 'SQLSERVER':
            conn_str = (
                f"DRIVER={{ODBC Driver 17 for SQL Server}};"
                f"SERVER={host},{porta};"
                f"DATABASE={database};"
                f"UID={usuario};"
                f"PWD={senha};"
                f"Connection Timeout={timeout};"
            )
            conn = pyodbc.connect(conn_str)
            conn.close()
            return True, "Conexão estabelecida com sucesso"

        elif tipo == 'POSTGRESQL':
            import psycopg2
            conn = psycopg2.connect(
                host=host,
                port=porta,
                database=database,
                user=usuario,
                password=senha,
                connect_timeout=timeout
            )
            conn.close()
            return True, "Conexão estabelecida com sucesso"

        elif tipo == 'MYSQL':
            import pymysql
            conn = pymysql.connect(
                host=host,
                port=porta,
                database=database,
                user=usuario,
                password=senha,
                connect_timeout=timeout
            )
            conn.close()
            return True, "Conexão estabelecida com sucesso"

        else:
            return False, f"Tipo de banco '{tipo}' não suportado"

    except Exception as e:
        return False, str(e)
