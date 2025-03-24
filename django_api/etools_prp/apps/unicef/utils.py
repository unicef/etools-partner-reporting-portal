import logging
import tempfile

from django.contrib.auth import get_user_model
from django.http import FileResponse
from django.template.loader import render_to_string

from jsonschema.exceptions import ValidationError
from weasyprint import CSS, HTML
from weasyprint.text.fonts import FontConfiguration

from etools_prp.apps.unicef.models import Person
from etools_prp.apps.unicef.serializers import PMPPDPersonSerializer

logger = logging.getLogger(__name__)
User = get_user_model()
FIRST_NAME_MAX_LENGTH = User._meta.get_field('first_name').max_length
LAST_NAME_MAX_LENGTH = User._meta.get_field('last_name').max_length


def render_pdf_to_response(request, template, data):
    font_config = FontConfiguration()
    html_string = render_to_string(f"{template}.html", data)
    html = HTML(string=html_string)
    css = CSS(
        string=render_to_string(f"{template}.css"),
        font_config=font_config,
    )
    result = html.write_pdf(stylesheets=[css], font_config=font_config)

    with tempfile.NamedTemporaryFile(delete=True) as output:
        output.write(result)
        output.flush()
        response = FileResponse(
            open(output.name, "rb"),
            as_attachment=True,
            filename=f"{template}.pdf",
        )

    return response


def convert_string_values_to_numeric(d):
    """
    Convert numbers as strings into numeric
    "1500"->1500 "2,000.9"->2000.9  "2.5"->2.5
    :param d: dict
    """
    for k, v in d.items():
        if type(v) == str:
            d[k] = d[k].replace(',', '')
            d[k] = float(d[k]) if '.' in d[k] else int(d[k])


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
