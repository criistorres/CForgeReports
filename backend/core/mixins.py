class EmpresaQuerySetMixin:
    """Filtra automaticamente por empresa do usuário logado"""

    def get_queryset(self):
        qs = super().get_queryset()
        if hasattr(self.request, 'user') and self.request.user.is_authenticated:
            if hasattr(self.request.user, 'empresa_id') and self.request.user.empresa_id:
                return qs.filter(empresa_id=self.request.user.empresa_id)
        return qs.none()
