from dateutil.parser import parse
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.common import RESPONSE_PLAN_TYPE, EXTERNAL_DATA_SOURCES
from core.models import Workspace, ResponsePlan
from core.permissions import IsIMO
from core.serializers import ResponsePlanSerializer
from ocha.constants import HPC_V1_ROOT_URL, RefCode

from ocha.imports.utilities import import_response_plan, get_json_from_url
from ocha.imports.bulk import get_response_plans_for_countries


class RPMWorkspaceResponsePlanAPIView(APIView):

    permission_classes = (
        IsIMO,
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
        IsIMO,
    )

    def get(self, request, *args, **kwargs):
        source_url = HPC_V1_ROOT_URL + 'rpm/plan/id/{}?format=json&content=entities'.format(self.kwargs['id'])
        plan_data = get_json_from_url(source_url)['data']
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
