from django.urls import re_path

from .views import (
    ChildrenLocationAPIView,
    ConfigurationAPIView,
    CurrenciesView,
    LocationListAPIView,
    ResponsePlanAPIView,
    ResponsePlanCreateAPIView,
    StaticDataView,
    TaskTriggerAPIView,
    WorkspaceAPIView,
)

urlpatterns = [
    re_path(r'^task-trigger/$', TaskTriggerAPIView.as_view(), name="task-trigger"),
    re_path(r'^configuration/$', ConfigurationAPIView.as_view(), name="configuration"),
    re_path(r'^workspace/$', WorkspaceAPIView.as_view(), name="workspace"),
    re_path(r'^workspace/(?P<workspace_id>\d+)/response-plan/$',
            ResponsePlanAPIView.as_view(), name="response-plan"),
    re_path(r'^workspace/(?P<workspace_id>\d+)/response-plan/create/$',
            ResponsePlanCreateAPIView.as_view(), name="response-plan-create"),
    re_path(r'^(?P<response_plan_id>\d+)/location/$',
            LocationListAPIView.as_view(), name="location"),
    re_path(r'^(?P<location_id>\d+)/children-location/$',
            ChildrenLocationAPIView.as_view(), name="children-location"),
    re_path(r'^currencies/$', CurrenciesView.as_view(), name="currencies"),
    re_path(r'^static_data/$', StaticDataView.as_view(), name="static_data"),
]
