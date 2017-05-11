from django.conf.urls import url

from .views import (
    SimpleInterventionAPIView,
)


urlpatterns = [
    url(r'^simple-intervention/$', SimpleInterventionAPIView.as_view(), name="simple-intervention"),
]
