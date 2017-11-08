import operator

from functools import reduce

from django.db.models import Q, F

from rest_framework import serializers

from core.common import OVERALL_STATUS, PARTNER_PROJECT_STATUS, CLUSTER_TYPE_NAME_DICT
from core.models import ResponsePlan, GatewayType
from indicator.models import Reportable, IndicatorReport, IndicatorLocationData
from indicator.serializers import (
    ClusterIndicatorReportSerializer,
    ClusterIndicatorReportListSerializer,
    ReportableSimpleSerializer,
)
from partner.models import Partner
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
    cluster_title = serializers.SerializerMethodField()

    class Meta:
        model = ClusterObjective
        fields = (
            'id',
            'title',
            'cluster',
            'cluster_title',
            # 'reportables',
        )

    def get_cluster_title(self, obj):
        return obj.cluster.get_type_display()


class ClusterObjectivePatchSerializer(ClusterObjectiveSerializer):
    title = serializers.CharField(required=False)
    cluster = serializers.CharField(required=False)

    class Meta:
        model = ClusterObjective
        fields = (
            'id',
            'title',
            'cluster',
        )


class ClusterActivitySerializer(serializers.ModelSerializer):

    co_cluster_title = serializers.SerializerMethodField()
    co_title = serializers.SerializerMethodField()

    class Meta:
        model = ClusterActivity
        fields = (
            'id',
            'title',
            'co_cluster_title',
            'co_title',
            'cluster_objective',
        )

    def get_co_cluster_title(self, obj):
        return obj.cluster_objective.cluster.get_type_display()

    def get_co_title(self, obj):
        return obj.cluster_objective.title


class ClusterActivityPatchSerializer(serializers.ModelSerializer):

    title = serializers.CharField(required=False)
    cluster_objective = serializers.CharField(required=False)

    class Meta:
        model = ClusterActivity
        fields = (
            'id',
            'title',
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

    def get_num_of_on_track_indicator_reports(self, obj):
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


class ResponsePlanPartnerDashboardSerializer(
        ResponsePlanClusterDashboardSerializer):
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
        fields = (
            'summary',
            'reportable_list',
        )

    def get_summary(self, obj):
        pa_list = None
        projects = {
            'ongoing': [],
            'planned': [],
            'completed': [],
        }

        if 'project' in self.context:
            pa_list = self.context['project'].partner_activities.all()

            if self.context['project'].status == PARTNER_PROJECT_STATUS.ongoing:
                projects['ongoing'].append(self.context['project'].title)

            elif self.context['project'].status == PARTNER_PROJECT_STATUS.planned:
                projects['planned'].append(self.context['project'].title)

            elif self.context['project'].status == PARTNER_PROJECT_STATUS.completed:
                projects['completed'].append(self.context['project'].title)

        else:
            pa_list = obj.partner_activities.all()

            for proj in obj.partner_projects.all():
                if proj.status == PARTNER_PROJECT_STATUS.ongoing:
                    projects['ongoing'].append(proj.title)

                elif proj.status == PARTNER_PROJECT_STATUS.planned:
                    projects['planned'].append(proj.title)

                elif proj.status == PARTNER_PROJECT_STATUS.completed:
                    projects['completed'].append(proj.title)

        cluster_contributing_to = list()

        if 'cluster' in self.context:
            cluster_contributing_to.append({
                'id': self.context['cluster'].id,
                'title': CLUSTER_TYPE_NAME_DICT[self.context['cluster'].type]
            })

        else:
            for c_info in obj.clusters.values('id', 'type').distinct():
                cluster_contributing_to.append({
                    'id': c_info['id'],
                    'title': CLUSTER_TYPE_NAME_DICT[c_info['type']]
                })

        num_ca = pa_list.filter(cluster_activity__isnull=False).count()
        num_pa = pa_list.filter(cluster_activity__isnull=True).count()

        ir_list = []

        for pa in pa_list:
            ir_id = pa.reportables.values_list('indicator_reports', flat=True).latest('id')

            if ir_id:
                ir_list.append(ir_id)

        indicator_reports = IndicatorReport.objects.filter(
            id__in=ir_list
        )

        num_met_pr = indicator_reports.filter(overall_status=OVERALL_STATUS.met).count()
        num_ont_pr = indicator_reports.filter(overall_status=OVERALL_STATUS.on_track).count()
        num_nop_pr = indicator_reports.filter(overall_status=OVERALL_STATUS.no_progress).count()
        num_con_pr = indicator_reports.filter(overall_status=OVERALL_STATUS.constrained).count()

        location_data = IndicatorLocationData.objects.filter(
            indicator_report__in=indicator_reports)

        location_types = GatewayType.objects.filter(
            locations__indicator_location_data__in=location_data).distinct()

        num_of_reports_by_location_type = {}

        for location_type in location_types:
            num_of_reports_by_location_type[str(location_type)] = location_data.filter(location__gateway=location_type).count()

        return {
            'num_of_activities': {
                'num_of_ca': num_ca,
                'num_of_pa': num_pa,
            },
            'recent_progress_reports_by_status': {
                'met': num_met_pr,
                'on_track': num_ont_pr,
                'no_progress': num_nop_pr,
                'constrained': num_con_pr,
            },
            'num_of_reports_by_location_type': num_of_reports_by_location_type,
            'num_of_projects': projects,
            'cluster_contributing_to': cluster_contributing_to,
        }

    def get_reportable_list(self, obj):
        q_list = []

        if 'activity' in self.context:
            q_list.append(Q(partner_activities=self.context['activity']))

        else:
            q_list.append(Q(partner_activities__in=obj.partner_activities.all()))

        if 'cluster' in self.context:
            q_list.append(Q(partner_activities__partner__clusters=self.context['cluster']))

        if 'project' in self.context:
            q_list.append(Q(partner_activities__project=self.context['project']))

        if 'ca_indicator' in self.context:
            q_list.append(Q(partner_activities__cluster_activity__reportables=self.context['ca_indicator']))

        if 'report_status' in self.context:
            q_list.append(Q(partner_activities__reportables__indicator_reports__overall_status__iexact=self.context['report_status']))

        id_list = Reportable.objects.annotate(title=F('blueprint__title')).filter(reduce(operator.and_, q_list)) \
            .values('id', 'title')

        return id_list
