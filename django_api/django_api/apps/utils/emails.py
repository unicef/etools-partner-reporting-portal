from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template


def send_email_from_template(
        subject_template_path,
        body_template_path,
        template_data,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_email_list=(),
        fail_silently=True,
        **kwargs
):
    """
    send_email_from_template simplifies Django's send_email API
    with template files to render

    Arguments:
        subject_template_path {str} -- File path to email subject template
        body_template_path {str} -- File path to email body template
        template_data {dict} -- Python dict to map template variables in both templates
        from_email {str} -- Sender e-mail address
        to_email_list {list(str)} -- List of recipient e-mail addresses

    Keyword Arguments:
        fail_silently {bool} -- A flag to mute exception if it fails (default: {True})
    """

    message = EmailMultiAlternatives(
        get_template(subject_template_path).render(template_data).strip(),
        get_template(body_template_path).render(template_data),
        from_email,
        to_email_list,
        **kwargs
    )
    message.send(fail_silently=fail_silently)
