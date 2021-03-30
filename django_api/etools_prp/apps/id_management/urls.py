from django.conf.urls import url

from account.views import UserListCreateAPIView
from cluster.views import AssignableClustersListView, ClusterListForPartnerAPIView
from core.views import PRPRoleCreateAPIView, PRPRoleUpdateDestroyAPIView
from partner.views import AssignablePartnersListView, PartnerListCreateAPIView, PartnerRetrieveUpdateAPIView

urlpatterns = [
    url(r'^users/$', UserListCreateAPIView.as_view(), name='users'),
    url(r'^role-group/$', PRPRoleCreateAPIView.as_view(), name='role-group-create'),
    url(r'^role-group/(?P<pk>\d+)/$', PRPRoleUpdateDestroyAPIView.as_view(), name='role-group-update-destroy'),
    url(r'^assignable-clusters/$', AssignableClustersListView.as_view(), name='assignable-clusters'),
    url(r'^assignable-partners/$', AssignablePartnersListView.as_view(), name='assignable-partners'),
    url(r'^partners/(?P<pk>\d+)/clusters/$', ClusterListForPartnerAPIView.as_view(), name="cluster-list-partner"),
    url(r'^partners/$', PartnerListCreateAPIView.as_view(), name='partners-list-create'),
    url(r'^partners/(?P<pk>\d+)/$', PartnerRetrieveUpdateAPIView.as_view(), name='partner-detail'),
]
