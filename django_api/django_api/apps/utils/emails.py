import logging
from datetime import date
from dateutil.relativedelta import relativedelta

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

from core.common import PROGRESS_REPORT_STATUS
from unicef.models import ProgressReport


logger = logging.getLogger(__name__)


def send_email_from_template(
        subject_template_path,
        body_template_path,
        template_data,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_email_list=(),
        fail_silently=True,
        content_subtype='plain',
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
        render_to_string(subject_template_path, template_data).strip(),
        render_to_string(body_template_path, template_data),
        from_email,
        to_email_list,
        **kwargs
    )
    message.content_subtype = content_subtype
    message.send(fail_silently=fail_silently)


def send_due_progress_report_email():
    """send_due_progress_report_email sends email notifications to
    UNICEF Authorized Officers and Focal Points about reports due in 1 week.
    """

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

        notified.append(progress_report.id)

    return "Sent emails for %s Due Report IDs: %s" % (len(notified), ", ".join(notified)) if notified else "---"


def send_overdue_progress_report_email(progress_report):
    """send_overdue_progress_report_email sends email notifications to
    UNICEF Authorized Officers and Focal Points about overdue reports.
    """

    logger.info("Notifying IP overdue progress reports")
    notified = list()

    unsubmitted_overdue_reports = ProgressReport.objects.filter(
        submission_date__isnull=True,
        status=PROGRESS_REPORT_STATUS.overdue,
    )

    for report in unsubmitted_overdue_reports:
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

        notified.append(report.id)

    return "Sent emails for %s Overdue Report IDs: %s" % (len(notified), ", ".join(notified)) if notified else "---"
