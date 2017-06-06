from django.conf.urls import url

from .views import (
    ProgrammeDocumentAPIView,
    ProgrammeDocumentDetailsAPIView,
    ProgressReportAPIView,
)


urlpatterns = [
    url(r'^(?P<location_id>\d+)/programme-document/$', ProgrammeDocumentAPIView.as_view(), name="programme-document"),
    url(r'^(?P<location_id>\d+)/programme-document/details/(?P<pk>\d+)/$', ProgrammeDocumentDetailsAPIView.as_view(), name="programme-document-details"),
    url(r'^progress-reports/$', ProgressReportAPIView.as_view(), name="progress-reports"),
]
