from rest_framework import serializers

from core.common import FREQUENCY_LEVEL, OVERALL_STATUS
from core.models import ResponsePlan, GatewayType

from indicator.models import Reportable, IndicatorLocationData
from indicator.serializers import (
    ClusterIndicatorReportSerializer,
    ClusterIndicatorReportListSerializer,
    ReportableSimpleSerializer,
)
from partner.models import Partner
from unicef.models import ProgressReport

from .models import ClusterObjective, ClusterActivity, Cluster


class ClusterSimpleSerializer(serializers.ModelSerializer):

    type = serializers.CharField(read_only=True)
    title = serializers.CharField(read_only=True,
                                  source='get_type_display')

    class Meta:
        model = Cluster
        fields = (
            'id',
            'type',
            'title',
        )


class ClusterObjectiveSerializer(serializers.ModelSerializer):

    frequency = serializers.ChoiceField(choices=FREQUENCY_LEVEL)
    cluster_title = serializers.SerializerMethodField()

    class Meta:
        model = ClusterObjective
        fields = (
            'id',
            'title',
            'reference_number',
            'cluster',
            'cluster_title',
            'frequency',
            # 'reportables',
        )

    def get_cluster_title(self, obj):
        return obj.cluster.get_type_display()


class ClusterObjectivePatchSerializer(ClusterObjectiveSerializer):

    title = serializers.CharField(required=False)
    reference_number = serializers.CharField(required=False)
    cluster = serializers.CharField(required=False)
    frequency = serializers.ChoiceField(choices=FREQUENCY_LEVEL, required=False)

    class Meta:
        model = ClusterObjective
        fields = (
            'id',
            'title',
            'reference_number',
            'cluster',
            'frequency',
        )


class ClusterActivitySerializer(serializers.ModelSerializer):

    co_cluster_title = serializers.SerializerMethodField()
    co_title = serializers.SerializerMethodField()
    co_reference_number = serializers.SerializerMethodField()
    frequency_name = serializers.SerializerMethodField()

    class Meta:
        model = ClusterActivity
        fields = (
            'id',
            'title',
            'standard',
            'title',
            'co_cluster_title',
            'co_title',
            'co_reference_number',
            'frequency',
            'frequency_name',
            'cluster_objective',
        )

    def get_co_cluster_title(self, obj):
        return obj.cluster_objective.cluster.get_type_display()

    def get_co_title(self, obj):
        return obj.cluster_objective.title

    def get_co_reference_number(self, obj):
        return obj.cluster_objective.reference_number

    def get_frequency_name(self, obj):
        return obj.get_frequency_display()


class ClusterActivityPatchSerializer(serializers.ModelSerializer):

    title = serializers.CharField(required=False)
    standard = serializers.CharField(required=False)
    frequency = serializers.ChoiceField(choices=FREQUENCY_LEVEL, required=False)
    cluster_objective = serializers.CharField(required=False)

    class Meta:
        model = ClusterActivity
        fields = (
            'id',
            'title',
            'standard',
            'frequency',
            'cluster_objective',
        )


class ResponsePlanClusterDashboardSerializer(serializers.ModelSerializer):
    num_of_partners = serializers.SerializerMethodField()
    num_of_due_overdue_indicator_reports = serializers.SerializerMethodField()
    num_of_non_cluster_activities = serializers.SerializerMethodField()
    num_of_met_indicator_reports = serializers.SerializerMethodField()
    num_of_constrained_indicator_reports = serializers.SerializerMethodField()
    num_of_on_track_indicator_reports = serializers.SerializerMethodField()
    num_of_no_progress_indicator_reports = serializers.SerializerMethodField()
    num_of_no_status_indicator_reports = serializers.SerializerMethodField()
    upcoming_indicator_reports = serializers.SerializerMethodField()
    overdue_indicator_reports = serializers.SerializerMethodField()
    constrained_indicator_reports = serializers.SerializerMethodField()

    class Meta:
        model = ResponsePlan
        fields = (
            'num_of_partners',
            'num_of_met_indicator_reports',
            'num_of_constrained_indicator_reports',
            'num_of_on_track_indicator_reports',
            'num_of_no_progress_indicator_reports',
            'num_of_no_status_indicator_reports',
            'num_of_due_overdue_indicator_reports',
            'num_of_non_cluster_activities',
            'upcoming_indicator_reports',
            'overdue_indicator_reports',
            'constrained_indicator_reports',
        )

    def get_num_of_partners(self, obj):
        return obj.num_of_partners(clusters=self.context['clusters'])

    def get_num_of_met_indicator_reports(self, obj):
        return obj.num_of_met_indicator_reports(
            clusters=self.context['clusters'],
            partner=self.context.get('partner', None))

    def get_num_of_constrained_indicator_reports(self, obj):
        return obj.num_of_constrained_indicator_reports(
            clusters=self.context['clusters'],
            partner=self.context.get('partner', None))

    def num_of_on_track_indicator_reports(self, obj):
        return obj.num_of_on_track_indicator_reports(
            clusters=self.context['clusters'],
            partner=self.context.get('partner', None))

    def get_num_of_no_progress_indicator_reports(self, obj):
        return obj.num_of_no_progress_indicator_reports(
            clusters=self.context['clusters'],
            partner=self.context.get('partner', None))

    def get_num_of_no_status_indicator_reports(self, obj):
        return obj.num_of_no_status_indicator_reports(
            clusters=self.context['clusters'],
            partner=self.context.get('partner', None))

    def get_num_of_due_overdue_indicator_reports(self, obj):
        return obj.num_of_due_overdue_indicator_reports(
                clusters=self.context['clusters'],
                partner=self.context.get('partner', None))

    def get_num_of_non_cluster_activities(self, obj):
        return obj.num_of_non_cluster_activities(
                clusters=self.context['clusters'],
                partner=self.context.get('partner', None))

    def get_upcoming_indicator_reports(self, obj):
        return ClusterIndicatorReportSerializer(
            obj.upcoming_indicator_reports(
                clusters=self.context['clusters'],
                limit=10, days=15),
            many=True).data

    def get_overdue_indicator_reports(self, obj):
        return ClusterIndicatorReportSerializer(
            obj.overdue_indicator_reports(
                clusters=self.context['clusters'],
                limit=10),
            many=True).data

    def get_constrained_indicator_reports(self, obj):
        return ClusterIndicatorReportSerializer(
            obj.constrained_indicator_reports(
                clusters=self.context['clusters'],
                partner=self.context.get('partner', None),
                limit=10),
            many=True).data


class ResponsePlanPartnerDashboardSerializer(ResponsePlanClusterDashboardSerializer):
    num_of_projects_in_my_organization = serializers.SerializerMethodField()
    my_project_activities = serializers.SerializerMethodField()

    class Meta:
        model = ResponsePlan
        fields = (
            'num_of_met_indicator_reports',
            'num_of_constrained_indicator_reports',
            'num_of_on_track_indicator_reports',
            'num_of_no_progress_indicator_reports',
            'num_of_no_status_indicator_reports',
            'num_of_due_overdue_indicator_reports',
            'num_of_non_cluster_activities',
            'num_of_projects_in_my_organization',
            'overdue_indicator_reports',
            'constrained_indicator_reports',
            'my_project_activities'
        )

    def get_num_of_projects_in_my_organization(self, obj):
        return obj.num_of_projects(
                clusters=self.context['clusters'],
                partner=self.context.get('partner', None))

    def get_my_project_activities(self, obj):
        from partner.serializers import PartnerActivitySerializer

        return PartnerActivitySerializer(
            obj.partner_activities(
                self.context['partner'],
                clusters=self.context['clusters'],
                limit=10), many=True).data


class PartnerAnalysisSummarySerializer(serializers.ModelSerializer):
    summary = serializers.SerializerMethodField()
    reportable_list = serializers.SerializerMethodField()

    class Meta:
        model = Partner

    def get_summary(self, obj):
        pa_list = obj.partner_activities.all()
        progress_reports = ProgressReport.objects.filter(
            indicator_reports__reportable__partner_activities__in=pa_list
        )

        num_met_pr = progress_reports.filter(status=OVERALL_STATUS.Met).count()
        num_ont_pr = progress_reports.filter(status=OVERALL_STATUS.OnT).count()
        num_nop_pr = progress_reports.filter(status=OVERALL_STATUS.NoP).count()
        num_con_pr = progress_reports.filter(status=OVERALL_STATUS.Con).count()

        location_data = IndicatorLocationData.objects.filter(
            indicator_report__progress_report__in=progress_reports)

        location_types = GatewayType.objects.filter(
            locations__indicator_location_data=location_data).distinct()

        num_of_reports_by_location_type = {}

        for location_type in location_types:
            num_of_reports_by_location_type[str(location_type)] = location_data.filter(location__gateway=location_type).count()

        return {
            'num_of_activities': pa_list.count(),
            'recent_progress_reports_by_status': {
                'met': num_met_pr,
                'on_track': num_ont_pr,
                'no_progress': num_nop_pr,
                'constrained': num_con_pr,
            },
            'num_of_reports_by_location_type': num_of_reports_by_location_type,
            'num_of_projects': obj.partner_projects.count(),
            'cluster_contributing_to': list(
                obj.clusters.values_list('type', flat=True).distinct()
            ),
        }

    def get_reportable_list(self, obj):
        reportables = Reportable.objects.filter(
            partner_activities__in=obj.partner_activities.all())

        return ReportableSimpleSerializer(reportables, many=True)
