from django.http import Http404

from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework import status as statuses, serializers

from core.permissions import IsAuthenticated
from core.paginations import SmallPagination
from .models import ClusterObjective
from .serializers import ClusterObjectiveSerializer


class ClusterObjectiveAPIView(RetrieveAPIView):
    """
    ClusterObjective CRUD endpoint
    """
    serializer_class = ClusterObjectiveSerializer
    # permission_classes = (IsAuthenticated, )

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
    # filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    # filter_class = ClusterObjectiveFilter

    def get_queryset(self):
        return ClusterObjective.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            serializer.data,
            status=statuses.HTTP_200_OK
        )
