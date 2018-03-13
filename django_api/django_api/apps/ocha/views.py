<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
import pycountry
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import Workspace
from core.permissions import IsAuthenticated
<<<<<<< Updated upstream
from ocha.import_utilities import get_plan_list_for_country


class RPMWorkspaceResponsePlanListAPIView(APIView):

    permission_classes = (IsAuthenticated, )

    def get_country_iso3_codes(self):
        workspace = get_object_or_404(
            Workspace, id=self.kwargs['workspace_id']
        )

        errors = []
        iso3_codes = []
        for country in workspace.countries.all():
=======
from ocha.import_utilities import get_plan_list_for_country, import_response_plan


class RPMWorkspaceResponsePlanAPIView(APIView):

    permission_classes = ()

    def get_workspace(self):
        return get_object_or_404(
            Workspace, id=self.kwargs['workspace_id']
        )

    def get_country_iso3_codes(self):
        errors = []
        iso3_codes = []

        countries = self.get_workspace().countries.all()
        if not countries:
            raise serializers.ValidationError(
                'Workspace has no countries assigned.'
            )

        for country in countries:
>>>>>>> Stashed changes
            try:
                pycountry.countries.get(alpha_3=country.country_short_code)
                iso3_codes.append(country.country_short_code)
            except KeyError:
                errors.append(
                    '{} is not a valid ISO3 country code, invalid workspace setup.'.format(country.country_short_code)
                )
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
        if not iso3_codes:
            raise serializers.ValidationError(errors)

        return iso3_codes

    def get_response_plans(self):
        plans = []

        for iso3_code in self.get_country_iso3_codes():
            plans.extend(get_plan_list_for_country(iso3_code))
        return plans

    def get(self, request, *args, **kwargs):
        response_plans = self.get_response_plans()
        # TODO: Sort?

        return Response(response_plans)
<<<<<<< Updated upstream
=======

    def post(self, request, *args, **kwargs):
        plan_id = request.data.get('plan')
        if not plan_id:
            raise serializers.ValidationError({
                'plan': 'Plan ID missing'
            })

        import_response_plan(plan_id, workspace=self.get_workspace())
        return Response()
>>>>>>> Stashed changes
>>>>>>> Stashed changes
