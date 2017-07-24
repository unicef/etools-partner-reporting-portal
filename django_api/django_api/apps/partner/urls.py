from django.conf.urls import url

from .views import (
    PartnerDetailsAPIView,
    PartnerProjectListCreateAPIView,
    PartnerProjectSimpleListAPIView,
    PartnerProjectAPIView,
)


urlpatterns = [
    url(r'^partner-details/$', PartnerDetailsAPIView.as_view(), name="partner-details"),
    url(r'^^(?P<response_plan_id>\d+)/partner-project-simple-list/$',
        PartnerProjectSimpleListAPIView.as_view(),
        name="partner-project-simple-list"),
    url(r'^partner-project-list/$', PartnerProjectListCreateAPIView.as_view(), name="partner-project-list"),
    url(r'^(?P<cluster_id>\d+)/partner-project-list/$',
        PartnerProjectListCreateAPIView.as_view(),
        name="partner-project-list"),
    url(r'^partner-project-details/(?P<pk>\d+)/$', PartnerProjectAPIView.as_view(), name="partner-project-details"),

]
