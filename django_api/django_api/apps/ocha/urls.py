from django.conf.urls import url

from ocha.views import (
    RPMWorkspaceResponsePlanAPIView,
    RPMWorkspaceResponsePlanDetailAPIView,
)


urlpatterns = [
    url(r'^response-plans/workspace/(?P<workspace_id>\d+)/$',
        RPMWorkspaceResponsePlanAPIView.as_view(),
        name="rpm-response-plans"),
    url(r'^response-plans/(?P<id>\d+)/$',
        RPMWorkspaceResponsePlanDetailAPIView.as_view(),
        name="rpm-response-plan-details"),
]
