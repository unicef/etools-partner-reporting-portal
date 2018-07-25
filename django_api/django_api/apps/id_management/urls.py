from django.conf.urls import url

from account.views import UserListCreateAPIView


urlpatterns = [
    url(r'^users/$', UserListCreateAPIView.as_view(), name='users'),
]
