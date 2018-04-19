from dateutil.parser import parse
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.common import RESPONSE_PLAN_TYPE, EXTERNAL_DATA_SOURCES
from core.models import Workspace, ResponsePlan, IMORole
from core.permissions import IsIMOForCurrentWorkspace, IsPartnerAuthorizedOfficer, AnyPermission
from core.serializers import ResponsePlanSerializer
from ocha.constants import HPC_V1_ROOT_URL, RefCode, HPC_V2_ROOT_URL

from ocha.imports.utilities import get_json_from_url
from ocha.imports.response_plan import import_response_plan
from ocha.imports.project import import_project, get_project_list_for_plan
from ocha.imports.bulk import get_response_plans_for_countries, fetch_json_urls_async
from partner.models import Partner
from partner.serializers import PartnerProjectSerializer


class RPMWorkspaceResponsePlanAPIView(APIView):

    permission_classes = (
        IsIMOForCurrentWorkspace,
    )

    def get_workspace(self):
        return get_object_or_404(
            Workspace, id=self.kwargs['workspace_id']
        )

    def get_country_iso3_codes(self):
        iso3_codes = []

        countries = self.get_workspace().countries.all()
        if not countries:
            raise serializers.ValidationError(
                'Workspace has no countries assigned.'
            )

        for country in countries:
            if country.details:
                iso3_codes.append(country.details.alpha_3)

        if not iso3_codes:
            raise serializers.ValidationError(
                'Countries in the workspace have invalid setup, cannot proceed.'
            )

        return iso3_codes

    def trim_plans_list(self, response_plans):
        return [{
            'id': rp['id'],
            'name': rp['name'],
        } for rp in response_plans]

    def get_response_plans(self):
        return get_response_plans_for_countries(self.get_country_iso3_codes())

    def get(self, request, *args, **kwargs):
        response_plans = self.get_response_plans()

        return Response(
            self.trim_plans_list(response_plans)
        )

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
        request.user.imo_clusters.add(*response_plan.all_clusters)
        return Response(ResponsePlanSerializer(response_plan).data, status=status.HTTP_201_CREATED)


class RPMWorkspaceResponsePlanDetailAPIView(APIView):

    permission_classes = (
        IsIMOForCurrentWorkspace,
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
                ge['name'] for ge in plan_data['governingEntities'] if
                ge['entityPrototype']['refCode'] == RefCode.CLUSTER
            ]
        else:
            cluster_names = []
        out_data['clusterNames'] = cluster_names
        if plan_data['categories'] and plan_data['categories'][0]['id'] == 5:
            out_data['planType'] = RESPONSE_PLAN_TYPE.fa
        else:
            out_data['planType'] = RESPONSE_PLAN_TYPE.hrp

        out_data['startDate'] = parse(out_data['startDate']).strftime(settings.DATE_FORMAT)
        out_data['endDate'] = parse(out_data['endDate']).strftime(settings.DATE_FORMAT)

        return Response(out_data)


class RPMProjectListAPIView(APIView):

    permission_classes = (
        AnyPermission(IsIMOForCurrentWorkspace, IsPartnerAuthorizedOfficer),
    )

    def get_response_plan(self):
        return get_object_or_404(
            ResponsePlan, id=self.kwargs['plan_id']
        )

    def trim_projects_list(self, projects):
        out = []
        for project in projects:
            try:
                out.append({
                    'id': project['id'],
                    'name': project['name'],
                })
            except KeyError:
                pass

        return out

    def get_projects(self):
        response_plan = self.get_response_plan()
        if not response_plan.external_id:
            raise serializers.ValidationError('Cannot list projects for a RP without external ID')

        return get_project_list_for_plan(response_plan.external_id)

    def get(self, request, *args, **kwargs):
        projects = self.get_projects()

        return Response(
            self.trim_projects_list(projects)
        )

    def get_partner(self):
        if self.request.user.groups.filter(name=IMORole.as_group().name).exists():
            partner = get_object_or_404(Partner, id=self.request.data.get('partner_id'))
            if not self.request.user.imo_clusters.filter(partners=partner).exists():
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
        AnyPermission(IsIMOForCurrentWorkspace, IsPartnerAuthorizedOfficer),
    )

    def get(self, request, *args, **kwargs):
        details_url = HPC_V2_ROOT_URL + 'project/{}'.format(self.kwargs['id'])
        budget_url = HPC_V1_ROOT_URL + 'fts/flow?projectId={}'.format(self.kwargs['id'])

        details, budget_info = fetch_json_urls_async([
            details_url,
            budget_url
        ])
        print(details)

        out_data = {
            k: v for k, v in details['data'].items() if type(v) not in {list, dict}
        }

        out_data['totalBudgetUSD'] = sum([
            f['amountUSD'] for f in budget_info['data']['flows']
        ]) if budget_info['data']['flows'] else None

        funding_sources = []
        for flow in budget_info['data']['flows']:
            funding_sources.extend([
                fs['name'] for fs in flow.get('sourceObjects', []) if fs['type'] == 'Organization'
            ])
        out_data['fundingSources'] = funding_sources

        start_datetime = parse(out_data['startDate'])
        end_datetime = parse(out_data['endDate'])

        out_data['startDate'] = start_datetime.strftime(settings.DATE_FORMAT)
        out_data['endDate'] = end_datetime.strftime(settings.DATE_FORMAT)

        clusters = []

        try:
            clusters += [
                global_cluster_data['name'] for global_cluster_data in details['data']['globalClusters']
            ]
        except Exception:
            pass

        try:
            clusters += [
                c['name'] for c in details['data']['governingEntities'] if c['entityPrototypeId'] == 9
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
