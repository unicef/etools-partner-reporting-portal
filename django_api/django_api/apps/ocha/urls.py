from django.conf.urls import url

from ocha.views import (
    RPMWorkspaceResponsePlanAPIView,
    RPMWorkspaceResponsePlanDetailAPIView,
    RPMProjectListAPIView,
)


urlpatterns = [
    url(r'^response-plans/workspace/(?P<workspace_id>\d+)/$',
        RPMWorkspaceResponsePlanAPIView.as_view(),
        name="rpm-response-plans"),
    url(r'^response-plans/(?P<id>\d+)/$',
        RPMWorkspaceResponsePlanDetailAPIView.as_view(),
        name="rpm-response-plan-details"),

    url(r'^projects/response-plan/(?P<plan_id>\d+)/$',
        RPMProjectListAPIView.as_view(),
        name="rpm-projects"),
]
