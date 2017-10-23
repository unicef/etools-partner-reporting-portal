from __future__ import unicode_literals
from rest_framework.exceptions import ValidationError


class AddIndicatorObjectTypeValidator(object):

    def __call__(self, value):
        choices = [
            'ClusterObjective',
            'ClusterActivity',
            'PartnerProject',
            'PartnerActivity']
        if value not in choices:
            msg = "Not valid data. " \
                  "Expected value is ClusterObjective, ClusterActivity, PartnerProject, PartnerActivity."
            raise ValidationError(msg)


add_indicator_object_type_validator = AddIndicatorObjectTypeValidator()
