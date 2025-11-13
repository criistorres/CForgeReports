import pyodbc
import pandas as pd
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json
import io
from datetime import datetime

def dashboard(request):
    return render(request, 'reports/dashboard.html')

@csrf_exempt
@require_POST
def test_connection(request):
    try:
        data = json.loads(request.body)
        
        server = data.get('server')
        database = data.get('database')
        username = data.get('username')
        password = data.get('password')
        port = data.get('port', '1433')
        
        conn_str = f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server},{port};DATABASE={database};UID={username};PWD={password};TrustServerCertificate=yes;"
        
        conn = pyodbc.connect(conn_str, timeout=10)
        conn.execute("SELECT 1")
        conn.close()
        
        return JsonResponse({'success': True, 'message': 'Conexão OK!'})
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Erro: {str(e)}'})

@csrf_exempt
@require_POST
def execute_query(request):
    try:
        data = json.loads(request.body)
        
        server = data.get('server')
        database = data.get('database')
        username = data.get('username')
        password = data.get('password')
        port = data.get('port', '1433')
        query = data.get('query')
        
        if not query.strip():
            return JsonResponse({'success': False, 'message': 'Query vazia'})
        
        # Validação simples
        if any(word in query.upper() for word in ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE']):
            return JsonResponse({'success': False, 'message': 'Apenas SELECT permitido'})
        
        conn_str = f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server},{port};DATABASE={database};UID={username};PWD={password};TrustServerCertificate=yes;"
        
        # Executar query simples com limite
        conn = pyodbc.connect(conn_str)
        
        # Para exibição, limitar logo na query para economizar memória
        if 'TOP' not in query.upper():
            limited_query = f"SELECT TOP 1001 * FROM ({query}) AS subquery"
        else:
            limited_query = query
            
        df = pd.read_sql(limited_query, conn)
        conn.close()
        
        # Limitar para exibição (linhas e colunas)
        display_df = df.head(1000)
        has_more = len(df) > 1000
        
        # Limitar colunas se necessário (máximo 25 colunas)
        if len(display_df.columns) > 25:
            display_df = display_df.iloc[:, :25]
            columns_limited = True
        else:
            columns_limited = False
        
        # Converter para JSON
        columns = display_df.columns.tolist()
        rows = display_df.fillna('').values.tolist()
        
        message = f'{len(display_df)} registros'
        if has_more:
            message += f' (total: {len(df)} registros)'
        if columns_limited:
            message += f' - Mostrando {len(columns)} de {len(df.columns)} colunas'
        if has_more or columns_limited:
            message += ' - Use download para dados completos'
        
        return JsonResponse({
            'success': True,
            'data': {
                'columns': columns,
                'rows': rows,
                'displayed_rows': len(display_df),
                'has_more': has_more
            },
            'message': message
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Erro: {str(e)}'})

@csrf_exempt
@require_POST
def download_excel(request):
    try:
        data = json.loads(request.body)
        
        server = data.get('server')
        database = data.get('database')
        username = data.get('username')
        password = data.get('password')
        port = data.get('port', '1433')
        query = data.get('query')
        
        conn_str = f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server},{port};DATABASE={database};UID={username};PWD={password};TrustServerCertificate=yes;"
        
        # Executar query completa
        conn = pyodbc.connect(conn_str)
        df = pd.read_sql(query, conn)
        conn.close()
        
        # Criar Excel
        output = io.BytesIO()
        df.fillna('').to_excel(output, index=False)
        output.seek(0)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"resultado_{len(df)}_registros_{timestamp}.xlsx"
        
        response = HttpResponse(output.getvalue(), content_type='application/vnd.ms-excel')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Erro: {str(e)}'})