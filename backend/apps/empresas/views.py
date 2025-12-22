"""
Views para Configurações da Empresa.
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import ConfiguracaoEmpresa
from .serializers import ConfiguracaoEmpresaSerializer
from core.permissions import IsAdmin


class ConfiguracaoEmpresaViewSet(viewsets.GenericViewSet):
    """
    ViewSet para gerenciar configurações da empresa.
    Apenas administradores podem acessar.
    
    Endpoints:
    - GET /api/configuracoes/ - Retorna configurações
    - PUT /api/configuracoes/ - Atualiza configurações
    - POST /api/configuracoes/testar_email/ - Testa envio de email
    """
    serializer_class = ConfiguracaoEmpresaSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_object(self):
        """Retorna ou cria configuração da empresa do usuário logado"""
        empresa = self.request.user.empresa
        config, _ = ConfiguracaoEmpresa.objects.get_or_create(
            empresa=empresa
        )
        return config
    
    def list(self, request):
        """GET /api/configuracoes/ - Retorna configurações da empresa"""
        config = self.get_object()
        serializer = self.get_serializer(config)
        return Response(serializer.data)
    
    def create(self, request):
        """PUT /api/configuracoes/ - Atualiza configurações (usa POST como fallback)"""
        config = self.get_object()
        serializer = self.get_serializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def testar_email(self, request):
        """
        POST /api/configuracoes/testar_email/
        Envia email de teste para validar configuração SMTP.
        """
        config = self.get_object()
        
        # Validar se SMTP está configurado
        if not config.smtp_host:
            return Response(
                {'error': 'Servidor SMTP não configurado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not config.smtp_usuario:
            return Response(
                {'error': 'Usuário SMTP não configurado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not config.smtp_senha:
            return Response(
                {'error': 'Senha SMTP não configurada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Email de destino (pode vir do request ou usar o do usuário)
        email_destino = request.data.get('email_destino', request.user.email)
        
        if not email_destino:
            return Response(
                {'error': 'Email de destino não informado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Criar mensagem de teste
            msg = MIMEMultipart('alternative')
            msg['Subject'] = '🔧 ForgeReports - Teste de Configuração SMTP'
            msg['From'] = f"{config.smtp_nome_remetente} <{config.smtp_email_remetente or config.smtp_usuario}>"
            msg['To'] = email_destino
            
            # Conteúdo HTML
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #e2e8f0; padding: 40px; }}
                    .container {{ max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(139, 92, 246, 0.3); }}
                    .header {{ text-align: center; margin-bottom: 30px; }}
                    .logo {{ font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #a855f7, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
                    .success {{ background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1)); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 24px; text-align: center; }}
                    .success-icon {{ font-size: 48px; margin-bottom: 16px; }}
                    .success-text {{ color: #4ade80; font-size: 18px; font-weight: 600; }}
                    .info {{ margin-top: 24px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px; font-size: 14px; color: #94a3b8; }}
                    .footer {{ margin-top: 30px; text-align: center; font-size: 12px; color: #64748b; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">⚡ ForgeReports</div>
                    </div>
                    <div class="success">
                        <div class="success-icon">✅</div>
                        <div class="success-text">Configuração SMTP validada com sucesso!</div>
                    </div>
                    <div class="info">
                        <strong>Empresa:</strong> {config.empresa.nome}<br>
                        <strong>Servidor:</strong> {config.smtp_host}:{config.smtp_porta}<br>
                        <strong>TLS:</strong> {'Ativado' if config.smtp_usar_tls else 'Desativado'}
                    </div>
                    <div class="footer">
                        Este é um email automático de teste gerado pelo ForgeReports.
                    </div>
                </div>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(html_content, 'html'))
            
            # Conectar e enviar
            smtp_class = smtplib.SMTP if config.smtp_usar_tls else smtplib.SMTP_SSL
            
            with smtp_class(config.smtp_host, config.smtp_porta, timeout=30) as server:
                if config.smtp_usar_tls:
                    server.starttls()
                
                server.login(config.smtp_usuario, config.get_smtp_senha())
                server.sendmail(
                    config.smtp_email_remetente or config.smtp_usuario,
                    [email_destino],
                    msg.as_string()
                )
            
            # Atualizar status do teste
            config.smtp_testado_em = timezone.now()
            config.smtp_ultimo_teste_ok = True
            config.save(update_fields=['smtp_testado_em', 'smtp_ultimo_teste_ok'])
            
            return Response({
                'success': True,
                'message': f'Email de teste enviado com sucesso para {email_destino}'
            })
            
        except smtplib.SMTPAuthenticationError:
            config.smtp_testado_em = timezone.now()
            config.smtp_ultimo_teste_ok = False
            config.save(update_fields=['smtp_testado_em', 'smtp_ultimo_teste_ok'])
            
            return Response(
                {'error': 'Falha na autenticação. Verifique usuário e senha.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except smtplib.SMTPConnectError:
            config.smtp_testado_em = timezone.now()
            config.smtp_ultimo_teste_ok = False
            config.save(update_fields=['smtp_testado_em', 'smtp_ultimo_teste_ok'])
            
            return Response(
                {'error': f'Não foi possível conectar ao servidor {config.smtp_host}:{config.smtp_porta}'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            config.smtp_testado_em = timezone.now()
            config.smtp_ultimo_teste_ok = False
            config.save(update_fields=['smtp_testado_em', 'smtp_ultimo_teste_ok'])
            
            return Response(
                {'error': f'Erro ao enviar email: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
