from django.core.mail import send_mail
from django.template.loader import get_template
from django.template import Context


def send_email_from_template(subject, template_path, template_data, from_email, to_email_list, fail_silently=True):
    send_mail(
        subject,
        get_template(template_path).render(
            Context(template_data)
        ),
        from_email,
        to_email_list,
        fail_silently=fail_silently,
    )
