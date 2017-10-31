from django.conf.urls import url

from .views import (
    PartnerSimpleListAPIView,
    PartnerDetailsAPIView,
    PartnerProjectListCreateAPIView,
    PartnerProjectSimpleListAPIView,
    PartnerProjectAPIView,
    ClusterActivityPartnersAPIView,
    PartnerActivityListAPIView,
    PartnerActivityCreateAPIView,
)


urlpatterns = [
    url(r'^partner-details/$',
        PartnerDetailsAPIView.as_view(),
        name="partner-details"),

    url(r'^(?P<response_plan_id>\d+)/partner-simple-list/$',
        PartnerSimpleListAPIView.as_view(),
        name="partner-simple-list"),

    url(r'^(?P<response_plan_id>\d+)/partner-project-simple-list/$',
        PartnerProjectSimpleListAPIView.as_view(),
        name="partner-project-simple-list"),
    url(r'^(?P<response_plan_id>\d+)/partner-project-list/$',
        PartnerProjectListCreateAPIView.as_view(), name="partner-project-list"),
    url(r'^partner-project-details/(?P<pk>\d+)/$',
        PartnerProjectAPIView.as_view(),
        name="partner-project-details"),

    url(r'^(?P<response_plan_id>\d+)/partner-activity-list/$',
        PartnerActivityListAPIView.as_view(),
        name="partner-activity-list"),
    url(r'^(?P<response_plan_id>\d+)/create-partner-activity/(?P<create_mode>\w+)$',
        PartnerActivityCreateAPIView.as_view(),
        name="partner-activity-create"),

    url(r'^cluster-activity/(?P<pk>\d+)/partners/$',
        ClusterActivityPartnersAPIView.as_view(),
        name="cluster-activity-partners"),
]
