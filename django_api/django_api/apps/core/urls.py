from django.conf.urls import url

from .views import (
    SimpleInterventionAPIView,
    ChildrenLocationAPIView,
)


urlpatterns = [
    url(r'^simple-intervention/$', SimpleInterventionAPIView.as_view(), name="simple-intervention"),
    url(r'^(?P<location_id>\d+)/children-location/$', ChildrenLocationAPIView.as_view(), name="children-location"),
]
