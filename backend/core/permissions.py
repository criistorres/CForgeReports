from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Apenas usuários ADMIN podem acessar"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'


class IsTecnicoOrAdmin(BasePermission):
    """Usuários ADMIN ou TECNICO podem acessar"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'TECNICO']
