import logging

from django import forms
from django.core.exceptions import ValidationError

from suit.widgets import AutosizedTextarea

from carto.sql import SQLClient
from carto.exceptions import CartoException

from core.cartodb import get_carto_client
from core.models import GatewayType, CartoDBTable


logger = logging.getLogger('locations.models')


class AutoSizeTextForm(forms.ModelForm):
    """
    Adds large text boxes to name and description fields
    """
    class Meta:
        widgets = {
            'name':
                AutosizedTextarea(attrs={'class': 'input-xlarge'}),
            'description':
                AutosizedTextarea(attrs={'class': 'input-xlarge'}),
        }


class CartoDBTableForm(forms.ModelForm):

    class Meta:
        model = CartoDBTable
        fields = '__all__'

    def clean(self):

        domain = self.cleaned_data['domain']
        api_key = self.cleaned_data['api_key']
        table_name = self.cleaned_data['table_name']

        client = get_carto_client(api_key, domain)
        sql = SQLClient(client)

        try:
            sites = sql.send(
                'select * from {} limit 1'.format(table_name)
            )
        except CartoException:
            logging.exception("CartoDB exception occured", exc_info=True)
            raise ValidationError(
                "Couldn't connect to CartoDB table: " + table_name)
        else:
            row = sites['rows'][0]
            if 'name' not in row:
                raise ValidationError(
                    'The Name column ({}) is not in table: {}'.format(
                        'name', table_name))

            if 'pcode' not in row:
                raise ValidationError(
                    'The PCode column ({}) is not in table: {}'.format(
                        'pcode', table_name))

            if self.cleaned_data['parent'] and 'parent_pcode' not in row:
                raise ValidationError(
                    'The Parent Code column ({}) is not in table: {}'.format(
                        'parent_pcode', table_name))

        return self.cleaned_data


class GatewayTypeModelForm(forms.ModelForm):
    admin_level = forms.IntegerField(
        min_value=1, max_value=10,
    )

    class Meta:
        model = GatewayType
        fields = (
            'name',
            'admin_level',
            'intervention',
        )
