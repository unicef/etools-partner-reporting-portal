from django.conf.urls import url

from .views import (
    ProgrammeDocumentAPIView,
)


urlpatterns = [
    url(r'^(?P<location_id>\d+)/programme-document/$', ProgrammeDocumentAPIView.as_view(), name="programme-document"),
]
