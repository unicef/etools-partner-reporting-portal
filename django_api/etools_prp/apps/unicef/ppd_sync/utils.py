import logging
from django.contrib.auth import get_user_model
from jsonschema.exceptions import ValidationError
from etools_prp.apps.unicef.models import Person
from etools_prp.apps.unicef.serializers import PMPPDPersonSerializer

logger = logging.getLogger(__name__)
User = get_user_model()
FIRST_NAME_MAX_LENGTH = User._meta.get_field('first_name').max_length
LAST_NAME_MAX_LENGTH = User._meta.get_field('last_name').max_length

def process_model(model_to_process, process_serializer, data, filter_dict):
    instance = model_to_process.objects.filter(**filter_dict).first()
    serializer = process_serializer(instance=instance, data=data)
    serializer.is_valid(raise_exception=True)
    return serializer.save()


def create_user_for_person(person):
    # Check if given person already exists in user model (by email)
    user, created = User.objects.get_or_create(username=person.email, defaults={
        'email': person.email
    })
    if created:
        user.set_unusable_password()
        user.send_email_notification_on_create('IP')

    if person.name:
        name_parts = person.name.split()
        if len(name_parts) == 2:
            user.first_name = name_parts[0][:FIRST_NAME_MAX_LENGTH]
            user.last_name = name_parts[1][:LAST_NAME_MAX_LENGTH]
        else:
            user.first_name = person.name[:FIRST_NAME_MAX_LENGTH]

    user.save()
    return user


def save_person_and_user(person_data, create_user=False):
    try:
        person = process_model(
            Person, PMPPDPersonSerializer, person_data, {'email': person_data['email']}
        )
    except ValidationError:
        logger.debug('Error trying to save Person model with {}'.format(person_data))
        return None, None

    if create_user:
        user = create_user_for_person(person)
    else:
        user = None

    return person, user