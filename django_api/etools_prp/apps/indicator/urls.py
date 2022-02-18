from django.urls import re_path

from .views import (
    ClusterIndicatorAPIView,
    ClusterIndicatorSendIMOMessageAPIView,
    ClusterObjectiveIndicatorAdoptAPIView,
    DisaggregationListCreateAPIView,
    IndicatorDataAPIView,
    IndicatorDataLocationAPIView,
    IndicatorListAPIView,
    IndicatorLocationDataUpdateAPIView,
    IndicatorReportListAPIView,
    IndicatorReportReviewAPIView,
    PDLowerLevelOutputStatusAPIView,
    PDReportsAPIView,
    PDReportsDetailAPIView,
    ReportableDetailAPIView,
    ReportableLocationGoalBaselineInNeedAPIView,
    ReportableReportingFrequencyListAPIView,
    ReportRefreshAPIView,
)

urlpatterns = [
    re_path(r'^(?P<reportable_id>\d+)/$',
            ReportableDetailAPIView.as_view(),
            name='indicator-detail',),
    re_path(r'^(?P<reportable_id>\d+)/baseline_in_need$',
            ReportableLocationGoalBaselineInNeedAPIView.as_view(),
            name='indicator-location-goal-detail',),
    re_path(r'^(?P<reportable_id>\d+)/indicator-reports/$',
            IndicatorReportListAPIView.as_view(),
            name='indicator-report-list-api'),

    re_path(r'^programme-document/details/(?P<pd_id>\d+)/reports/$',
            PDReportsAPIView.as_view(),
            name="programme-document-reports"),
    re_path(r'^programme-document/details/(?P<pd_id>\d+)/reports/(?P<report_id>\d+)/$',
            PDReportsDetailAPIView.as_view(),
            name="programme-document-reports-detail"),

    re_path(r'^indicator-data/(?P<ir_id>\d+)/$', IndicatorDataAPIView.as_view(),
            name='indicator-data'),
    re_path(r'^pd-progress-report/(?P<pd_progress_report_id>\d+)/llo/(?P<llo_id>\d+)/$',
            PDLowerLevelOutputStatusAPIView.as_view(),
            name='indicator-data-reportable'),

    re_path(r'^indicator-data-location/(?P<ir_id>\d+)/$',
            IndicatorDataLocationAPIView.as_view(),
            name='indicator-data-location'),
    re_path(r'^(?P<content_object>[a-z]+)/$', IndicatorListAPIView.as_view(),
            name='indicator-list-api'),

    re_path(r'^indicator-location-data-entries/$',
            IndicatorLocationDataUpdateAPIView.as_view(),
            name='indicator-location-data-entries-put-api'),

    re_path(r'^indicator-reports/$',
            IndicatorReportListAPIView.as_view(),
            name='indicator-report-direct-list-api'),

    re_path(r'^indicator-reports/(?P<pk>\d+)/review/$',
            IndicatorReportReviewAPIView.as_view(),
            name='indicator-report-review'),

    re_path(r'^partner-project-indicator-adopt/$',
            ClusterObjectiveIndicatorAdoptAPIView.as_view(),
            name='partner-project-indicator-adopt'),

    re_path(r'^cluster-indicator/$',
            ClusterIndicatorAPIView.as_view(),
            name='cluster-indicator'),

    re_path(r'^cluster-indicator-imo-message/$',
            ClusterIndicatorSendIMOMessageAPIView.as_view(),
            name='cluster-indicator-imo-message'),

    re_path(r'^response-plan/(?P<response_plan_id>\d+)/disaggregations/$',
            DisaggregationListCreateAPIView.as_view(),
            name="cluster-disaggregations"),

    re_path(r'^reporting-frequencies/$',
            ReportableReportingFrequencyListAPIView.as_view(),
            name='reportable-reporting-frequency-list-api'),

    re_path(r'^report-refresh/$',
            ReportRefreshAPIView.as_view(),
            name='report-refresh-api'),
]
