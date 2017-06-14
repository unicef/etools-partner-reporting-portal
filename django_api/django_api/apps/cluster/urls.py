from django.conf.urls import url

from .views import (
    ClusterObjectiveAPIView,
    ClusterObjectiveListCreateAPIView,
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
]
