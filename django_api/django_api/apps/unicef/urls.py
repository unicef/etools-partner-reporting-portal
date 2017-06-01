from django.conf.urls import url

from .views import (
    ProgrammeDocumentAPIView,
    ProgrammeDocumentDetailsAPIView,
)


urlpatterns = [
    url(r'^(?P<location_id>\d+)/programme-document/$', ProgrammeDocumentAPIView.as_view(), name="programme-document"),
    url(r'^(?P<location_id>\d+)/programme-document/details/(?P<pk>\d+)/$', ProgrammeDocumentDetailsAPIView.as_view(), name="programme-document-details"),
]
