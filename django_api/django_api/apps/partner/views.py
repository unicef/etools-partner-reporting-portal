from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework import status

from core.permissions import IsAuthenticated
from .serializer import (
    PartnerDetailsSerializer,
)


class PartnerDetailsAPIView(RetrieveAPIView):
    """
    Endpoint for getting Partner Details for overview tab.
    """
    serializer_class = PartnerDetailsSerializer
    permission_classes = (IsAuthenticated, )

    def get(self, request, *args, **kwargs):
        """
        Get User Partner Details.
        """
        serializer = self.get_serializer(
            request.user.partner
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
