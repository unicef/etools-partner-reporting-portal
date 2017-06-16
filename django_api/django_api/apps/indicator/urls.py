from django.conf.urls import url

from .views import (
    PDReportsAPIView,
    IndicatorListCreateAPIView,
    IndicatorReportListAPIView,
    IndicatorLocationDataUpdateAPIView,
)


urlpatterns = [
    url(r'^programme-document/details/(?P<pd_id>\d+)/reports/',
        PDReportsAPIView.as_view(),
        name="programme-document-reports"),
    url(r'^$', IndicatorListCreateAPIView.as_view(), name='indicator-list-create-api'),
    url(r'^indicator-location-data-entries/$', IndicatorLocationDataUpdateAPIView.as_view(), name='indicator-location-data-entries-put-api'),
    url(r'^indicator-reports/$', IndicatorReportListAPIView.as_view(), name='indicator-report-direct-list-api'),
    url(r'^(?P<reportable_id>\d+)/indicator-reports/$', IndicatorReportListAPIView.as_view(), name='indicator-report-list-api'),
]
