from django.conf.urls import url

from .views import (
    ClusterObjectiveAPIView,
)


urlpatterns = [
    url(r'^cluster-objective/$', ClusterObjectiveAPIView.as_view(), name="cluster-objective"),
]
