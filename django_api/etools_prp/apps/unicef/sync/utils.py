import logging

from django.contrib.auth import get_user_model

from jsonschema.exceptions import ValidationError

from etools_prp.apps.unicef.models import Person, ProgressReport, ReportingPeriodDates
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


def delete_changed_periods(pd, changed_periods):
    periods_to_delete_ids = []
    pr_to_delete_ids = []

    for changed_period in changed_periods:
        # check the corresponding pd ProgressReports
        try:
            if changed_period.report_type == 'SR':
                progress_rep = pd.progress_reports.get(
                    description=changed_period.description,
                    due_date=changed_period.due_date,
                    report_type=changed_period.report_type
                )
            else:
                progress_rep = pd.progress_reports.get(
                    start_date=changed_period.start_date,
                    end_date=changed_period.end_date,
                    report_type=changed_period.report_type
                )
            # if there is any data input from the partner on the progress report
            # (including indicator reports, indicator location data)
            if progress_rep.has_partner_data:
                # log exception and skip the report in reporting_requirements
                logger.exception(f'Misaligned start and end dates for Progress Report id {progress_rep.pk} '
                                 f'with user input data. Skipping..')
            else:
                periods_to_delete_ids.append(changed_period.pk)
                pr_to_delete_ids.append(progress_rep.pk)

        except ProgressReport.DoesNotExist:
            # if no progress report found, delete ReportingPeriodDates objects
            periods_to_delete_ids.append(changed_period.pk)
            continue

    ReportingPeriodDates.objects.filter(pk__in=periods_to_delete_ids).delete()
    ProgressReport.objects.filter(pk__in=pr_to_delete_ids).delete()


def handle_reporting_dates(business_area_code, pd, reporting_reqs):
    """
    Function that handles changed start/end dates from etools reporting requirements
    1. see which are last dates (ReportingPeriodDates) that still aligned (start/end dates)
    2. get first ReportingPeriodDates that is not aligned
    3. check if there are any Progress Reports generated where the first start date is not aligned
    3.1. if there are PRs, take all PRs that are not aligned and see if there's any data input by the partner user
    3.2. if no PRs -> delete ReportingPeriodDates from the db
    3.1.1 If there's no user input data -> delete the PR's and the ReportingPeriodDates
    3.1.2 If there's user input data -> logger.exception () and skip the item in reporting_requirements
    :param business_area_code: workspace business_area_code
    :param pd: programme document
    :param reporting_reqs: the pd reporting requirements from etools API
    """
    pd_periods = pd.reporting_periods.filter(external_business_area_code=business_area_code)
    report_type_set = {req['report_type'] for req in reporting_reqs}

    # get all reporting periods that have changed
    changed_periods = []
    for report_type in report_type_set:
        filtered_reqs = list(filter(lambda x: x['report_type'] == report_type, reporting_reqs))
        if report_type == 'SR':
            existing_periods = pd_periods.filter(report_type=report_type).order_by('due_date')
            actual_periods = sorted(filtered_reqs, key=lambda x: x['due_date'])
        else:
            existing_periods = pd_periods.filter(report_type=report_type).order_by('start_date')
            actual_periods = sorted(filtered_reqs, key=lambda x: x['start_date'])

        existing_count = existing_periods.count()

        for existing, actual in zip(existing_periods, actual_periods):
            if report_type == 'QPR':
                if existing.start_date.strftime('%Y-%m-%d') != actual['start_date'] or existing.end_date.strftime('%Y-%m-%d') != actual['end_date']:
                    changed_periods.append(existing)
            elif report_type in ['HR', 'SR']:
                if existing.due_date.strftime('%Y-%m-%d') != actual['due_date']:
                    changed_periods.append(existing)

        # check if periods were removed from etools
        len_diff = existing_count - actual_periods.__len__()
        if len_diff > 0:
            for i in range(existing_count - len_diff - 1, existing_count - 1):
                changed_periods.append(existing_periods[i])

    if not changed_periods:
        return

    delete_changed_periods(pd, changed_periods)
