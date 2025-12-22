from rest_framework import serializers
from .models import ConfiguracaoEmpresa


class ConfiguracaoEmpresaSerializer(serializers.ModelSerializer):
    """Serializer para configurações da empresa"""
    
    # Campo write-only para senha (nunca retorna a senha real)
    smtp_senha = serializers.CharField(
        write_only=True, 
        required=False, 
        allow_blank=True,
        help_text='Senha SMTP (criptografada no servidor)'
    )
    
    # Campo read-only para indicar se senha está configurada
    smtp_senha_configurada = serializers.SerializerMethodField()
    
    # Campo read-only para indicar se SMTP está pronto
    smtp_configurado = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = ConfiguracaoEmpresa
        fields = [
            'smtp_host',
            'smtp_porta',
            'smtp_usuario',
            'smtp_senha',
            'smtp_senha_configurada',
            'smtp_usar_tls',
            'smtp_email_remetente',
            'smtp_nome_remetente',
            'smtp_testado_em',
            'smtp_ultimo_teste_ok',
            'smtp_configurado',
            'atualizado_em',
        ]
        read_only_fields = [
            'smtp_testado_em',
            'smtp_ultimo_teste_ok',
            'atualizado_em',
        ]
    
    def get_smtp_senha_configurada(self, obj) -> bool:
        """Retorna True se a senha SMTP está configurada"""
        return bool(obj.smtp_senha)
    
    def update(self, instance, validated_data):
        """Atualiza configuração, tratando senha de forma especial"""
        # Extrair senha do validated_data
        smtp_senha = validated_data.pop('smtp_senha', None)
        
        # Atualizar demais campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Se senha foi fornecida, criptografar e salvar
        if smtp_senha is not None and smtp_senha != '':
            instance.set_smtp_senha(smtp_senha)
        
        instance.save()
        return instance
