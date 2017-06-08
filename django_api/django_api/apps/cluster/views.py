from django.http import Http404

from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView
from rest_framework import status as statuses, serializers

from core.permissions import IsAuthenticated
from .models import ClusterObjective
from .serializers import ClusterObjectiveSerializer


class ClusterObjectiveAPIView(RetrieveAPIView):
    """
    ClusterObjective CRUD endpoint
    """
    serializer_class = ClusterObjectiveSerializer
    # permission_classes = (IsAuthenticated, )

    def post(self, request, *args, **kwargs):
        """
        Create ClusterObjective object
        :return: ClusterObjective object id
        """
        if 'id' in request.data.keys():
            try:
                co = ClusterObjective.objects.get(id=request.data['id'])
            except ClusterObjective.DoesNotExist:
                # TODO: log exception
                raise Http404
            serializer = self.get_serializer(
                instance=co,
                data=request.data
            )
        else:
            serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=statuses.HTTP_400_BAD_REQUEST)

        serializer.save()

        return Response({'id': serializer.instance.id}, status=statuses.HTTP_200_OK)

