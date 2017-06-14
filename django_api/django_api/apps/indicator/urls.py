from django.conf.urls import url

from .views import (
    PDReportsAPIView,
    IndicatorListCreateAPIView,
    IndicatorReportListAPIView,
    IndicatorDataAPIView,
)


urlpatterns = [
    url(r'^programme-document/details/(?P<pd_id>\d+)/reports/(?P<report_id>\d+)/',
        PDReportsAPIView.as_view(),
        name="programme-document-reports-detail"),
    url(r'^programme-document/details/(?P<pd_id>\d+)/reports/',
        PDReportsAPIView.as_view(),
        name="programme-document-reports"),
    url(r'^indicator-data/(?P<ir_id>\d+)/', IndicatorDataAPIView.as_view(), name='indicator-data'),
    url(r'^$', IndicatorListCreateAPIView.as_view(), name='indicator-list-create-api'),
    url(r'^(?P<pk>\d+)/indicator-reports/$', IndicatorReportListAPIView.as_view(), name='indicator-report-list-api'),
]
