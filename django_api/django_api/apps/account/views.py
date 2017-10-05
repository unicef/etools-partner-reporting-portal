from django.contrib.auth import authenticate, login, logout

from rest_framework import status as statuses
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from drfpasswordless.utils import authenticate_by_token

from core.permissions import IsAuthenticated

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


class LoginUserWithTokenAPIView(APIView):
    """
    Logs in user and responds with auth token as well
    Taken from https://github.com/aaronn/django-rest-framework-passwordless/blob/master/drfpasswordless/views.py#L121
    """
    permission_classes = []

    def post(self, request, *args, **kwargs):
        user = authenticate_by_token(request.data.get('token', None))
        if user:
            login(request, user,
                  backend='django.contrib.auth.backends.ModelBackend')
            return Response({'success': True}, status=statuses.HTTP_200_OK)
        else:
            return Response({'detail': 'Couldn\'t log you in. Invalid token.'},
                        status=statuses.HTTP_400_BAD_REQUEST)
