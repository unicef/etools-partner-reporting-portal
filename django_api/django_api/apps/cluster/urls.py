from django.conf.urls import url

from .views import (
    ClusterListAPIView,
    ClusterObjectiveAPIView,
    ClusterObjectiveListCreateAPIView,
    ClusterActivityAPIView,
    ClusterActivityListAPIView,
    ClusterIndicatorsListAPIView,
    ClusterIndicatorsSimpleListAPIView,
)


urlpatterns = [
    url(r'^cluster-list/(?P<rp_id>\d+)/$', ClusterListAPIView.as_view(), name="cluster-list"),
    url(r'^cluster-objective/$', ClusterObjectiveAPIView.as_view(), name="cluster-objective"),
    url(r'^cluster-objective/(?P<pk>\d+)/$', ClusterObjectiveAPIView.as_view(), name="cluster-objective"),
    url(r'^(?P<response_plan_id>\d+)/cluster-objective-list/$',
        ClusterObjectiveListCreateAPIView.as_view(),
        name="cluster-objective-list"),
    url(r'^cluster-activity/(?P<pk>\d+)/$', ClusterActivityAPIView.as_view(), name="cluster-activity"),
    url(r'^cluster-activity-list/$', ClusterActivityListAPIView.as_view(), name="cluster-activity-list"),
    url(r'^(?P<response_plan_id>\d+)/cluster-activity-list/$',
        ClusterActivityListAPIView.as_view(),
        name="cluster-activity-list"),
    url(r'^(?P<response_plan_id>\d+)/cluster-indicators-list/$',
        ClusterIndicatorsListAPIView.as_view(),
        name="cluster-indicators-list"),
    url(r'^(?P<response_plan_id>\d+)/cluster-indicators-simple-list/$',
        ClusterIndicatorsSimpleListAPIView.as_view(),
        name="cluster-indicators-simple-list"),
    url(r'^(?P<response_plan_id>\d+)/cluster-simple-list/$',
        ClusterListAPIView.as_view(),
        name="cluster-simple-list"),
]
