from django.conf.urls import url

from .views import (
    PDReportsAPIView,
    IndicatorListCreateAPIView,
    IndicatorReportListAPIView,
    IndicatorReportDetailAPIView,
)


urlpatterns = [
    url(r'^programme-document/details/(?P<pd_id>\d+)/reports/',
        PDReportsAPIView.as_view(),
        name="programme-document-reports"),
    url(r'^$', IndicatorListCreateAPIView.as_view(), name='indicator-list-create-api'),
    url(r'^(?P<pk>\d+)/indicator-reports/(?P<indicator_report_pk>\d+)$', IndicatorReportDetailAPIView.as_view(), name='indicator-report-detail-api'),
    url(r'^(?P<pk>\d+)/indicator-reports/$', IndicatorReportListAPIView.as_view(), name='indicator-report-list-api'),
]
