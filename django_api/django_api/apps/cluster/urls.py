from django.conf.urls import url

from .views import (
    ClusterObjectiveAPIView,
    ClusterObjectiveListAPIView,
)


urlpatterns = [
    url(r'^cluster-objective/$', ClusterObjectiveAPIView.as_view(), name="cluster-objective"),
    url(r'^cluster-objective/(?P<pk>\d+)/$', ClusterObjectiveAPIView.as_view(), name="cluster-objective"),
]
