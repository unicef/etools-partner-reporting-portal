from django.conf.urls import url

from .views import (
    SimpleCountryAPIView,
)


urlpatterns = [
    url(r'^simple-country/$', SimpleCountryAPIView.as_view(), name="simple-country"),
]
