from django.contrib.contenttypes.models import ContentType
from django.core import exceptions
from django.utils.deconstruct import deconstructible
from django.utils.translation import gettext_lazy as _

from jsonschema import exceptions as jsonschema_exceptions, validate
from rest_framework.exceptions import ValidationError


class AddIndicatorObjectTypeValidator:

    def __call__(self, value):
        from etools_prp.apps.cluster.models import ClusterActivity, ClusterObjective
        from etools_prp.apps.partner.models import PartnerActivity, PartnerActivityProjectContext, PartnerProject
        model_choices = {
            ClusterObjective,
            ClusterActivity,
            PartnerProject,
            PartnerActivity,
            PartnerActivityProjectContext,
        }

        content_type = ContentType.objects.get_by_natural_key(*value.split('.'))
        if content_type.model_class() not in model_choices:
            msg = "Not valid data. Expected value is {}.".format(', '.join([
                m._meta.app_label + '.' + m._meta.object_name.lower() for m in model_choices
            ]))
            raise ValidationError(msg)


add_indicator_object_type_validator = AddIndicatorObjectTypeValidator()


@deconstructible
class JSONSchemaValidator:
    message = _("Invalid JSON: %(value)s")
    code = 'invalid_json'

    def __init__(self, json_schema, message=None):
        self.json_schema = json_schema
        if message:
            self.message = message

    def __call__(self, value):
        try:
            validate(value, self.json_schema)
        except jsonschema_exceptions.ValidationError as e:
            raise exceptions.ValidationError(self.message, code=self.code, params={'value': e.message})

    def __eq__(self, other):
        return isinstance(other, self.__class__) and \
            self.json_schema == other.json_schema and \
            self.message == other.message and \
            self.code == other.code
