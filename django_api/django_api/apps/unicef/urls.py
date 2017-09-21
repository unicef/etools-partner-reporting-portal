from django.conf.urls import url

from .views import (
    ProgrammeDocumentAPIView,
    ProgrammeDocumentDetailsAPIView,
    ProgrammeDocumentLocationsAPIView,
    ProgressReportPDFView,
    ProgrammeDocumentIndicatorsAPIView,
    ProgressReportAPIView,
    ProgressReportIndicatorsAPIView,
    ProgressReportDetailsAPIView,
    ProgressReportSubmitAPIView
)


urlpatterns = [
    url(r'^(?P<workspace_id>\d+)/programme-document/$',
        ProgrammeDocumentAPIView.as_view(),
        name="programme-document"),
    url(r'^(?P<workspace_id>\d+)/programme-document/details/(?P<pk>\d+)/$',
        ProgrammeDocumentDetailsAPIView.as_view(),
        name="programme-document-details"),
    url(r'^(?P<workspace_id>\d+)/programme-document/locations/$',
        ProgrammeDocumentLocationsAPIView.as_view(),
        name="programme-document-locations"),
    url(r'^(?P<workspace_id>\d+)/programme-document/indicators/$',
        ProgrammeDocumentIndicatorsAPIView.as_view(),
        name="programme-document-locations"),
    url(r'^(?P<workspace_id>\d+)/progress-reports/$',
        ProgressReportAPIView.as_view(),
        name="progress-reports"),
    url(r'^(?P<workspace_id>\d+)/progress-reports/(?P<pk>\d+)/annex-C-export-PDF/$',
        ProgressReportPDFView.as_view(),
            name="progress-reports-pdf"),
    url(r'^(?P<workspace_id>\d+)/progress-reports/(?P<pk>\d+)/$',
        ProgressReportDetailsAPIView.as_view(),
        name="progress-reports-details"),
    url(r'^(?P<workspace_id>\d+)/progress-reports/(?P<pk>\d+)/submit/$',
        ProgressReportSubmitAPIView.as_view(),
        name="progress-reports-submit"),
    url(r'^(?P<workspace_id>\d+)/progress-reports/(?P<progress_report_id>\d+)/indicator-reports/$',
        ProgressReportIndicatorsAPIView.as_view(),
        name="progress-reports-indicators"),
]
