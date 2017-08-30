from django.conf.urls import url

from .views import (
    PDReportsAPIView,
    PDReportsDetailAPIView,
    IndicatorListCreateAPIView,
    IndicatorReportListAPIView,
    IndicatorLocationDataUpdateAPIView,
    IndicatorDataAPIView,
    ClusterIndicatorAPIView,
    IndicatorDataReportableAPIView,
    IndicatorDataLocationAPIView,
)


urlpatterns = [
    url(r'^programme-document/details/(?P<pd_id>\d+)/reports/(?P<report_id>\d+)/',
        PDReportsDetailAPIView.as_view(),
        name="programme-document-reports-detail"),
    url(r'^programme-document/details/(?P<pd_id>\d+)/reports/',
        PDReportsAPIView.as_view(),
        name="programme-document-reports"),
    url(r'^indicator-data/(?P<ir_id>\d+)/reportable/(?P<reportable_id>\d+)/',
        IndicatorDataReportableAPIView.as_view(),
        name='indicator-data-reportable'),
    url(r'^indicator-data/(?P<ir_id>\d+)/', IndicatorDataAPIView.as_view(), name='indicator-data'),
    url(r'^indicator-data-location/(?P<ir_id>\d+)/', IndicatorDataLocationAPIView.as_view(), name='indicator-data-location'),
    url(r'^(?P<content_object>\w+)/$', IndicatorListCreateAPIView.as_view(), name='indicator-list-create-api'),
    url(r'^indicator-location-data-entries/$', IndicatorLocationDataUpdateAPIView.as_view(), name='indicator-location-data-entries-put-api'),
    url(r'^indicator-reports/$', IndicatorReportListAPIView.as_view(), name='indicator-report-direct-list-api'),
    url(r'^(?P<reportable_id>\d+)/indicator-reports/$', IndicatorReportListAPIView.as_view(), name='indicator-report-list-api'),
    url(r'^cluster-indicator/$', ClusterIndicatorAPIView.as_view(), name='cluster-indicator'),
]
