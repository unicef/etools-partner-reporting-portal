from rest_framework import serializers

from core.common import FREQUENCY_LEVEL

from indicator.serializers import (
    ClusterIndicatorReportSerializer,
    ClusterIndicatorReportListSerializer,
)

from .models import ClusterObjective, ClusterActivity, Cluster


class ClusterSimpleSerializer(serializers.ModelSerializer):

    title = serializers.CharField(read_only=True)

    class Meta:
        model = Cluster
        fields = (
            'id',
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
        return obj.cluster.title


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

    class Meta:
        model = ClusterActivity
        fields = (
            'id',
            'title',
            'standard',
            'co_cluster_title',
            'co_title',
            'co_reference_number',
            'frequency',
            'cluster_objective',
        )

    def get_co_cluster_title(self, obj):
        return obj.cluster_objective.cluster.title

    def get_co_title(self, obj):
        return obj.cluster_objective.title

    def get_co_reference_number(self, obj):
        return obj.cluster_objective.reference_number


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


class ClusterDashboardSerializer(serializers.ModelSerializer):
    num_of_partners = serializers.SerializerMethodField()
    num_of_met_indicator_reports = serializers.SerializerMethodField()
    num_of_constrained_indicator_reports = serializers.SerializerMethodField()
    num_of_on_track_indicator_reports = serializers.SerializerMethodField()
    num_of_no_progress_indicator_reports = serializers.SerializerMethodField()
    num_of_no_status_indicator_reports = serializers.SerializerMethodField()
    num_of_due_overdue_indicator_reports = serializers.SerializerMethodField()
    num_of_non_cluster_activities = serializers.SerializerMethodField()
    new_indicator_reports = serializers.SerializerMethodField()
    overdue_indicator_reports = serializers.SerializerMethodField()
    constrained_indicator_reports = serializers.SerializerMethodField()

    def get_num_of_partners(self, obj):
        return obj.num_of_partners

    def get_num_of_met_indicator_reports(self, obj):
        return obj.num_of_met_indicator_reports

    def get_num_of_constrained_indicator_reports(self, obj):
        return obj.num_of_constrained_indicator_reports

    def get_num_of_on_track_indicator_reports(self, obj):
        return obj.num_of_on_track_indicator_reports

    def get_num_of_no_progress_indicator_reports(self, obj):
        return obj.num_of_no_progress_indicator_reports

    def get_num_of_no_status_indicator_reports(self, obj):
        return obj.num_of_no_status_indicator_reports

    def get_num_of_due_overdue_indicator_reports(self, obj):
        return obj.num_of_due_overdue_indicator_reports

    def get_num_of_non_cluster_activities(self, obj):
        return obj.num_of_non_cluster_activities

    def get_new_indicator_reports(self, obj):
        return ClusterIndicatorReportSerializer(
            obj.new_indicator_reports, many=True).data

    def get_overdue_indicator_reports(self, obj):
        return ClusterIndicatorReportSerializer(
            obj.overdue_indicator_reports, many=True).data

    def get_constrained_indicator_reports(self, obj):
        return ClusterIndicatorReportListSerializer(
            obj.constrained_indicator_reports, many=True).data

    class Meta:
        model = Cluster
        fields = (
            'num_of_partners',
            'num_of_met_indicator_reports',
            'num_of_constrained_indicator_reports',
            'num_of_on_track_indicator_reports',
            'num_of_no_progress_indicator_reports',
            'num_of_no_status_indicator_reports',
            'num_of_due_overdue_indicator_reports',
            'num_of_non_cluster_activities',
            'new_indicator_reports',
            'overdue_indicator_reports',
            'constrained_indicator_reports',
        )


class ClusterPartnerDashboardSerializer(serializers.ModelSerializer):
    num_of_due_overdue_indicator_reports = serializers.SerializerMethodField()
    num_of_met_indicator_reports = serializers.SerializerMethodField()
    num_of_constrained_indicator_reports = serializers.SerializerMethodField()
    num_of_on_track_indicator_reports = serializers.SerializerMethodField()
    num_of_no_progress_indicator_reports = serializers.SerializerMethodField()
    num_of_no_status_indicator_reports = serializers.SerializerMethodField()
    num_of_projects_in_my_organization = serializers.SerializerMethodField()
    num_of_non_cluster_activities = serializers.SerializerMethodField()
    overdue_indicator_reports = serializers.SerializerMethodField()
    my_project_activities = serializers.SerializerMethodField()
    constrained_indicator_reports = serializers.SerializerMethodField()

    def get_num_of_due_overdue_indicator_reports(self, obj):
        return obj.num_of_due_overdue_indicator_reports_partner(
            self.context['partner'])

    def get_num_of_projects_in_my_organization(self, obj):
        return obj.num_of_projects_in_my_organization_partner(
            self.context['partner'])

    def num_of_met_indicator_reports(self, obj):
        return obj.num_of_met_indicator_reports_partner(
            self.context['partner'])

    def num_of_constrained_indicator_reports(self, obj):
        return obj.num_of_constrained_indicator_reports_partner(
            self.context['partner'])

    def num_of_on_track_indicator_reports(self, obj):
        return obj.num_of_on_track_indicator_reports_partner(
            self.context['partner'])

    def num_of_no_progress_indicator_reports(self, obj):
        return obj.num_of_no_progress_indicator_reports_partner(
            self.context['partner'])

    def num_of_no_status_indicator_reports(self, obj):
        return obj.num_of_no_status_indicator_reports_partner(
            self.context['partner'])

    def get_num_of_non_cluster_activities(self, obj):
        return obj.num_of_non_cluster_activities_partner(
            self.context['partner'])

    def get_overdue_indicator_reports(self, obj):
        return ClusterIndicatorReportSerializer(
            obj.overdue_indicator_reports_partner(
                self.context['partner']), many=True).data

    def get_my_project_activities(self, obj):
        from partner.serializers import PartnerActivitySerializer

        return PartnerActivitySerializer(
            obj.my_project_activities_partner(
                self.context['partner']), many=True).data

    def get_constrained_indicator_reports(self, obj):
        return ClusterIndicatorReportListSerializer(
            obj.constrained_indicator_reports_partner(
                self.context['partner']), many=True).data

    class Meta:
        model = Cluster
        fields = (
            'num_of_due_overdue_indicator_reports',
            'num_of_met_indicator_reports',
            'num_of_constrained_indicator_reports',
            'num_of_on_track_indicator_reports',
            'num_of_no_progress_indicator_reports',
            'num_of_no_status_indicator_reports',
            'num_of_projects_in_my_organization',
            'num_of_non_cluster_activities',
            'overdue_indicator_reports',
            'my_project_activities',
            'constrained_indicator_reports',
        )
