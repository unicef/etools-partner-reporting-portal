from django.conf.urls import url

from .views import (
    PDReportsAPIView,
)


urlpatterns = [
    url(r'^programme-document/details/(?P<pk>\d+)/reports/$', PDReportsAPIView.as_view(), name="programme-document-reports"),
]
