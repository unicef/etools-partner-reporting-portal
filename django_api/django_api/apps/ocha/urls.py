from django.conf.urls import url

from ocha.views import (
    RPMWorkspaceResponsePlanListAPIView,
)


urlpatterns = [
    url(r'^response-plans/(?P<workspace_id>\d+)/$',
        RPMWorkspaceResponsePlanListAPIView.as_view(),
        name="rpm-response-plans"),
]
