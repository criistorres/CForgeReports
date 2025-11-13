# ForgeReports MVP

Sistema Django para execução de queries SQL Server e export para Excel.

## Instalação

1. Criar ambiente virtual:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. Instalar dependências:
```bash
pip install -r requirements.txt
```

3. Configurar banco de dados:
```bash
python manage.py migrate
```

4. Executar servidor:
```bash
python manage.py runserver
```

5. Acessar: http://127.0.0.1:8000/

## Como Usar

1. **Configurar Conexão**: Preencha os dados do SQL Server
2. **Testar Conexão**: Clique em "Testar Conexão" para validar
3. **Escrever Query**: Digite seu comando SELECT
4. **Executar**: Clique em "Executar Query" 
5. **Visualizar**: Os resultados aparecerão em uma tabela na tela
6. **Download**: Use o botão "Baixar Excel" para exportar os dados

## Requisitos do Sistema

- Python 3.8+
- SQL Server ODBC Driver 17
- Conexão com SQL Server

## Funcionalidades

- ✅ Teste de conexão SQL Server
- ✅ Execução de queries SELECT
- ✅ **Visualização de resultados em tabela na tela**
- ✅ **Download de resultados em Excel**
- ✅ Validações de segurança
- ✅ Interface responsiva e moderna
- ✅ Feedback visual em tempo real

## Limitações do MVP

- Apenas comandos SELECT permitidos
- **Visualização em tela limitada a 1000 registros** (download sem limite)
- Timeout de 30 segundos
- Apenas SQL Server suportado

## Performance e Limites

- **Exibição**: Máximo de 1000 registros na tela para melhor performance
- **Download**: Sem limite de registros - todos os dados disponíveis
- **Indicador**: Sistema informa quando há mais dados disponíveis para download