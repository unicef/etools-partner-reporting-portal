from django.http import Http404

from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework import status as statuses, serializers

import django_filters

from core.permissions import IsAuthenticated
from core.paginations import SmallPagination
from .models import ClusterObjective, ClusterActivity
from .serializers import ClusterObjectiveSerializer, ClusterActivitySerializer
from .filters import ClusterObjectiveFilter, ClusterActivityFilter


class ClusterObjectiveAPIView(RetrieveAPIView):
    """
    ClusterObjective CRUD endpoint
    """
    serializer_class = ClusterObjectiveSerializer
    permission_classes = (IsAuthenticated, )

    def get_instance(self, request, pk=None):
        try:
            instance = ClusterObjective.objects.get(id=(pk or request.data['id']))
        except ClusterObjective.DoesNotExist:
            # TODO: log exception
            raise Http404
        return instance

    def get(self, request, pk, *args, **kwargs):
        instance = self.get_instance(request, pk)
        serializer = self.get_serializer(instance=instance)
        return Response(serializer.data, status=statuses.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        """
        Create or Update (if id is given to posted data) on ClusterObjective model
        :return: ClusterObjective object id
        """
        if 'id' in request.data.keys():
            serializer = self.get_serializer(
                instance=self.get_instance(request),
                data=request.data
            )
        else:
            serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=statuses.HTTP_400_BAD_REQUEST)

        serializer.save()

        return Response({'id': serializer.instance.id}, status=statuses.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        instance = self.get_instance(request)
        instance.delete()
        return Response(status=statuses.HTTP_204_NO_CONTENT)


class ClusterObjectiveListAPIView(ListAPIView):

    serializer_class = ClusterObjectiveSerializer
    permission_classes = (IsAuthenticated, )
    pagination_class = SmallPagination
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_class = ClusterObjectiveFilter
    lookup_field = lookup_url_kwarg = 'cluster_id'

    def get_queryset(self, *args, **kwargs):
        queryset = ClusterObjective.objects.select_related('cluster')
        cluster_id = self.kwargs.get(self.lookup_field)
        if cluster_id:
            return queryset.filter(cluster_id=cluster_id)
        return queryset.all()


class ClusterActivityAPIView(RetrieveAPIView):
    pass
    # TODO


class ClusterActivityListAPIView(ListAPIView):

    serializer_class = ClusterActivitySerializer
    permission_classes = (IsAuthenticated, )
    pagination_class = SmallPagination
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_class = ClusterActivityFilter
    lookup_field = lookup_url_kwarg = 'cluster_id'

    def get_queryset(self, *args, **kwargs):
        queryset = ClusterActivity.objects.select_related('cluster_objective__cluster')
        cluster_id = self.kwargs.get(self.lookup_field)
        if cluster_id:
            return queryset.filter(cluster_objective__cluster_id=cluster_id)
        return queryset.all()
