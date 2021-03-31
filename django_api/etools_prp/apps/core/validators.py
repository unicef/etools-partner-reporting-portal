from django.contrib.contenttypes.models import ContentType

from rest_framework.exceptions import ValidationError

from etools_prp.apps.cluster.models import ClusterActivity, ClusterObjective
from etools_prp.apps.partner.models import PartnerActivity, PartnerActivityProjectContext, PartnerProject


class AddIndicatorObjectTypeValidator:

    def __call__(self, value):
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
