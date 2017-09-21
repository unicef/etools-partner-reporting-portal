from django.conf.urls import url

from .views import (
    WorkspaceAPIView,
    LocationListAPIView,
    ChildrenLocationAPIView,
    ResponsePlanAPIView,
)


urlpatterns = [
    url(r'^workspace/$', WorkspaceAPIView.as_view(), name="workspace"),
    url(r'^workspace/(?P<workspace_id>\d+)/response-plan/$',
        ResponsePlanAPIView.as_view(), name="response-plan"),
    url(r'^(?P<response_plan_id>\d+)/location/$',
        LocationListAPIView.as_view(), name="location"),
    url(r'^(?P<location_id>\d+)/children-location/$',
        ChildrenLocationAPIView.as_view(), name="children-location"),
]
