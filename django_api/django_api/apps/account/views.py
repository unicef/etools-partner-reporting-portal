from django.contrib.auth import login, logout

from rest_framework import status as statuses
from rest_framework.exceptions import ValidationError
from rest_framework.generics import RetrieveAPIView, ListCreateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

import django_filters
from drfpasswordless.utils import authenticate_by_token

from core.permissions import IsAuthenticated

from .filters import UserFilter
from .models import User
from .serializers import UserSerializer


class UserProfileAPIView(RetrieveAPIView):
    """
    User Profile API - GET
    Authentication required.

    Returns:
        UserSerializer object.
    """
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated, )

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data, status=statuses.HTTP_200_OK)


class UserLogoutAPIView(APIView):
    """
    User Logout API - POST

    Returns:
        Empty response.
    """
    # permission_classes = (IsAuthenticated, )

    def post(self, request, *args, **kwargs):
        logout(request)
        return Response({}, status=statuses.HTTP_200_OK)


class LoginUserWithTokenAPIView(APIView):
    """
    User Login API - POST

    Logs in user via token authentication.
    Taken from https://github.com/aaronn/django-rest-framework-passwordless/blob/master/drfpasswordless/views.py#L121

    Returns:
        JSON response.
    """
    permission_classes = []

    def post(self, request, *args, **kwargs):
        user = authenticate_by_token(request.data.get('token', None))
        if user:
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            return Response({'success': True})
        else:
            raise ValidationError('Couldn\'t log you in. Invalid token.')


class UserListCreateAPIView(ListCreateAPIView):
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filter_class = UserFilter

    def get_queryset(self):
        return User.objects.select_related('profile', 'partner').prefetch_related('prp_roles')
