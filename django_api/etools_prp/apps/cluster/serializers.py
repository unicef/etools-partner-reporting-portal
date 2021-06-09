import operator
from functools import reduce

from django.db.models import F, Q

from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework_gis.fields import GeoJsonDict, GeometryField
from rest_framework_gis.serializers import GeoFeatureModelSerializer, GeometrySerializerMethodField

from etools_prp.apps.core.common import CLUSTER_TYPE_NAME_DICT, OVERALL_STATUS, PARTNER_PROJECT_STATUS
from etools_prp.apps.core.models import GatewayType, Location, ResponsePlan
from etools_prp.apps.indicator.models import IndicatorLocationData, IndicatorReport, Reportable
from etools_prp.apps.indicator.serializers import ClusterIndicatorReportSerializer
from etools_prp.apps.partner.models import Partner

from .models import Cluster, ClusterActivity, ClusterObjective


class ClusterSimpleSerializer(serializers.ModelSerializer):

    type = serializers.CharField(read_only=True)
    title = serializers.CharField(read_only=True)
    full_title = serializers.SerializerMethodField()

    class Meta:
        model = Cluster
        fields = (
            'id',
            'type',
            'imported_type',
            'title',
            'full_title',
        )

    def get_full_title(self, obj):
        if obj.response_plan:
            return f'{obj.title} ({obj.response_plan.title} {obj.response_plan.workspace.title})'
        return obj.title


class ClusterIDManagementSerializer(serializers.ModelSerializer):
    full_title = serializers.SerializerMethodField()

    class Meta:
        model = Cluster
        fields = (
            'id',
            'full_title',
        )

    def get_full_title(self, obj):
        if obj.response_plan:
            return f'{obj.title} ({obj.response_plan.title} {obj.response_plan.workspace.title})'
        return obj.title


class ClusterObjectiveSerializer(serializers.ModelSerializer):
    cluster_title = serializers.CharField(source='cluster.title', read_only=True)

    class Meta:
        model = ClusterObjective
        fields = (
            'id',
            'title',
            'cluster',
            'cluster_title',
        )

    def validate(self, data):
        cluster = data['cluster']
        user = self.context['request'].user

        if not user.is_cluster_system_admin and not user.prp_roles.filter(cluster=cluster.id).exists():
            raise ValidationError({
                "cluster": "Cluster does not belong to this user",
            })

        return data


class ClusterObjectivePatchSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=False)

    class Meta:
        model = ClusterObjective
        fields = (
            'id',
            'title',
        )

    def validate(self, data):
        cluster_objective_id = int(self.context['pk'])
        user = self.context['request'].user

        if (not user.is_cluster_system_admin and
                not user.prp_roles.filter(cluster__cluster_objectives=cluster_objective_id).exists()):
            raise ValidationError({
                "cluster": "Cluster does not belong to this user",
            })
        return data


class ClusterActivitySerializer(serializers.ModelSerializer):
    cluster_title = serializers.CharField(source='cluster_objective.cluster.title', read_only=True)
    cluster_objective_title = serializers.CharField(source='cluster_objective.title', read_only=True)
    cluster = serializers.IntegerField(source='cluster_objective.cluster.id')
    cluster_objective = serializers.PrimaryKeyRelatedField(
        queryset=ClusterObjective.objects.all(), write_only=True
    )

    class Meta:
        model = ClusterActivity
        fields = (
            'id',
            'title',
            'cluster',
            'cluster_title',
            'cluster_objective',
            'cluster_objective_title',
        )

    def validate(self, data):
        cluster = data['cluster_objective'].cluster
        user = self.context['request'].user

        if not user.prp_roles.filter(cluster=cluster.id).exists():
            raise ValidationError({
                "cluster": "Cluster does not belong to this user",
            })

        return data


class ClusterActivityPatchSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=False)

    class Meta:
        model = ClusterActivity
        fields = (
            'id',
            'title',
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
            obj.overdue_indicator_reports(clusters=self.context['clusters'], limit=10), many=True
        ).data

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
        from etools_prp.apps.partner.serializers import PartnerActivitySerializer

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
            ir_id = Reportable.objects.filter(partner_activity_project_contexts__activity=pa).values_list('indicator_reports', flat=True).latest('id')

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
            num_of_reports_by_location_type[
                str(location_type)
            ] = location_data.filter(location__gateway=location_type).count()

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
            q_list.append(Q(partner_activity_project_contexts__activity=self.context['activity']))

        else:
            q_list.append(Q(partner_activity_project_contexts__activity__in=obj.partner_activities.all()))

        if 'cluster' in self.context:
            q_list.append(Q(partner_activity_project_contexts__activity__partner__clusters=self.context['cluster']))

        if 'project' in self.context:
            q_list.append(Q(partner_activity_project_contexts__activity__project=self.context['project']))

        if 'ca_indicator' in self.context:
            q_list.append(Q(partner_activity_project_contexts__activity__cluster_activity__reportables=self.context['ca_indicator']))

        if 'report_status' in self.context:
            q_list.append(Q(
                partner_activity_project_contexts__reportables__indicator_reports__overall_status__iexact=self.context['report_status']
            ))

        id_list = Reportable.objects.annotate(title=F('blueprint__title')).filter(reduce(operator.and_, q_list)) \
            .values('id', 'title')

        return id_list


class AnnotatedGeometryField(GeometryField):
    """
    GeometryField to handle annotated geoJSON from ORM
    """
    type_name = 'AnnotatedGeometryField'

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_representation(self, value):
        target_geom_value = value.processed_geom_json or value.processed_point_json

        if isinstance(target_geom_value, dict) or target_geom_value is None:
            return target_geom_value

        # we expect target_geom_value to be a GEOSGeometry instance
        return GeoJsonDict(target_geom_value)


class OperationalPresenceLocationListSerializer(GeoFeatureModelSerializer):
    partners = serializers.SerializerMethodField()
    point = GeometrySerializerMethodField()
    geom = AnnotatedGeometryField(source="*")

    def get_point(self, obj):
        return obj.geo_point or None

    def get_partners(self, obj):
        partners = Partner.objects.filter(
            clusters__response_plan__workspace__countries__gateway_types__locations=obj) \
            .distinct() \
            .values_list('title', flat=True)

        partner_data = {
            cluster: partners.filter(clusters__type=cluster) for cluster in set(
                partners.values_list('clusters__type', flat=True))
        }
        partner_data["all"] = partners

        return partner_data

    class Meta:
        model = Location
        geo_field = 'geom'
        fields = (
            'id',
            'title',
            'latitude',
            'longitude',
            'p_code',
            'geom',
            'point',
            'partners',
        )
