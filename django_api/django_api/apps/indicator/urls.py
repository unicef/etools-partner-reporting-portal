from django.conf.urls import url, include

from indicator.views import IndicatorListCreateAPIView, IndicatorDataAPIView


urlpatterns = [
    url(r'^indicator-data/(?P<ir_id>\d+)/', IndicatorDataAPIView.as_view(), name='indicator-data'),
    url(r'^', IndicatorListCreateAPIView.as_view(), name='indicator-list-create-api'),
]
