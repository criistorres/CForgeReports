import pyodbc
import socket
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


class ConnectionService:
    """
    Service layer para conexões com banco de dados
    MVP: Apenas SQL Server funcionando
    """
    
    @staticmethod
    def test_connection(database_connection):
        """
        Testa a conexão com banco baseado no DatabaseConnection
        Retorna: (success: bool, message: str)
        """
        try:
            if database_connection.tipo_banco != 'sqlserver':
                return False, f"{database_connection.get_tipo_banco_display()} será implementado na próxima versão"
            
            # Usar pyodbc para SQL Server
            cnxn = ConnectionService._get_sql_server_connection(database_connection)
            
            # Testar com query simples
            cursor = cnxn.cursor()
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            
            cnxn.close()
            
            logger.info(f"Conexão testada com sucesso: {database_connection.nome}")
            return True, "Conexão realizada com sucesso!"
            
        except Exception as e:
            error_msg = f"Erro na conexão: {str(e)}"
            logger.error(f"Falha ao conectar {database_connection.nome}: {error_msg}")
            return False, error_msg
    
    @staticmethod
    def execute_query(database_connection, query):
        """
        Executa uma query no banco (para futura implementação)
        """
        if database_connection.tipo_banco != 'sqlserver':
            raise NotImplementedError(f"{database_connection.get_tipo_banco_display()} não implementado")
        
        cnxn = ConnectionService._get_sql_server_connection(database_connection)
        cursor = cnxn.cursor()
        cursor.execute(query)
        
        # Buscar resultados
        columns = [column[0] for column in cursor.description]
        results = cursor.fetchall()
        
        cnxn.close()
        
        return {
            'columns': columns,
            'data': [list(row) for row in results]
        }
    
    @staticmethod
    def _get_sql_server_connection(database_connection):
        """
        Cria conexão SQL Server baseado no DatabaseConnection
        Adaptado da função original do usuário
        """
        try:
            # String de conexão usando os dados do model
            connection_string = (
                f"DRIVER={{ODBC Driver 17 for SQL Server}};"
                f"SERVER={database_connection.servidor};"
                f"DATABASE={database_connection.banco};"
                f"UID={database_connection.usuario};"
                f"PWD={database_connection.senha}"
            )
            
            cnxn = pyodbc.connect(connection_string)
            return cnxn
            
        except Exception as e:
            logger.error(f"Erro ao conectar SQL Server: {e}")
            raise
    
    @staticmethod
    def get_server_info():
        """
        Obtém informações do servidor atual
        """
        hostname = socket.gethostname()
        ip_address = socket.gethostbyname(hostname)
        
        return {
            'hostname': hostname,
            'ip_address': ip_address
        }


def conexao_banco_sqlServer_original(tProTeste, banco):
    """
    Função original do usuário - mantida para referência
    """
    # Obter o nome do host
    hostname = socket.gethostname()
    # Obter o endereço IP do host
    ip_address = socket.gethostbyname(hostname)

    tipoBancoemProouTeste = tProTeste
    if tipoBancoemProouTeste == 'teste':
        server = "192.168.110.178"
        database = banco
        username = "sa"
        password = "Beauty807*"
        
    elif tipoBancoemProouTeste == 'servidor_19':
        if ip_address != '10.101.191.18':
            server = "150.230.94.19"
        else:    
            server = "10.101.191.36"
        database = banco
        username = "sa"        
        password = "G0fQhjXV&uS0"
    else:
        if ip_address != '10.101.191.18':
            server = "168.138.127.136"
        else: 
            server = "10.101.191.49"
        database = banco
        username = "sa"        
        password = "QkWQ$0U$ldKk"
    
    cnxn = pyodbc.connect(
        f'DRIVER={{ODBC Driver 17 for SQL Server}};'
        f'SERVER={server};DATABASE={database};UID={username};PWD={password}'
    )
    return cnxn