from django.urls import re_path

from etools_prp.apps.ocha.views import (
    RPMProjectDetailAPIView,
    RPMProjectListAPIView,
    RPMWorkspaceResponsePlanAPIView,
    RPMWorkspaceResponsePlanDetailAPIView,
)

urlpatterns = [
    re_path(r'^response-plans/workspace/(?P<workspace_id>\d+)/$',
            RPMWorkspaceResponsePlanAPIView.as_view(),
            name="rpm-response-plans"),
    re_path(r'^response-plans/(?P<id>\d+)/$',
            RPMWorkspaceResponsePlanDetailAPIView.as_view(),
            name="rpm-response-plan-details"),

    re_path(r'^projects/response-plan/(?P<plan_id>\d+)/$',
            RPMProjectListAPIView.as_view(),
            name="rpm-projects"),
    re_path(r'^projects/(?P<id>\d+)/$',
            RPMProjectDetailAPIView.as_view(),
            name="rpm-project-details"),
]
