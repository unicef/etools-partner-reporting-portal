from django.urls import re_path

from etools_prp.apps.account.views import UserListCreateAPIView
from etools_prp.apps.cluster.views import AssignableClustersListView, ClusterListForPartnerAPIView
from etools_prp.apps.core.views import PRPRoleCreateAPIView, PRPRoleUpdateDestroyAPIView
from etools_prp.apps.partner.views import (
    AssignablePartnersListView,
    PartnerListCreateAPIView,
    PartnerRetrieveUpdateAPIView,
)

urlpatterns = [
    re_path(r'^users/$', UserListCreateAPIView.as_view(), name='users'),
    re_path(r'^role-group/$', PRPRoleCreateAPIView.as_view(), name='role-group-create'),
    re_path(r'^role-group/(?P<pk>\d+)/$', PRPRoleUpdateDestroyAPIView.as_view(), name='role-group-update-destroy'),
    re_path(r'^assignable-clusters/$', AssignableClustersListView.as_view(), name='assignable-clusters'),
    re_path(r'^assignable-partners/$', AssignablePartnersListView.as_view(), name='assignable-partners'),
    re_path(r'^partners/(?P<pk>\d+)/clusters/$', ClusterListForPartnerAPIView.as_view(), name="cluster-list-partner"),
    re_path(r'^partners/$', PartnerListCreateAPIView.as_view(), name='partners-list-create'),
    re_path(r'^partners/(?P<pk>\d+)/$', PartnerRetrieveUpdateAPIView.as_view(), name='partner-detail'),
]
