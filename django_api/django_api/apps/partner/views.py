from rest_framework.generics import RetrieveAPIView, ListCreateAPIView
from rest_framework.response import Response
from rest_framework import status

#import django_filters

from core.paginations import SmallPagination
from core.permissions import IsAuthenticated
from .serializer import (
    PartnerDetailsSerializer,
    PartnerProjectSerializer,
)
from .models import PartnerProject


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


class PartnerProjectListCreateAPIView(ListCreateAPIView):

    serializer_class = PartnerProjectSerializer
    permission_classes = (IsAuthenticated, )
    pagination_class = SmallPagination
    #filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    #filter_class =
    lookup_field = lookup_url_kwarg = 'cluster_id'

    def get_queryset(self, *args, **kwargs):
        queryset = PartnerProject.objects.select_related('partner').prefetch_related('clusters', 'locations')
        cluster_id = self.kwargs.get(self.lookup_field)
        if cluster_id:
            return queryset.filter(cluster_id=cluster_id)
        return queryset.all()
