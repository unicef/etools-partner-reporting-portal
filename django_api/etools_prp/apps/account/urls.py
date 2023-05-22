from django.urls import re_path

from drfpasswordless.views import ObtainEmailCallbackToken

from .views import (
    ChangeUserPartnerView,
    ChangeUserWorkspaceView,
    LoginUserWithTokenAPIView,
    UserLogoutAPIView,
    UserProfileAPIView,
)

urlpatterns = [
    re_path(r'^user-profile/$', UserProfileAPIView.as_view(), name="user-profile"),
    re_path(r'^changeworkspace/$', ChangeUserWorkspaceView.as_view(), name="workspace-change"),
    re_path(r'^changepartner/$', ChangeUserPartnerView.as_view(), name="partner-change"),
    re_path(r'^user-logout/$', UserLogoutAPIView.as_view(), name="user-logout"),

    re_path(r'^auth/login-with-token/$', LoginUserWithTokenAPIView.as_view(), name='user-passwordless-login'),

    # passwordless urls
    re_path(r'^auth/get-token/$', ObtainEmailCallbackToken.as_view(), name='user-passwordless-token'),
]
