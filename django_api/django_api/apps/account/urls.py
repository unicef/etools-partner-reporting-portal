from django.conf.urls import url

from drfpasswordless.views import ObtainEmailCallbackToken

from .views import (
    UserProfileAPIView,
    UserLogoutAPIView,
    LoginUserWithTokenAPIView,
)


urlpatterns = [
    url(r'^user-profile/$', UserProfileAPIView.as_view(), name="user-profile"),
    url(r'^user-logout/$', UserLogoutAPIView.as_view(), name="user-logout"),

    url(r'^auth/login-with-token/$', LoginUserWithTokenAPIView.as_view(),
        name='user-passwordless-login'),

    # passwordless urls
    url(r'^auth/get-token/$', ObtainEmailCallbackToken.as_view(),
        name='user-passwordless-token'),
]
