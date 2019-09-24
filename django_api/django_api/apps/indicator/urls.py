from django.conf.urls import url

from .views import (
    PDReportsAPIView,
    PDReportsDetailAPIView,
    IndicatorListAPIView,
    IndicatorReportListAPIView,
    IndicatorLocationDataUpdateAPIView,
    IndicatorDataAPIView,
    ClusterIndicatorAPIView,
    PDLowerLevelOutputStatusAPIView,
    IndicatorDataLocationAPIView,
    DisaggregationListCreateAPIView,
    ReportableDetailAPIView,
    IndicatorReportReviewAPIView,
    ReportableLocationGoalBaselineInNeedAPIView,
    ClusterIndicatorSendIMOMessageAPIView,
    ReportableReportingFrequencyListAPIView,
    ReportRefreshAPIView,
    ClusterObjectiveIndicatorAdoptAPIView,
)


urlpatterns = [
    url(r'^(?P<reportable_id>\d+)/$',
        ReportableDetailAPIView.as_view(),
        name='indicator-detail',),
    url(r'^(?P<reportable_id>\d+)/baseline_in_need$',
        ReportableLocationGoalBaselineInNeedAPIView.as_view(),
        name='indicator-location-goal-detail',),
    url(r'^(?P<reportable_id>\d+)/indicator-reports/$',
        IndicatorReportListAPIView.as_view(),
        name='indicator-report-list-api'),

    url(r'^programme-document/details/(?P<pd_id>\d+)/reports/$',
        PDReportsAPIView.as_view(),
        name="programme-document-reports"),
    url(r'^programme-document/details/(?P<pd_id>\d+)/reports/(?P<report_id>\d+)/$',
        PDReportsDetailAPIView.as_view(),
        name="programme-document-reports-detail"),

    url(r'^indicator-data/(?P<ir_id>\d+)/$', IndicatorDataAPIView.as_view(),
        name='indicator-data'),
    url(r'^pd-progress-report/(?P<pd_progress_report_id>\d+)/llo/(?P<llo_id>\d+)/$',
        PDLowerLevelOutputStatusAPIView.as_view(),
        name='indicator-data-reportable'),

    url(r'^indicator-data-location/(?P<ir_id>\d+)/$',
        IndicatorDataLocationAPIView.as_view(),
        name='indicator-data-location'),
    url(r'^(?P<content_object>[a-z]+)/$', IndicatorListAPIView.as_view(),
        name='indicator-list-api'),

    url(r'^indicator-location-data-entries/$',
        IndicatorLocationDataUpdateAPIView.as_view(),
        name='indicator-location-data-entries-put-api'),

    url(r'^indicator-reports/$',
        IndicatorReportListAPIView.as_view(),
        name='indicator-report-direct-list-api'),

    url(r'^indicator-reports/(?P<pk>\d+)/review/$',
        IndicatorReportReviewAPIView.as_view(),
        name='indicator-report-review'),

    url(r'^partner-project-indicator-adopt/$', ClusterObjectiveIndicatorAdoptAPIView.as_view(), name='partner-project-indicator-adopt'),

    url(r'^cluster-indicator/$', ClusterIndicatorAPIView.as_view(), name='cluster-indicator'),

    url(r'^cluster-indicator-imo-message/$',
        ClusterIndicatorSendIMOMessageAPIView.as_view(),
        name='cluster-indicator-imo-message'),

    url(r'^response-plan/(?P<response_plan_id>\d+)/disaggregations/$',
        DisaggregationListCreateAPIView.as_view(),
        name="cluster-disaggregations"),

    url(r'^reporting-frequencies/$',
        ReportableReportingFrequencyListAPIView.as_view(),
        name='reportable-reporting-frequency-list-api'),

    url(r'^report-refresh/$',
        ReportRefreshAPIView.as_view(),
        name='report-refresh-api'),
]
