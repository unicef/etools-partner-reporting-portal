from django.conf.urls import url

from .views import (
    SimpleInterventionAPIView,
    SimpleLocationListAPIView
)


urlpatterns = [
    url(r'^simple-intervention/$', SimpleInterventionAPIView.as_view(), name="simple-intervention"),
    url(r'^simple-location/$', SimpleLocationListAPIView.as_view(), name="simple-location"),
]
