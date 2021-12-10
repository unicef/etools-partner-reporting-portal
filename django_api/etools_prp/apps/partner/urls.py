from django.urls import re_path

from .views import (
    ClusterActivityPartnersAPIView,
    PartnerActivityAPIView,
    PartnerActivityCreateAPIView,
    PartnerActivityListAPIView,
    PartnerActivityUpdateAPIView,
    PartnerDetailsAPIView,
    PartnerProjectAPIView,
    PartnerProjectListCreateAPIView,
    PartnerProjectSimpleListAPIView,
    PartnerSimpleListAPIView,
)

urlpatterns = [
    re_path(r'^partner-details/$',
            PartnerDetailsAPIView.as_view(),
            name="partner-details"),

    re_path(r'^(?P<response_plan_id>\d+)/partner-simple-list/$',
            PartnerSimpleListAPIView.as_view(),
            name="partner-simple-list"),

    re_path(r'^(?P<response_plan_id>\d+)/partner-project-simple-list/$',
            PartnerProjectSimpleListAPIView.as_view(),
            name="partner-project-simple-list"),
    re_path(r'^(?P<response_plan_id>\d+)/partner-project-list/$',
            PartnerProjectListCreateAPIView.as_view(), name="partner-project-list"),
    re_path(r'^partner-project-details/(?P<pk>\d+)/$',
            PartnerProjectAPIView.as_view(),
            name="partner-project-details"),
    re_path(r'^(?P<response_plan_id>\d+)/partner-project-list/partner/(?P<partner_id>\d+)/$',
            PartnerProjectListCreateAPIView.as_view(), name="imo-partner-project-list-create"),
    re_path(r'^partner-project-details/partner/(?P<partner_id>\d+)/(?P<pk>\d+)/$',
            PartnerProjectAPIView.as_view(),
            name="imo-partner-project-details"),
    re_path(r'^(?P<response_plan_id>\d+)/partner-activity-list/$',
            PartnerActivityListAPIView.as_view(),
            name="partner-activity-list"),
    re_path(r'^(?P<response_plan_id>\d+)/create-partner-activity/(?P<create_mode>\w+)$',
            PartnerActivityCreateAPIView.as_view(),
            name="partner-activity-create"),
    re_path(r'^(?P<response_plan_id>\d+)/update-partner-activity/(?P<pk>\d+)/$',
            PartnerActivityUpdateAPIView.as_view(),
            name="partner-activity-update"),
    re_path(r'^(?P<response_plan_id>\d+)/partner-activity/(?P<pk>\d+)/$',
            PartnerActivityAPIView.as_view(),
            name="partner-activity-details"),

    re_path(r'^cluster-activity/(?P<pk>\d+)/partners/$',
            ClusterActivityPartnersAPIView.as_view(),
            name="cluster-activity-partners"),
]
