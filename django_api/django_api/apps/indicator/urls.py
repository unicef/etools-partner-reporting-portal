from django.conf.urls import url, include

from indicator.views import IndicatorListCreateAPIView


urlpatterns = [
    url(r'^', IndicatorListCreateAPIView.as_view(), name='indicator-list-create-api'),
]
