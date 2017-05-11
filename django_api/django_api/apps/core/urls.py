from django.conf.urls import include, url

from .views import (
    SimpleCountryAPIView,
    PartnerDetailsAPIView,
)


urlpatterns = [
    url(r'^simple-country/$', SimpleCountryAPIView.as_view(), name="simple-country"),
    url(r'^partner-details/(?P<pk>\d+)/$', PartnerDetailsAPIView.as_view(), name="partner-details"),
]
