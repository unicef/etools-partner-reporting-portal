import random
from itertools import combinations
import datetime

from django.conf import settings

from account.models import User
from cluster.models import Cluster, ClusterObjective, ClusterActivity
from partner.models import (
    Partner,
    PartnerProject,
    PartnerActivity,
)
from indicator.models import (
    IndicatorBlueprint,
    Reportable,
    IndicatorReport,
    IndicatorLocationData,
    Disaggregation,
    DisaggregationValue,
)
from unicef.models import (
    ProgressReport,
    Section,
    ProgrammeDocument,
    CountryProgrammeOutput,
    LowerLevelOutput,
)
from core.models import (
    Intervention,
    Location,
)
from core.helpers import generate_data_combination_entries

from core.factories import (
    UserFactory,
    PartnerFactory,
    IndicatorLocationDataFactory,
    InterventionFactory,
    LocationFactory,
    ReportableToLowerLevelOutputFactory,
    IndicatorReportFactory,
    ProgressReportFactory,
    SectionFactory,
    ProgrammeDocumentFactory,
    DisaggregationFactory,
    DisaggregationValueFactory,
)


def clean_up_data():
    if settings.ENV == 'dev':
        print "Deleting all ORM objects"

        User.objects.all().delete()
        Cluster.objects.all().delete()
        ClusterObjective.objects.all().delete()
        ClusterActivity.objects.all().delete()
        Partner.objects.all().delete()
        PartnerProject.objects.all().delete()
        PartnerActivity.objects.all().delete()
        IndicatorBlueprint.objects.all().delete()
        Reportable.objects.all().delete()
        IndicatorReport.objects.all().delete()
        IndicatorLocationData.objects.all().delete()
        ProgressReport.objects.all().delete()
        ProgrammeDocument.objects.all().delete()
        CountryProgrammeOutput.objects.all().delete()
        LowerLevelOutput.objects.all().delete()
        Intervention.objects.all().delete()
        Location.objects.all().delete()
        Disaggregation.objects.all().delete()
        DisaggregationValue.objects.all().delete()

        print "All ORM objects deleted"


def generate_0_num_disagg_quantity_data(reportable):
    # IndicatorReport from ReportableToLowerLevelOutput -
    # IndicatorLocationData
    if reportable.locations.count() == 0:
        LocationFactory(reportable=reportable)

    location = reportable.locations.first()
    disagg_idx = 0

    for idx, indicator_report_from_reportable in enumerate(reportable.indicator_reports.all()):
        # 0 num_disaggregation & 0 level_reported
        disaggregation_comb_0_pairs = list(combinations(list(
            indicator_report_from_reportable.disaggregations.values_list('id', flat=True)), 0))

        for pair in disaggregation_comb_0_pairs:
            location_data = IndicatorLocationDataFactory(
                indicator_report=indicator_report_from_reportable,
                location=location,
                num_disaggregation=0,
                level_reported=0,
                disaggregation_reported_on=pair,
                disaggregation=generate_data_combination_entries(reduce(
                    lambda acc, curr: acc + curr, indicator_report_from_reportable.disaggregation_values(id_only=True, filter_by_id__in=pair)), r=0)
            )

            disagg_idx += 1


def generate_1_num_disagg_quantity_data(reportable):
    # IndicatorReport from ReportableToLowerLevelOutput -
    # IndicatorLocationData
    locations = Location.objects.all()

    for idx, indicator_report_from_reportable in enumerate(reportable.indicator_reports.all()):
        disagg_idx = 0

        # 1 num_disaggregation & 0 level_reported
        disaggregation_comb_0_pairs = list(combinations(list(
            indicator_report_from_reportable.disaggregations.values_list('id', flat=True)), 0))

        for pair in disaggregation_comb_0_pairs:
            location = locations[disagg_idx]

            location_data = IndicatorLocationDataFactory(
                indicator_report=indicator_report_from_reportable,
                location=location,
                num_disaggregation=1,
                level_reported=0,
                disaggregation_reported_on=pair,
                disaggregation=generate_data_combination_entries(reduce(
                    lambda acc, curr: acc + curr, indicator_report_from_reportable.disaggregation_values(id_only=True, filter_by_id__in=pair)), r=0)
            )

            disagg_idx += 1

        # 1 num_disaggregation & 1 level_reported
        disaggregation_comb_1_pairs = list(combinations(list(
            indicator_report_from_reportable.disaggregations.values_list('id', flat=True)), 1))

        for pair in disaggregation_comb_1_pairs:
            location = locations[disagg_idx]

            location_data = IndicatorLocationDataFactory(
                indicator_report=indicator_report_from_reportable,
                location=location,
                num_disaggregation=1,
                level_reported=1,
                disaggregation_reported_on=pair,
                disaggregation=generate_data_combination_entries(reduce(lambda acc, curr: acc + curr, indicator_report_from_reportable.disaggregation_values(id_only=True, filter_by_id__in=pair)), r=1))

            disagg_idx += 1


def generate_2_num_disagg_quantity_data(reportable):
    # IndicatorReport from ReportableToLowerLevelOutput -
    # IndicatorLocationData
    locations = Location.objects.all()

    for idx, indicator_report_from_reportable in enumerate(reportable.indicator_reports.all()):
        disagg_idx = 0

        # 2 num_disaggregation & 0 level_reported
        disaggregation_comb_0_pairs = list(combinations(list(
            indicator_report_from_reportable.disaggregations.values_list('id', flat=True)), 0))

        for pair in disaggregation_comb_0_pairs:
            location = locations[disagg_idx]

            location_data = IndicatorLocationDataFactory(
                indicator_report=indicator_report_from_reportable,
                location=location,
                num_disaggregation=2,
                level_reported=0,
                disaggregation_reported_on=pair,
                disaggregation=generate_data_combination_entries(reduce(
                    lambda acc, curr: acc + curr, indicator_report_from_reportable.disaggregation_values(id_only=True, filter_by_id__in=pair)), r=0)
            )

            disagg_idx += 1

        # 2 num_disaggregation & 1 level_reported
        disaggregation_comb_1_pairs = list(combinations(list(
            indicator_report_from_reportable.disaggregations.values_list('id', flat=True)), 1))

        for pair in disaggregation_comb_1_pairs:
            location = locations[disagg_idx]

            location_data = IndicatorLocationDataFactory(
                indicator_report=indicator_report_from_reportable,
                location=location,
                num_disaggregation=2,
                level_reported=1,
                disaggregation_reported_on=pair,
                disaggregation=generate_data_combination_entries(reduce(lambda acc, curr: acc + curr, indicator_report_from_reportable.disaggregation_values(id_only=True, filter_by_id__in=pair)), r=1))

            disagg_idx += 1

        # 2 num_disaggregation & 2 level_reported
        disaggregation_comb_2_pairs = list(combinations(list(
            indicator_report_from_reportable.disaggregations.values_list('id', flat=True)), 2))

        for pair in disaggregation_comb_2_pairs:
            location = locations[disagg_idx]

            location_data = IndicatorLocationDataFactory(
                indicator_report=indicator_report_from_reportable,
                location=location,
                num_disaggregation=2,
                level_reported=2,
                disaggregation_reported_on=pair,
                disaggregation=generate_data_combination_entries(reduce(lambda acc, curr: acc + curr, indicator_report_from_reportable.disaggregation_values(id_only=True, filter_by_id__in=pair)), r=2))

            disagg_idx += 1


def generate_3_num_disagg_quantity_data(reportable):
    # IndicatorReport from ReportableToLowerLevelOutput -
    # IndicatorLocationData
    locations = Location.objects.all()

    for idx, indicator_report_from_reportable in enumerate(reportable.indicator_reports.all()):
        disagg_idx = 0

        # 3 num_disaggregation & 0 level_reported
        disaggregation_comb_0_pairs = list(combinations(list(
            indicator_report_from_reportable.disaggregations.values_list('id', flat=True)), 0))

        for pair in disaggregation_comb_0_pairs:
            location = locations[disagg_idx]

            location_data = IndicatorLocationDataFactory(
                indicator_report=indicator_report_from_reportable,
                location=location,
                num_disaggregation=3,
                level_reported=0,
                disaggregation_reported_on=pair,
                disaggregation=generate_data_combination_entries(reduce(
                    lambda acc, curr: acc + curr, indicator_report_from_reportable.disaggregation_values(id_only=True, filter_by_id__in=pair)), r=0)
            )

            disagg_idx += 1

        # 3 num_disaggregation & 1 level_reported
        disaggregation_comb_1_pairs = list(combinations(list(
            indicator_report_from_reportable.disaggregations.values_list('id', flat=True)), 1))

        for pair in disaggregation_comb_1_pairs:
            location = locations[disagg_idx]

            location_data = IndicatorLocationDataFactory(
                indicator_report=indicator_report_from_reportable,
                location=location,
                num_disaggregation=3,
                level_reported=1,
                disaggregation_reported_on=pair,
                disaggregation=generate_data_combination_entries(reduce(lambda acc, curr: acc + curr, indicator_report_from_reportable.disaggregation_values(id_only=True, filter_by_id__in=pair)), r=1))

            disagg_idx += 1

        # 3 num_disaggregation & 2 level_reported
        disaggregation_comb_2_pairs = list(combinations(list(
            indicator_report_from_reportable.disaggregations.values_list('id', flat=True)), 2))

        for pair in disaggregation_comb_2_pairs:
            location = locations[disagg_idx]

            location_data = IndicatorLocationDataFactory(
                indicator_report=indicator_report_from_reportable,
                location=location,
                num_disaggregation=3,
                level_reported=2,
                disaggregation_reported_on=pair,
                disaggregation=generate_data_combination_entries(reduce(lambda acc, curr: acc + curr, indicator_report_from_reportable.disaggregation_values(id_only=True, filter_by_id__in=pair)), r=2))

            disagg_idx += 1

        location = locations[disagg_idx]

        # 3 num_disaggregation & 3 level_reported
        location_data = IndicatorLocationDataFactory(
            indicator_report=indicator_report_from_reportable,
            location=location,
            num_disaggregation=3,
            level_reported=3,
            disaggregation_reported_on=list(
                indicator_report_from_reportable.disaggregations.values_list('id', flat=True)),
            disaggregation=generate_data_combination_entries(reduce(
                lambda acc, curr: acc + curr, indicator_report_from_reportable.disaggregation_values(id_only=True)))
        )

        disagg_idx += 1

        # Extra IndicatorLocationData for last IndicatorReport for 3 num_disaggregation with unique location
        if idx == reportable.indicator_reports.count() - 1:
            location = locations[disagg_idx]

            location_data = IndicatorLocationDataFactory(
                indicator_report=indicator_report_from_reportable,
                location=location,
                num_disaggregation=3,
                level_reported=3,
                disaggregation_reported_on=list(
                    indicator_report_from_reportable.disaggregations.values_list('id', flat=True)),
                disaggregation=generate_data_combination_entries(reduce(
                    lambda acc, curr: acc + curr, indicator_report_from_reportable.disaggregation_values(id_only=True)))
            )


def generate_indicator_report_location_disaggregation_quantity_data():
    # Adding extra IndicatorReport to each ReportableToLowerLevelOutput
    locations = Location.objects.all()

    sample_disaggregation_value_map = {
        "height": ["tall", "medium", "short", "extrashort"],
        "age": ["1-2m", "3-4m", "5-6m", '7-10m', '11-13m', '14-16m'],
        "gender": ["male", "female", "other"],
    }

    for idx, reportable in enumerate(Reportable.objects.filter(lower_level_outputs__reportables__isnull=False)):
        # Disaggregation generation
        for disaggregation_title in ["height", "age", "gender"]:
            disaggregation = DisaggregationFactory(
                name=disaggregation_title, reportable=reportable)

            for value in sample_disaggregation_value_map[disaggregation_title]:
                disaggregation_value = DisaggregationValueFactory(
                    value=value, disaggregation=disaggregation)

            print "Disaggregation (and DisaggregationValue) objects for ReportableToLowerLevelOutput {} created".format(idx)

        # -- Extra IndicatorReport and IndicatorLocationData --
        if reportable.locations.count() != 0:
            first_reportable_location_id = reportable.locations.first().id

        else:
            first_reportable_location_id = None

        # Creating extra IndicatorReport object per each Reportable

        # ProgressReport - IndicatorReport from
        # ReportableToLowerLevelOutput
        indicator_report = IndicatorReportFactory(reportable=reportable)
        indicator_report.progress_report = reportable.indicator_reports.first().progress_report
        indicator_report.save()

        # -- IndicatorLocationData --

        # 0 num_disaggregation
        if idx % 4 == 0:
            generate_0_num_disagg_quantity_data(reportable)

        # 1 num_disaggregation
        elif idx % 4 == 1:
            generate_1_num_disagg_quantity_data(reportable)

            for location_id in list(reportable.indicator_reports.values_list('indicator_location_data__location', flat=True)):
                if not first_reportable_location_id or (first_reportable_location_id and first_reportable_location_id != location_id):
                    reportable.locations.add(Location.objects.get(id=location_id))

            reportable.save()

        # 2 num_disaggregation
        elif idx % 4 == 2:
            generate_2_num_disagg_quantity_data(reportable)

            for location_id in list(reportable.indicator_reports.values_list('indicator_location_data__location', flat=True)):
                if not first_reportable_location_id or (first_reportable_location_id and first_reportable_location_id != location_id):
                    reportable.locations.add(Location.objects.get(id=location_id))

            reportable.save()

        # 3 num_disaggregation
        elif idx % 4 == 3:
            generate_3_num_disagg_quantity_data(reportable)

            for location_id in list(reportable.indicator_reports.values_list('indicator_location_data__location', flat=True)):
                if not first_reportable_location_id or (first_reportable_location_id and first_reportable_location_id != location_id):
                    reportable.locations.add(Location.objects.get(id=location_id))

            reportable.save()

        print "IndicatorReport and its Disaggregation data entries for ReportableToLowerLevelOutput {} created".format(idx)

    # Making the rest of IndicatorReport objects not latest so that IndicatorReport objects with location data are guaranteed to show up first
    today = datetime.date.today()
    date = datetime.date(today.year - 1, today.month, today.day)

    not_latest_queryset = IndicatorReport.objects.filter(
        reportable__lower_level_outputs__reportables__isnull=False
    )

    not_latest_queryset.filter(indicator_location_data__isnull=True) \
        .update(time_period_start=date)

    not_latest_queryset.filter(
        indicator_location_data__disaggregation__isnull=True) \
        .update(time_period_start=date)


def generate_fake_data(quantity=20):
    if quantity < 20:
        quantity = 20

    admin, created = User.objects.get_or_create(username='admin', defaults={
        'email': 'admin@unicef.org',
        'is_superuser': True,
        'is_staff': True,
        'organization': 'Tivix'
    })
    admin.set_password('Passw0rd!')
    admin.save()
    print "Superuser created:{}/{}".format(admin.username, 'Passw0rd!')

    UserFactory.create_batch(quantity)
    print "{} User objects created".format(quantity)

    print "{} Partner objects created".format(quantity)

    SectionFactory.create_batch(quantity)
    print "{} Section objects created".format(quantity)

    ProgrammeDocumentFactory.create_batch(quantity)
    print "{} ProgrammeDocument objects created".format(quantity)

    # Linking the followings:
    # ProgressReport - ProgrammeDocument
    # created LowerLevelOutput - ReportableToLowerLevelOutput
    # Section - ProgrammeDocument via ReportableToLowerLevelOutput
    # ProgressReport - IndicatorReport from ReportableToLowerLevelOutput
    for idx in xrange(quantity):
        pd = ProgrammeDocument.objects.all()[idx]
        progress_report = ProgressReportFactory(programme_document=pd)

        llo = LowerLevelOutput.objects.all()[idx]
        reportable = ReportableToLowerLevelOutputFactory(
            content_object=llo, indicator_report__progress_report=None)

        reportable.content_object.indicator.programme_document.sections.add(
            Section.objects.all()[idx])

        indicator_report = reportable.indicator_reports.first()
        indicator_report.progress_report = progress_report
        indicator_report.save()

    print "{} ProgrammeDocument <-> ReportableToLowerLevelOutput <-> IndicatorReport objects linked".format(quantity)

    # Intervention creates Cluster and Locations
    InterventionFactory.create_batch(
        quantity, locations=Location.objects.all())
    print "{} Intervention objects created".format(quantity)

    # Linking ClusterActivity - PartnerActivity
    for idx in xrange(quantity):
        cluster_activity = ClusterActivity.objects.all()[idx]
        PartnerFactory(partner_activity__cluster_activity=cluster_activity)
    print "{} ClusterActivity <-> PartnerActivity objects linked".format(quantity)

    generate_indicator_report_location_disaggregation_quantity_data()

    admin.partner_id = Partner.objects.first().id
    admin.save()
