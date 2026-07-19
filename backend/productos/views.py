from rest_framework import viewsets, permissions
from .models import Producto
from .serializers import ProductoSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar el inventario de productos de un agricultor.
    Proporciona operaciones CRUD protegidas por autenticación JWT.
    """
    serializer_class = ProductoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Retorna únicamente los productos creados por el agricultor autenticado.
        """
        return Producto.objects.filter(agricultor=self.request.user)

    def get_object(self):
        """
        Busca el objeto y lanza 403 Forbidden si pertenece a otro agricultor,
        evitando el comportamiento por defecto de 404 Not Found para objetos que existen.
        """
        from rest_framework.exceptions import PermissionDenied
        
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}
        
        try:
            obj = Producto.objects.get(**filter_kwargs)
        except Producto.DoesNotExist:
            return super().get_object()
            
        if obj.agricultor != self.request.user:
            raise PermissionDenied("No tienes permisos para modificar o eliminar este producto.")
            
        return obj

    def perform_create(self, serializer):
        """
        Asigna de forma automática el agricultor autenticado como propietario del producto.
        """
        serializer.save(agricultor=self.request.user)
