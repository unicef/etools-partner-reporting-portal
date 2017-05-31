from django.conf.urls import url

from .views import (
    SimpleInterventionAPIView,
    SimpleLocationListAPIView
    ChildrenLocationAPIView,
)


urlpatterns = [
    url(r'^simple-intervention/$', SimpleInterventionAPIView.as_view(), name="simple-intervention"),
    url(r'^simple-location/$', SimpleLocationListAPIView.as_view(), name="simple-location"),
    url(r'^(?P<location_id>\d+)/children-location/$', ChildrenLocationAPIView.as_view(), name="children-location"),
]
