from django.conf.urls import url

from ocha.views import (
    RPMWorkspaceResponsePlanAPIView,
)


urlpatterns = [
    url(r'^response-plans/workspace/(?P<workspace_id>\d+)/$',
        RPMWorkspaceResponsePlanAPIView.as_view(),
        name="rpm-response-plans"),
]
