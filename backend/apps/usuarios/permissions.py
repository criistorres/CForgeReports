from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """Apenas administradores podem gerenciar usuários"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'ADMIN'
        )

class CannotDeactivateSelf(permissions.BasePermission):
    """Não pode desativar a si mesmo (RN02)"""
    
    def has_object_permission(self, request, view, obj):
        if view.action == 'desativar':
            return obj.id != request.user.id
        return True

class MustKeepOneAdmin(permissions.BasePermission):
    """Deve manter pelo menos 1 admin ativo (RN03)"""
    
    def has_object_permission(self, request, view, obj):
        if view.action in ['desativar', 'partial_update', 'update']:
            return obj.pode_ser_desativado()
        return True
