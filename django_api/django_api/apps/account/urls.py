from django.conf.urls import url

from .views import (
    UserProfileAPIView,
    UserLogoutAPIView,
)


urlpatterns = [
    url(r'^user-profile/$', UserProfileAPIView.as_view(), name="user-profile"),
    url(r'^user-logout/$', UserLogoutAPIView.as_view(), name="user-logout"),
]
