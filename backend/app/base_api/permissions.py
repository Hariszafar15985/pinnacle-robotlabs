from rest_framework.permissions import BasePermission, SAFE_METHODS


class StaffOnlyPermission(BasePermission):
    """
    Allows access only to authenticated users.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff


class IsAdminOrReadOnly(BasePermission):
    """
    The request is authenticated as a superuser, or is a read-only request.
    """

    def has_permission(self, request, view):
        return bool(
            request.method in SAFE_METHODS or
            request.user and
            (request.user.is_staff or request.user.is_superuser)
        )


class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        # must be the owner to view the object
        return obj.user == request.user


class IsMerchantOwnerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.method in SAFE_METHODS or
            request.user and (request.user == request.merchant.owner)
            or request.user and
            (request.user.is_staff or request.user.is_superuser)
        )
