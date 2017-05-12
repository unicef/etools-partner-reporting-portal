from rest_framework.permissions import BasePermission


class IsAuthenticated(BasePermission):
    """
    Allows access only to authenticated users.
    """

    def has_permission(self, request, view):
        # we can extend persiossion verification in future!
        return request.user and request.user.is_authenticated()
