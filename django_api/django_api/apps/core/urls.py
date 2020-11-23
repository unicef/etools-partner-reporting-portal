from django.conf.urls import url

from .views import (
    ChildrenLocationAPIView,
    ConfigurationAPIView,
    LocationListAPIView,
    ResponsePlanAPIView,
    ResponsePlanCreateAPIView,
    TaskTriggerAPIView,
    WorkspaceAPIView,
)

urlpatterns = [
    url(r'^task-trigger/$', TaskTriggerAPIView.as_view(), name="task-trigger"),
    url(r'^configuration/$', ConfigurationAPIView.as_view(), name="configuration"),
    url(r'^workspace/$', WorkspaceAPIView.as_view(), name="workspace"),
    url(r'^workspace/(?P<workspace_id>\d+)/response-plan/$',
        ResponsePlanAPIView.as_view(), name="response-plan"),
    url(r'^workspace/(?P<workspace_id>\d+)/response-plan/create/$',
        ResponsePlanCreateAPIView.as_view(), name="response-plan-create"),
    url(r'^(?P<response_plan_id>\d+)/location/$',
        LocationListAPIView.as_view(), name="location"),
    url(r'^(?P<location_id>\d+)/children-location/$',
        ChildrenLocationAPIView.as_view(), name="children-location"),
]
