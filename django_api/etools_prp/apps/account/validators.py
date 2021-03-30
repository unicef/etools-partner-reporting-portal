from django.contrib.auth import get_user_model

from rest_framework.exceptions import ValidationError
from rest_framework.validators import UniqueValidator


class EmailValidator(UniqueValidator):
    def __init__(self, queryset=None):
        if queryset is None:
            queryset = get_user_model().objects.all()
        super().__init__(
            queryset,
            message="This user already exists in the system.",
        )

    def __call__(self, value, serializer_field):
        if value != value.lower():
            raise ValidationError("Email needs to be lower case.")
        super().__call__(value, serializer_field)
