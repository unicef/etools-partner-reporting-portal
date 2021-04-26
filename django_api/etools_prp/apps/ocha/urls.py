from django.conf.urls import url

from etools_prp.apps.ocha.views import (
    RPMProjectDetailAPIView,
    RPMProjectListAPIView,
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

    url(r'^projects/response-plan/(?P<plan_id>\d+)/$',
        RPMProjectListAPIView.as_view(),
        name="rpm-projects"),
    url(r'^projects/(?P<id>\d+)/$',
        RPMProjectDetailAPIView.as_view(),
        name="rpm-project-details"),
]
