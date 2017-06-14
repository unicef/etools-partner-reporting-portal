from django.conf.urls import url

from .views import (
    PartnerDetailsAPIView,
    PartnerProjectListCreateAPIView,
)


urlpatterns = [
    url(r'^partner-details/$', PartnerDetailsAPIView.as_view(), name="partner-details"),
    url(r'^partner-project-list/$', PartnerProjectListCreateAPIView.as_view(), name="partner-project-list"),
    url(r'^(?P<cluster_id>\d+)/partner-project-list/$',
        PartnerProjectListCreateAPIView.as_view(),
        name="partner-project-list"),
]
