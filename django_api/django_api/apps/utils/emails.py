from django.core.mail import send_mail
from django.template.loader import get_template
from django.template import Context


def send_email_from_template(subject_template_path, body_template_path, template_data, from_email, to_email_list, fail_silently=True):
    send_mail(
        get_template(subject_template_path).render(
            Context(template_data)
        ),
        get_template(body_template_path).render(
            Context(template_data)
        ),
        from_email,
        to_email_list,
        fail_silently=fail_silently,
    )
