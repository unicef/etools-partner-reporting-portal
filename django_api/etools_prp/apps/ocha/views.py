from django.conf import settings
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone

from dateutil.parser import parse
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from etools_prp.apps.cluster.models import Cluster
from etools_prp.apps.core.common import EXTERNAL_DATA_SOURCES, PRP_ROLE_TYPES, RESPONSE_PLAN_TYPE
from etools_prp.apps.core.models import ResponsePlan, Workspace
from etools_prp.apps.core.permissions import (
    AnyPermission,
    HasAnyRole,
    IsAuthenticated,
    IsClusterSystemAdmin,
    IsIMOForCurrentWorkspace,
)
from etools_prp.apps.core.serializers import ResponsePlanSerializer
from etools_prp.apps.ocha.constants import HPC_V1_ROOT_URL, HPC_V2_ROOT_URL, RefCode
from etools_prp.apps.ocha.imports.bulk import fetch_json_urls, get_response_plans_for_countries
from etools_prp.apps.ocha.imports.project import get_project_list_for_plan, import_project
from etools_prp.apps.ocha.imports.response_plan import import_response_plan
from etools_prp.apps.ocha.imports.utilities import get_json_from_url
from etools_prp.apps.ocha.utilities import trim_list
from etools_prp.apps.partner.models import Partner
from etools_prp.apps.partner.serializers import PartnerProjectSerializer


class RPMWorkspaceResponsePlanAPIView(APIView):

    permission_classes = (
        AnyPermission(
            IsIMOForCurrentWorkspace,
            IsClusterSystemAdmin,
        ),
    )

    def get_workspace(self):
        return get_object_or_404(
            Workspace, id=self.kwargs['workspace_id']
        )

    def get_response_plans(self):
        return get_response_plans_for_countries([])

    def get(self, request, *args, **kwargs):
        response_plans = self.get_response_plans()

        return Response(trim_list(response_plans, 'response_plan'))

    def post(self, request, *args, **kwargs):
        plan_id = request.data.get('plan')
        if not plan_id:
            raise serializers.ValidationError({
                'plan': 'Plan ID missing'
            })
        elif ResponsePlan.objects.filter(external_id=plan_id, external_source=EXTERNAL_DATA_SOURCES.HPC).exists():
            raise serializers.ValidationError('Plan has already been imported')

        response_plan = import_response_plan(plan_id, workspace=self.get_workspace())
        response_plan.refresh_from_db()

        for cluster in response_plan.all_clusters:
            request.user.prp_roles.create(
                role=PRP_ROLE_TYPES.cluster_imo,
                cluster=cluster,
                workspace=response_plan.workspace,
            )

        return Response(ResponsePlanSerializer(response_plan).data, status=status.HTTP_201_CREATED)


class RPMWorkspaceResponsePlanDetailAPIView(APIView):

    permission_classes = (
        IsAuthenticated,
        HasAnyRole(
            PRP_ROLE_TYPES.cluster_system_admin,
            PRP_ROLE_TYPES.cluster_imo,
        ),
    )

    def get(self, request, *args, **kwargs):
        source_url = HPC_V1_ROOT_URL + 'rpm/plan/id/{}?format=json&content=entities'.format(self.kwargs['id'])
        try:
            plan_data = get_json_from_url(source_url)['data']
        except Exception:
            raise serializers.ValidationError('OCHA service unavailable.')

        out_data = {
            k: v for k, v in plan_data.items() if type(v) not in {list, dict}
        }

        if 'governingEntities' in plan_data:
            cluster_names = [
                ge['governingEntityVersion']['name'] for ge in plan_data['governingEntities'] if
                ge['entityPrototype']['refCode'] == RefCode.CLUSTER
            ]
        else:
            cluster_names = []
        out_data['clusterNames'] = cluster_names
        if plan_data['categories'] and plan_data['categories'][0]['id'] == 5:
            out_data['planType'] = RESPONSE_PLAN_TYPE.fa
        else:
            out_data['planType'] = RESPONSE_PLAN_TYPE.hrp

        out_data['startDate'] = parse(plan_data['planVersion']['startDate']).strftime(settings.DATE_FORMAT)
        out_data['endDate'] = parse(plan_data['planVersion']['endDate']).strftime(settings.DATE_FORMAT)

        return Response(out_data)


class RPMProjectListAPIView(APIView):

    permission_classes = (IsAuthenticated,)

    def check_response_plan_permission(self, request, obj):
        if not request.user.prp_roles.filter(
                Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
                Q(role=PRP_ROLE_TYPES.cluster_imo, cluster__response_plan_id=obj.id) |
                Q(role=PRP_ROLE_TYPES.cluster_member, cluster__response_plan_id=obj.id) |
                Q(role=PRP_ROLE_TYPES.ip_authorized_officer, workspace__response_plans=obj.id)
        ).exists():
            self.permission_denied(request)

    def get_response_plan(self):
        response_plan = get_object_or_404(
            ResponsePlan, id=self.kwargs['plan_id']
        )
        self.check_response_plan_permission(self.request, response_plan)
        return response_plan

    def get_projects(self):
        response_plan = self.get_response_plan()
        if not response_plan.external_id:
            raise serializers.ValidationError('Cannot list projects for a RP without external ID')

        return get_project_list_for_plan(response_plan.external_id)

    def get(self, request, *args, **kwargs):
        ocha_external_id = request.GET.get('ocha_external_id', None)
        projects = self.get_projects()
        # Limit projects to choosed partner only
        result = list()
        if ocha_external_id:
            for project in projects:
                try:
                    if 'projectVersions' in project \
                            and len(project['projectVersions']) > 0 \
                            and 'organizations' in project['projectVersions'][0]:
                        organizations_id = [org['id'] for org in project['projectVersions'][0]['organizations']]
                        if int(ocha_external_id) in organizations_id:
                            result.append(project)
                except Exception:
                    continue
        else:
            result = projects

        return Response(trim_list(result, 'partner_project'))

    def get_partner(self):
        if self.request.user.prp_roles.filter(
                role__in=(PRP_ROLE_TYPES.cluster_system_admin, PRP_ROLE_TYPES.cluster_imo)
        ).exists():
            partner = get_object_or_404(Partner, id=self.request.data.get('partner_id'))

            if self.request.user.is_cluster_system_admin:
                return partner

            user_cluster_ids = self.request.user.prp_roles.values_list('cluster', flat=True)
            if not Cluster.objects.filter(id__in=user_cluster_ids, partners=partner).exists():
                raise serializers.ValidationError({
                    'partner_id': "the partner_id does not belong to your clusters"
                })
            return partner
        elif self.request.user.partner:
            return self.request.user.partner
        raise serializers.ValidationError({
            'partner_id': "Could not find a valid partner"
        })

    def post(self, request, *args, **kwargs):
        project_id = request.data.get('project')
        if not project_id:
            raise serializers.ValidationError({
                'project': 'Project ID missing'
            })
        elif ResponsePlan.objects.filter(external_id=project_id, external_source=EXTERNAL_DATA_SOURCES.HPC).exists():
            raise serializers.ValidationError('Project has already been imported')

        partner = self.get_partner()

        partner_project = import_project(project_id, partner.pk, response_plan=self.get_response_plan())
        partner_project.refresh_from_db()
        return Response(PartnerProjectSerializer(partner_project).data, status=status.HTTP_201_CREATED)


class RPMProjectDetailAPIView(APIView):

    permission_classes = (
        IsAuthenticated,
        HasAnyRole(
            PRP_ROLE_TYPES.cluster_system_admin,
            PRP_ROLE_TYPES.cluster_imo,
            PRP_ROLE_TYPES.ip_authorized_officer,
        ),
    )

    def get(self, request, *args, **kwargs):
        details_url = HPC_V2_ROOT_URL + 'project/{}'.format(self.kwargs['id'])

        details = fetch_json_urls([
            details_url,
        ])

        # We should use project code whenever is possible. ID filtering might be not working in case of new OPS data
        if details:
            project_code = details[0]['data']['projectVersion']['code']
            budget_url = HPC_V1_ROOT_URL + 'fts/flow?projectCode={}'.format(project_code)
        else:
            budget_url = HPC_V1_ROOT_URL + 'fts/flow?projectId={}'.format(self.kwargs['id'])

        details, budget_info = fetch_json_urls([
            details_url,
            budget_url,
        ])

        out_data = {
            k: v for k, v in details['data'].items() if type(v) not in {list, dict}
        }

        # Grab project details from projectVersion array of dict
        current_project_data = None

        for project in details['data']['projectVersions']:
            if details['data']['currentPublishedVersionId'] == project['id']:
                current_project_data = project
                break

        # Fetch attachment data
        attachment_url = HPC_V2_ROOT_URL \
            + 'project/{}/attachments'.format(details['data']['id'])
        attachments = get_json_from_url(attachment_url)

        if 'data' in attachments:
            out_data['attachments'] = map(
                lambda item: item['attachment']['attachmentVersion']['value']['description'],
                filter(lambda x: x['attachment']['type'] == 'indicator', attachments['data'])
            )

        out_data['startDate'] = current_project_data['startDate']
        out_data['endDate'] = current_project_data['endDate']
        out_data['name'] = current_project_data['name']

        # out_data['totalBudgetUSD'] = sum([
        #     f['amountUSD'] for f in budget_info['data']['flows']
        # ]) if budget_info['data']['flows'] else None

        out_data['totalBudgetUSD'] = current_project_data['currentRequestedFunds']

        funding_sources = []

        if 'data' in budget_info:
            for flow in budget_info['data']['flows']:
                funding_sources.extend([
                    fs['name'] for fs in flow.get('sourceObjects', []) if fs['type'] == 'Organization'
                ])

        out_data['fundingSources'] = funding_sources
        out_data['objective'] = current_project_data['objective']
        additional_information = list()
        if 'contacts' in current_project_data:
            for contact in current_project_data['contacts']:
                if "website" in contact and contact['website']:
                    additional_information.append(contact['website'])
        out_data['additional_information'] = ", ".join(additional_information)

        start_datetime = parse(out_data['startDate'])
        end_datetime = parse(out_data['endDate'])

        out_data['startDate'] = start_datetime.strftime(settings.DATE_FORMAT)
        out_data['endDate'] = end_datetime.strftime(settings.DATE_FORMAT)

        clusters = []

        try:
            clusters += [
                global_cluster_data['name'] for global_cluster_data in current_project_data['globalClusters']
            ]
        except Exception:
            pass

        try:
            clusters += [
                c['name'] for c in current_project_data['governingEntities'] if c['entityPrototypeId'] == 9
            ]
        except Exception:
            pass

        out_data['clusters'] = clusters

        today = timezone.now()
        if start_datetime > today:
            out_data['status'] = 'Planned'
        elif end_datetime < today:
            out_data['status'] = 'Completed'
        else:
            out_data['status'] = 'Ongoing'

        return Response(out_data)
