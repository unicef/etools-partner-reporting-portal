from django.conf.urls import url

from .views import (
    SimpleWorkspaceAPIView,
    SimpleLocationListAPIView,
    ChildrenLocationAPIView,
    ResponsePlanAPIView,
)


urlpatterns = [
    url(r'^simple-intervention/$', SimpleWorkspaceAPIView.as_view(), name="simple-intervention"),
    url(r'^(?P<response_plan_id>\d+)/simple-location/$', SimpleLocationListAPIView.as_view(), name="simple-location"),
    url(r'^(?P<location_id>\d+)/children-location/$', ChildrenLocationAPIView.as_view(), name="children-location"),
    url(r'^(?P<intervention_id>\d+)/response-plan/$', ResponsePlanAPIView.as_view(), name="response-plan"),
]
