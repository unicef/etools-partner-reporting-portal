from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework import status

from core.permissions import IsAuthenticated
from .serializer import (
    ProgrammeDocumentSerializer,
)

from .models import ProgrammeDocument


class ProgrammeDocumentAPIView(ListAPIView):
    """
    Endpoint for getting Partner Details for overview tab.
    """
    queryset = ProgrammeDocument.objects.all()
    serializer_class = ProgrammeDocumentSerializer
    permission_classes = (IsAuthenticated, )

    # def get(self, request, *args, **kwargs):
    #     """
    #     Get Programme Document list.
    #     """
    #     serializer = self.get_serializer()
    #     return Response(serializer.data, status=status.HTTP_200_OK)
