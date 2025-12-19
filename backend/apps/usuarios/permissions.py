from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """Apenas administradores podem gerenciar usuários"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'ADMIN'
        )

class IsAdminOrSelf(permissions.BasePermission):
    """Permite acesso se for admin OU se estiver operando no próprio objeto"""
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
            
        if request.user.role == 'ADMIN':
            return True
            
        return obj.id == request.user.id

class CannotDeactivateSelf(permissions.BasePermission):
    """Não pode desativar a si mesmo (RN02)"""
    
    def has_object_permission(self, request, view, obj):
        if view.action == 'desativar':
            return obj.id != request.user.id
        return True

class MustKeepOneAdmin(permissions.BasePermission):
    """Deve manter pelo menos 1 admin ativo (RN03)"""
    
    def has_object_permission(self, request, view, obj):
        # Para a ação customizada 'desativar', verificamos aqui.
        # Para 'update' e 'partial_update', a lógica já está no UsuarioUpdateSerializer
        # para permitir que o admin edite outros campos (como telefone) sem ser bloqueado.
        if view.action == 'desativar':
            return obj.pode_ser_desativado()
        return True
