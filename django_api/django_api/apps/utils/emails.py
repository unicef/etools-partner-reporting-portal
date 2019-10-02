import logging

from django.conf import settings
from django.template.loader import get_template
from post_office.models import EmailTemplate
from unicef_notification.models import Notification
from unicef_notification.utils import send_notification_with_template


logger = logging.getLogger(__name__)


def scrub_template_path(template_path):
    """Take full template path and generate a template name

    e.g.
    'email/notify_partner_on_calculation_method_change_subject.txt'
    ->
    'notify_partner_on_calculation_method_change_subject'
    """
    __, name_ext = template_path.rsplit("/", 1)
    name, __ = name_ext.split(".", 1)
    return name


def send_email_from_template(
        subject_template_path,
        body_template_path,
        template_data,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_email_list=(),
        fail_silently=True,
        content_subtype='plain',
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

    template_name = scrub_template_path(body_template_path)
    subject_template = get_template(subject_template_path)
    subject = subject_template.template.source.strip()
    defaults = {"subject": subject}
    message = get_template(body_template_path).template.source
    if content_subtype == "plain":
        defaults["content"] = message
    else:
        defaults["html_content"] = message

    EmailTemplate.objects.update_or_create(
        name=template_name,
        defaults=defaults,
    )
    notification = Notification(
        method_type=Notification.TYPE_EMAIL,
        sender=None,
        from_address=from_email,
        recipients=to_email_list,
        template_name=template_name,
        template_data=template_data,
    )
    notification.full_clean()
    notification.save()
    notification.send_notification()


def send_due_progress_report_email():
    """send_due_progress_report_email sends email notifications to
    UNICEF Authorized Officers and Focal Points about reports due in 1 week.
    """
    from datetime import date
    from dateutil.relativedelta import relativedelta
    from core.common import PROGRESS_REPORT_STATUS
    from unicef.models import ProgressReport

    logger.info("Notifying IP due progress reports")
    notified = list()

    today = date.today()
    unsubmitted_due_reports = ProgressReport.objects.filter(
        submission_date__isnull=True,
        status=PROGRESS_REPORT_STATUS.due,
        due_date=today + relativedelta(days=7),
    )

    for progress_report in unsubmitted_due_reports:
        pd = progress_report.programme_document

        template_data = {
            'person': None,
            'progress_report': progress_report,
            'programme_document': pd,
        }

        to_emails = set()
        to_emails |= set(map(lambda person: person, pd.unicef_officers.all()))
        to_emails |= set(map(lambda person: person, pd.unicef_focal_point.all()))

        for person in to_emails:
            send_email_from_template(
                subject_template_path='emails/due_progress_report_subject.txt',
                body_template_path='emails/due_progress_report.html',
                template_data=template_data,
                to_email_list=[person.email, ],
                content_subtype='html'
            )

        notified.append(str(progress_report.id))

    return "Sent emails for {} Due Report IDs: {}".format(len(notified), ", ".join(notified)) if notified else "---"


def send_overdue_progress_report_email():
    """send_overdue_progress_report_email sends email notifications to
    UNICEF Authorized Officers and Focal Points about overdue reports.
    """
    from core.common import PROGRESS_REPORT_STATUS
    from unicef.models import ProgressReport

    logger.info("Notifying IP overdue progress reports")
    notified = list()

    unsubmitted_overdue_reports = ProgressReport.objects.filter(
        submission_date__isnull=True,
        status=PROGRESS_REPORT_STATUS.overdue,
    )

    for progress_report in unsubmitted_overdue_reports:
        pd = progress_report.programme_document

        template_data = {
            'person': None,
            'progress_report': progress_report,
            'programme_document': pd,
        }

        to_emails = set()
        to_emails |= set(map(lambda person: person, pd.unicef_officers.all()))
        to_emails |= set(map(lambda person: person, pd.unicef_focal_point.all()))

        for person in to_emails:
            send_email_from_template(
                subject_template_path='emails/overdue_progress_report_subject.txt',
                body_template_path='emails/overdue_progress_report.html',
                template_data=template_data,
                to_email_list=[person.email, ],
                content_subtype='html'
            )

        notified.append(str(progress_report.id))

    return "Sent emails for {} Overdue Report IDs: {}".format(len(notified), ", ".join(notified)) if notified else "---"
