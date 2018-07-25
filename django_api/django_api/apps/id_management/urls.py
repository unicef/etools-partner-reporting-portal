from django.conf.urls import url

from account.views import UserListCreateAPIView
from core.views import PRPRoleUpdateDestroyAPIView


urlpatterns = [
    url(r'^users/$', UserListCreateAPIView.as_view(), name='users'),
    url(r'^role-group/(?P<pk>\d+)/$', PRPRoleUpdateDestroyAPIView.as_view(), name='role-group-update-destroy'),
]
