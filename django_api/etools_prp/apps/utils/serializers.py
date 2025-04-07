from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.settings import api_settings
from rest_framework.utils import html


class CurrentWorkspaceDefault:

    workspace = None

    def set_context(self, serializer_field):
        from etools_prp.apps.core.models import Workspace
        self.workspace = Workspace.objects.get(id=serializer_field.context['view'].kwargs['workspace_id'])

    def __call__(self):
        return self.workspace

    def __str__(self):
        return '{}()'.format(self.__class__.__name__)


def serialize_choices(choices):
    return [
        {
            'value': value,
            'label': label,
        } for value, label in choices
    ]


class OptionalElementsListSerializer(serializers.ListSerializer):
    """
    ignore elements having validation errors
    """
    def to_internal_value(self, data):
        if html.is_html_input(data):
            data = html.parse_html_list(data, default=[])

        if not isinstance(data, list):
            message = self.error_messages['not_a_list'].format(
                input_type=type(data).__name__
            )
            raise ValidationError({
                api_settings.NON_FIELD_ERRORS_KEY: [message]
            }, code='not_a_list')

        ret = []

        for item in data:
            try:
                validated = self.child.run_validation(item)
            except ValidationError:
                continue
            else:
                ret.append(validated)

        if not self.allow_empty and len(ret) == 0:
            message = self.error_messages['empty']
            raise ValidationError({
                api_settings.NON_FIELD_ERRORS_KEY: [message]
            }, code='empty')

        return ret
