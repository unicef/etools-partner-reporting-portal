from django.contrib.auth import logout
from django.shortcuts import get_object_or_404

from rest_framework import status as statuses
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsAuthenticated

from .models import UserProfile
from .serializers import UserSerializer


class UserProfileAPIView(RetrieveAPIView):
    """
    Returns the users profile details like name, id's, groups etc.
    """
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated, )

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data, status=statuses.HTTP_200_OK)


class UserLogoutAPIView(APIView):
    """
    Simply logs out the user on POST request.
    """
    # permission_classes = (IsAuthenticated, )

    def post(self, request, *args, **kwargs):
        logout(request)
        return Response({}, status=statuses.HTTP_200_OK)
