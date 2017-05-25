from django.conf.urls import url, include

from indicator.views import (
    IndicatorListCreateAPIView, IndicatorReportListAPIView
)


urlpatterns = [
    url(r'^$', IndicatorListCreateAPIView.as_view(), name='indicator-list-create-api'),
    url(r'^(?P<pk>\d+)/indicator-reports/$', IndicatorReportListAPIView.as_view(), name='indicator-report-list-api'),
]
