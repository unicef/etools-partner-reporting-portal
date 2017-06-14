from django.http import Http404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView
from rest_framework import status as statuses, serializers

import django_filters

from core.permissions import IsAuthenticated
from core.paginations import SmallPagination
from .models import ClusterObjective
from .serializers import ClusterObjectiveSerializer, ClusterObjectivePatchSerializer
from .filters import ClusterObjectiveFilter


class ClusterObjectiveAPIView(APIView):
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
        serializer = ClusterObjectiveSerializer(instance=instance)
        return Response(serializer.data, status=statuses.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        serializer = ClusterObjectivePatchSerializer(
            instance=self.get_instance(self.request),
            data=self.request.data
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=statuses.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=statuses.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        """
        Update on ClusterObjective model
        :return: ClusterObjective serializer data
        """
        if 'id' in self.request.data.keys():
            serializer = ClusterObjectiveSerializer(
                instance=self.get_instance(self.request),
                data=self.request.data
            )
        else:
            return Response({"id": "This field is required!"}, status=statuses.HTTP_400_BAD_REQUEST)

        if not serializer.is_valid():
            return Response(serializer.errors, status=statuses.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=statuses.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        instance = self.get_instance(request)
        instance.delete()
        return Response(status=statuses.HTTP_204_NO_CONTENT)


class ClusterObjectiveListCreateAPIView(ListCreateAPIView):

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

    def post(self, request, *args, **kwargs):
        """
        Create on ClusterObjective model
        :return: ClusterObjective object id
        """
        serializer = ClusterObjectiveSerializer(data=self.request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=statuses.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response({'id': serializer.instance.id}, status=statuses.HTTP_200_OK)
