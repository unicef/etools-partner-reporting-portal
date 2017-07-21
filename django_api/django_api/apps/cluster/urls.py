from django.conf.urls import url

from .views import (
    ClusterObjectiveAPIView,
    ClusterObjectiveListCreateAPIView,
    ClusterActivityAPIView,
    ClusterActivityListAPIView,
    ClusterIndicatorsListAPIView,
)


urlpatterns = [
    url(r'^cluster-objective/$', ClusterObjectiveAPIView.as_view(), name="cluster-objective"),
    url(r'^cluster-objective/(?P<pk>\d+)/$', ClusterObjectiveAPIView.as_view(), name="cluster-objective"),
    url(r'^cluster-objective-list/$',
        ClusterObjectiveListCreateAPIView.as_view(),
        name="cluster-objective-list"),
    url(r'^(?P<cluster_id>\d+)/cluster-objective-list/$',
        ClusterObjectiveListCreateAPIView.as_view(),
        name="cluster-objective-list"),

    url(r'^cluster-activity/(?P<pk>\d+)/$', ClusterActivityAPIView.as_view(), name="cluster-activity"),
    url(r'^cluster-activity-list/$', ClusterActivityListAPIView.as_view(), name="cluster-activity-list"),
    url(r'^(?P<cluster_id>\d+)/cluster-activity-list/$',
        ClusterActivityListAPIView.as_view(),
        name="cluster-activity-list"),
    url(r'^cluster-indicators-list/$',
        ClusterIndicatorsListAPIView.as_view(),
        name="cluster-indicators-list"),
]
