from django import forms
from django.forms.widgets import Select

from core.models import GatewayType


class GatewayTypeModelForm(forms.ModelForm):
    admin_level = forms.IntegerField(
        min_value=1, max_value=10,
    )

    class Meta:
        model = GatewayType
        fields = (
            'name',
            'admin_level',
            'workspace',
        )
