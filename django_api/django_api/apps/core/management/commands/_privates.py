#!/usr/bin/env python
# -*- coding: utf-8 -*-
# encoding: utf-8

from __future__ import unicode_literals

import calendar
import datetime
import random

import names
from django.conf import settings

from social_django.models import UserSocialAuth

from account.models import (
    User,
    UserProfile,
)
from cluster.models import (
    Cluster,
    ClusterObjective,
    ClusterActivity,
)
from core.models import (
    PartnerAuthorizedOfficerRole,
    PartnerEditorRole,
    PartnerViewerRole,
    IMORole
)
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
    ReportableLocationGoal,
    ReportingEntity,
)
from unicef.models import (
    Section,
    ProgrammeDocument,
    ProgressReport,
    PDResultLink,
    LowerLevelOutput,
    Person,
    ReportingPeriodDates,
)
from core.models import (
    Workspace,
    ResponsePlan,
    Location,
    GatewayType,
    CartoDBTable,
    Country,
)
from core.factories import (
    QuantityReportableToLowerLevelOutputFactory,
    RatioReportableToLowerLevelOutputFactory,
    QuantityReportableToPartnerProjectFactory,
    QuantityReportableToClusterObjectiveFactory,
    RatioReportableToClusterObjectiveFactory,
    QuantityReportableToPartnerActivityFactory,
    QuantityReportableToClusterActivityFactory,
    QuantityIndicatorReportFactory,
    LocationWithReportableLocationGoalFactory,
    RatioIndicatorReportFactory,
    UserFactory,
    ClusterFactory,
    ClusterObjectiveFactory,
    ClusterActivityFactory,
    PartnerFactory,
    PartnerProjectFactory,
    PartnerActivityFactory,
    SectionFactory,
    ProgrammeDocumentFactory,
    ProgressReportFactory,
    WorkspaceFactory,
    LocationFactory,
    PersonFactory,
    GatewayTypeFactory,
    CartoDBTableFactory,
    CountryFactory,
    ReportingPeriodDatesFactory,
)
from core.common import (
    INDICATOR_REPORT_STATUS,
    OVERALL_STATUS,
    REPORTING_TYPES,
    PD_STATUS,
    REPORTABLE_FREQUENCY_LEVEL,
)
from core.countries import COUNTRIES_ALPHA2_CODE

from ._generate_disaggregation_fake_data import (
    generate_indicator_report_location_disaggregation_quantity_data,
    generate_indicator_report_location_disaggregation_ratio_data,
)

from core.tasks import process_workspaces, process_period_reports
from indicator.tasks import process_due_reports
from partner.tasks import process_partners
from unicef.tasks import process_programme_documents

from utils.helpers import generate_random_character_sequence

OVERALL_STATUS_LIST = [x[0] for x in OVERALL_STATUS]
REPORTING_TYPE_LIST_WITHOUT_SR = [x[0] for x in REPORTING_TYPES if x != 'SR']


def clean_up_data():
    if settings.ENV == 'dev':
        print("Deleting all ORM objects")

        User.objects.all().delete()
        UserProfile.objects.all().delete()
        ClusterActivity.objects.all().delete()
        ClusterObjective.objects.all().delete()
        Cluster.objects.all().delete()
        Partner.objects.all().delete()
        PartnerProject.objects.all().delete()
        PartnerActivity.objects.all().delete()
        IndicatorBlueprint.objects.all().delete()
        Reportable.objects.all().delete()
        ReportingPeriodDates.objects.all().delete()
        IndicatorReport.objects.all().delete()
        IndicatorLocationData.objects.all().delete()
        Disaggregation.objects.all().delete()
        DisaggregationValue.objects.all().delete()
        ReportableLocationGoal.objects.all().delete()
        Section.objects.all().delete()
        ProgrammeDocument.objects.all().delete()
        ProgressReport.objects.all().delete()
        PDResultLink.objects.all().delete()
        LowerLevelOutput.objects.all().delete()
        Workspace.objects.all().delete()
        ResponsePlan.objects.all().delete()
        Location.objects.filter(title__icontains="location_").delete()
        GatewayType.objects.filter(name__icontains="gateway_type_").delete()
        CartoDBTable.objects.filter(domain__icontains="domain_").delete()
        Person.objects.filter(name__icontains="Person_").delete()
        UserSocialAuth.objects.all().delete()
        print("All ORM objects deleted")


def generate_fake_users():
    users_to_create = [
        ('admin_imo', 'admin_imo@notanemail.com', IMORole),
        ('admin_ao', 'admin_ao@notanemail.com', PartnerAuthorizedOfficerRole),
        ('admin_pe', 'admin_pe@notanemail.com', PartnerEditorRole),
        ('admin_pv', 'admin_pv@notanemail.com', PartnerViewerRole),
    ]
    users_created = []
    for username, email, group_wrapper in users_to_create:
        admin, _ = User.objects.get_or_create(username=username, defaults={
            'email': email,
            'is_superuser': True,
            'is_staff': True,
            'first_name': names.get_first_name(),
            'last_name': names.get_last_name(),
        })
        admin.set_password('Passw0rd!')
        admin.save()
        admin.groups.add(group_wrapper.as_group())
        users_created.append(admin)

    return users_created


def generate_real_data(fast=False, area=None, update=False):
    if not update:
        generate_fake_users()

        # Generate workspaces
        process_workspaces()

        # Generate partners
        process_partners(area)

    # Generate programme documents
    process_programme_documents(fast, area)

    # Generate reports
    generate_reports()


def generate_reports():
    # Generate PR/IR
    process_period_reports()

    # Generate due/overdue reports
    process_due_reports()


def generate_fake_data(workspace_quantity=10, generate_all_disagg=False):
    if not settings.IS_TEST and workspace_quantity < 1:
        workspace_quantity = 1
        print('Workspace quantity reset to {}'.format(workspace_quantity))

    if workspace_quantity >= 5:
        workspace_quantity = 5
        print('Workspace quantity reset to {}'.format(workspace_quantity))

    today = datetime.date.today()

    users_created = generate_fake_users()

    print("Users created: {}/{}\n".format(users_created, 'Passw0rd!'))

    SectionFactory.create_batch(workspace_quantity)
    print("{} Section objects created".format(workspace_quantity))

    CountryFactory.create_batch(workspace_quantity)
    print("{} Country objects created".format(workspace_quantity))

    unicef_re = ReportingEntity.objects.get(title="UNICEF")
    cluster_re = ReportingEntity.objects.get(title="Cluster")

    ws_list = list()

    for i in random.sample(range(0, len(COUNTRIES_ALPHA2_CODE) - 1), workspace_quantity):
        ws = WorkspaceFactory(
            title=COUNTRIES_ALPHA2_CODE[i][1],
            workspace_code=COUNTRIES_ALPHA2_CODE[i][0]
        )
        ws_list.append(ws)

        print("{} Workspace created".format(ws))

    beginning_of_this_year = datetime.date(today.year, 1, 1)
    end_of_this_year = datetime.date(today.year, 12, 31)

    for workspace in ws_list:
        country = Country.objects.order_by('?').first()
        workspace.countries.add(country)
        for idx in range(0, 2):
            year = today.year - idx
            # TODO: use ResponsePlanFactory
            ResponsePlan.objects.create(
                workspace=workspace,
                title="{} {} HR".format(
                    workspace.title, year),
                start=beginning_of_this_year,
                end=end_of_this_year
            )

        gateways = list()
        for idx in range(5):
            gateways.append(
                GatewayTypeFactory(
                    country=country,
                    admin_level=idx + 1))

        carto_db_table = CartoDBTableFactory(
            location_type=gateways[0], country=country)

        locations = list()
        for idx in range(12):
            locations.append(
                LocationFactory.create(
                    gateway=gateways[idx] if idx < 5 else gateways[4],
                    parent=None if idx == 0 else (
                        locations[idx - 1] if idx < 6 else locations[4]),
                    carto_db_table=carto_db_table,
                    p_code=generate_random_character_sequence() + "-" + str(idx)
                )
            )

        print("{} ResponsePlan objects created for {}".format(3, workspace))

    for response_plan in ResponsePlan.objects.all():
        country = response_plan.workspace.countries.first()
        locations = list(Location.objects.filter(gateway__country=country))

        UserFactory(
            first_name="WASH",
            last_name="IMO"
        )

        cluster = ClusterFactory(
            response_plan=response_plan,
            type="wash"
        )

        co = ClusterObjectiveFactory(
            title="{} - {} - {} CO".format(
                idx, cluster.response_plan.title, cluster.type.upper()),
            cluster=cluster,
        )

        if random.randint(0, 1) == 0:
            reportable = RatioReportableToClusterObjectiveFactory(
                content_object=co,
                indicator_report__progress_report=None,
                indicator_report__reporting_entity=cluster_re,
            )
        else:
            reportable = QuantityReportableToClusterObjectiveFactory(
                content_object=co,
                indicator_report__progress_report=None,
                indicator_report__reporting_entity=cluster_re,
            )

        for loc in locations:
            LocationWithReportableLocationGoalFactory.create(
                location=loc,
                reportable=reportable
            )

        user = UserFactory(
            first_name="{} Cluster".format(cluster.type.upper()[:20]),
            last_name="Partner")

        partner = PartnerFactory(
            title="{} - {} Cluster Partner".format(
                cluster.response_plan.title, cluster.type.upper()),
            partner_activity=None,
            partner_project=None,
            user=user,
        )
        partner.clusters.add(cluster)

        print(
            "{} Cluster & Cluster user objects created for {}".format(
                1, response_plan.title))

        print(
            "{} Partner objects & Partner user objects created for {}".format(
                1,
                cluster))

        print(
            "{} Cluster Objective objects created for {}".format(
                1, cluster))

    table = CartoDBTable.objects.first()
    locations = list(
        Location.objects.filter(
            carto_db_table=table,
            carto_db_table__country=carto_db_table.country))

    # associate partner, workspace, imo_clustes etc. with the users
    first_partner = Partner.objects.first()
    for u in users_created:
        for w in Workspace.objects.all():
            u.workspaces.add(w)
        if not u.groups.filter(name=IMORole.as_group().name):
            u.partner = first_partner
        else:
            u.organization = 'UNICEF Cluster Team'
            u.imo_clusters = Cluster.objects.all().order_by('?')[:2]
        u.save()

    for cluster_objective in ClusterObjective.objects.all():
        for idx in range(2, 0, -1):
            ca = ClusterActivityFactory(
                title="{} CA".format(cluster_objective.title),
                cluster_objective=cluster_objective,
            )

            reportable = QuantityReportableToClusterActivityFactory(
                content_object=ca,
                indicator_report__progress_report=None,
                indicator_report__reporting_entity=cluster_re,
            )

            for loc in locations:
                LocationWithReportableLocationGoalFactory.create(
                    location=loc,
                    reportable=reportable
                )

        print(
            "{} Cluster Activity objects created for {}".format(
                2, cluster_objective.title))

    for partner in Partner.objects.all():
        first_cluster = partner.clusters.first()
        pp = PartnerProjectFactory(
            partner=partner,
            title="{} PP".format(partner.title)
        )

        pp.clusters.add(first_cluster)

        reportable = QuantityReportableToPartnerProjectFactory(
            content_object=pp,
            indicator_report__progress_report=None,
            indicator_report__reporting_entity=cluster_re,
        )

        for loc in locations:
            LocationWithReportableLocationGoalFactory.create(
                location=loc,
                reportable=reportable
            )

        print(
            "{} PartnerProject objects created for {} under {} Cluster".format(
                1, partner, first_cluster.type.upper()))

    # ClusterActivity <-> PartnerActivity link
    for cluster_activity in ClusterActivity.objects.all():
        partner = cluster_activity.cluster_objective.cluster.partners.first()

        for project in partner.partner_projects.all():
            pa = PartnerActivityFactory(
                partner=project.partner,
                project=project,
                cluster_activity=cluster_activity,
                title="{} Partner Activity from CA".format(project.title)
            )

            reportable_to_pa = QuantityReportableToPartnerActivityFactory(
                content_object=pa,
                indicator_report__progress_report=None,
                indicator_report__reporting_entity=cluster_re,
            )
            reportable_to_pa.parent_indicator = cluster_activity.reportables.first()
            reportable_to_pa.save()

            for loc in locations:
                LocationWithReportableLocationGoalFactory.create(
                    location=loc,
                    reportable=reportable_to_pa
                )

            pa = PartnerActivityFactory(
                partner=project.partner,
                project=project,
                cluster_activity=None,
                cluster_objective=cluster_activity.cluster_objective,
                title="{} Partner Activity".format(project.title)
            )

            reportable_to_pa = QuantityReportableToPartnerActivityFactory(
                content_object=pa,
                indicator_report__progress_report=None,
                indicator_report__reporting_entity=cluster_re,
            )

            for loc in locations:
                LocationWithReportableLocationGoalFactory.create(
                    location=loc,
                    reportable=reportable_to_pa
                )

            print(
                "{} PartnerActivity objects created for {} under {} Cluster Activity and Custom Activity".format(
                    2,
                    partner,
                    cluster_activity.title))

    print("ClusterActivity <-> PartnerActivity objects linked")

    PersonFactory.create_batch(workspace_quantity)
    # only create PD's for the partner being used above
    programme_documents = []
    for workspace in Workspace.objects.all():
        for i in range(workspace_quantity * 2):
            pd = ProgrammeDocumentFactory.create(partner=first_partner, workspace=workspace)
            programme_documents.append(pd)

            now = datetime.datetime.now()

            # HRs
            for month in range(1, 13):
                monthrange = calendar.monthrange(now.year, month)

                ReportingPeriodDatesFactory(
                    programme_document=pd,
                    report_type="HR",
                    start_date=datetime.datetime(now.year, month, 1),
                    end_date=datetime.datetime(now.year, month, monthrange[1]),
                    due_date=datetime.datetime(now.year, month, monthrange[1]),
                )

            # Q1
            ReportingPeriodDatesFactory(
                programme_document=pd,
                report_type="QPR",
                start_date=datetime.datetime(now.year, 1, 1),
                end_date=datetime.datetime(now.year, 3, 31),
                due_date=datetime.datetime(now.year, 3, 31),
            )

            # Q2
            ReportingPeriodDatesFactory(
                programme_document=pd,
                report_type="QPR",
                start_date=datetime.datetime(now.year, 4, 1),
                end_date=datetime.datetime(now.year, 6, 30),
                due_date=datetime.datetime(now.year, 6, 30),
            )

            # Q3
            ReportingPeriodDatesFactory(
                programme_document=pd,
                report_type="QPR",
                start_date=datetime.datetime(now.year, 7, 1),
                end_date=datetime.datetime(now.year, 9, 30),
                due_date=datetime.datetime(now.year, 9, 30),
            )

            # Q4
            ReportingPeriodDatesFactory(
                programme_document=pd,
                report_type="QPR",
                start_date=datetime.datetime(now.year, 10, 1),
                end_date=datetime.datetime(now.year, 12, 31),
                due_date=datetime.datetime(now.year, 12, 31),
            )

    print("{} ProgrammeDocument objects created".format(min(2, workspace_quantity * 2)))

    # Linking the followings:
    # ProgressReport - ProgrammeDocument
    # created LowerLevelOutput - QuantityReportableToLowerLevelOutput
    # Section - ProgrammeDocument via QuantityReportableToLowerLevelOutput
    # ProgressReport - IndicatorReport from
    # QuantityReportableToLowerLevelOutput
    for idx, pd in enumerate(programme_documents):
        locations = pd.workspace.locations

        # Only mark first 2 ProgrammeDocuments to be HF indicator
        is_unicef_hf_indicator = idx == 0 or idx == 1

        if is_unicef_hf_indicator:
            pd.status = PD_STATUS.active
            pd.save()

        pd.sections.add(Section.objects.order_by('?').first())
        pd.unicef_focal_point.add(Person.objects.order_by('?').first())
        pd.partner_focal_point.add(Person.objects.order_by('?').first())
        pd.unicef_officers.add(Person.objects.order_by('?').first())

        # generate reportables for this PD
        for cp_idx, cp_output in enumerate(pd.cp_outputs.all()):
            for llo_idx, llo in enumerate(cp_output.ll_outputs.all()):
                first_llo_indicator_flag = idx == 0 and cp_idx == 0 and llo_idx == 0

                # Make the first LLO from first ProgrammeDocument
                # to be dual reporting enabled
                if first_llo_indicator_flag:
                    cluster_activity_reportable = Reportable.objects.filter(
                        cluster_activities__partner_activities__partner=pd.partner
                    ).first()

                else:
                    cluster_activity_reportable = None

                # generate 2 reportable (indicators) per llo
                num_reportables_range = range(2)
                for i in num_reportables_range:
                    if i % 2 != 0:
                        reportable = QuantityReportableToLowerLevelOutputFactory(
                            content_object=llo,
                            indicator_report__progress_report=None,
                            indicator_report__reporting_entity=unicef_re,
                            is_unicef_hf_indicator=is_unicef_hf_indicator,
                            ca_indicator_used_by_reporting_entity=cluster_activity_reportable,
                        )
                    elif i % 2 == 0 and not first_llo_indicator_flag:
                        reportable = RatioReportableToLowerLevelOutputFactory(
                            content_object=llo,
                            indicator_report__progress_report=None,
                            indicator_report__reporting_entity=unicef_re,
                            is_unicef_hf_indicator=is_unicef_hf_indicator,
                            ca_indicator_used_by_reporting_entity=cluster_activity_reportable,
                        )

                    # delete the junk indicator report the factory creates
                    # we create IR's in the next for loop down below
                    reportable.indicator_reports.all().delete()

                    for loc in locations:
                        LocationWithReportableLocationGoalFactory.create(
                            location=loc,
                            reportable=reportable
                        )

                print("{} Reportables generated for {}".format(
                    num_reportables_range[-1] + 1,
                    llo
                ))

        # Generate progress reports per pd based on its reporting period dates. Requires creating indicator
        # reports for each llo and then associating them with a progress report
        def generate_initial_progress_reports(report_type):
            rpd_queryset = pd.reporting_periods.filter(report_type=report_type)

            for rpd_idx, rpd in enumerate(rpd_queryset):
                print("Generating ProgressReport: ", rpd.report_type, rpd.start_date, rpd.end_date, rpd.due_date)

                progress_report = ProgressReportFactory(
                    programme_document=pd,
                    report_type=report_type,
                    report_number=rpd_idx + 1,
                    start_date=rpd.start_date,
                    end_date=rpd.end_date,
                    due_date=rpd.due_date,
                )

                if rpd_idx == rpd_queryset.count() - 1:
                    progress_report.is_final = True
                    progress_report.save()

                for cp_output in pd.cp_outputs.all():
                    for llo in cp_output.ll_outputs.all():
                        # All Indicator Reports inside LLO should have same status
                        # We should skip "No status"
                        status = "NoS"
                        queryset = llo.reportables.all()

                        if report_type == "HR":
                            queryset = queryset.filter(is_unicef_hf_indicator=True)

                        for reportable in queryset:
                            if reportable.blueprint.unit == IndicatorBlueprint.NUMBER:
                                QuantityIndicatorReportFactory(
                                    reportable=reportable,
                                    progress_report=progress_report,
                                    overall_status=status,
                                    time_period_start=rpd.start_date,
                                    time_period_end=rpd.end_date,
                                    due_date=rpd.due_date,
                                    reporting_entity=unicef_re,
                                )
                            elif reportable.blueprint.unit == IndicatorBlueprint.PERCENTAGE:
                                RatioIndicatorReportFactory(
                                    reportable=reportable,
                                    progress_report=progress_report,
                                    overall_status=status,
                                    time_period_start=rpd.start_date,
                                    time_period_end=rpd.end_date,
                                    due_date=rpd.due_date,
                                    reporting_entity=unicef_re,
                                )

        # QPR generation
        generate_initial_progress_reports("QPR")

        if is_unicef_hf_indicator:
            # HR generation
            generate_initial_progress_reports("HR")

        print("{} Progress Reports generated for {}".format(
            ProgressReport.objects.filter(programme_document=pd).count(),
            pd
        ))

    cai_llo_queryset = Reportable.objects.filter(
        content_type__model="lowerleveloutput",
        ca_indicator_used_by_reporting_entity__isnull=False,
    )

    for indicator in cai_llo_queryset:
        indicator.blueprint = indicator.ca_indicator_used_by_reporting_entity.blueprint
        indicator.save()

        partner_activity = PartnerActivity.objects.filter(
            cluster_activity=indicator.ca_indicator_used_by_reporting_entity.content_object,
            partner=indicator.content_object.cp_output.programme_document.partner,
        ).first()

        # Copy-paste from unicef/tasks.py
        # Force update on PA Reportable instance for location update
        for pa_reportable in partner_activity.reportables.all():
            pa_reportable.frequency = REPORTABLE_FREQUENCY_LEVEL.monthly
            pa_reportable.save()

            llo_locations = indicator.locations.values_list('id', flat=True)
            pai_locations = pa_reportable.locations.values_list('id', flat=True)
            loc_diff = pai_locations.exclude(id__in=llo_locations)

            # Add new locations from LLO Reportable to PA Reportable
            if loc_diff.exists():
                # Creating M2M Through model instances
                reportable_location_goals = [
                    ReportableLocationGoal(
                        reportable=indicator,
                        location=l,
                    ) for l in loc_diff
                ]

                ReportableLocationGoal.objects.bulk_create(reportable_location_goals)

    print("ProgrammeDocument <-> QuantityReportableToLowerLevelOutput <-> IndicatorReport objects linked")

    print("Generating IndicatorLocationData for Quantity type")
    generate_indicator_report_location_disaggregation_quantity_data(generate_all=generate_all_disagg)

    print("Generating IndicatorLocationData for Ratio type")
    generate_indicator_report_location_disaggregation_ratio_data(generate_all=generate_all_disagg)

    # Disaggregation association fix for CAI LLO indicators
    for indicator in cai_llo_queryset:
        ca_reportable = indicator.ca_indicator_used_by_reporting_entity
        indicator.disaggregations.clear()
        indicator.disaggregations.add(*ca_reportable.disaggregations.all())

    # Fulfill submission date for closed IR
    IndicatorReport.objects.filter(
        report_status__in=(
            INDICATOR_REPORT_STATUS.submitted,
            INDICATOR_REPORT_STATUS.accepted)
    ).update(submission_date=today)
    # Null submission date for open IR
    IndicatorReport.objects.exclude(
        report_status__in=(
            INDICATOR_REPORT_STATUS.submitted,
            INDICATOR_REPORT_STATUS.accepted)
    ).update(submission_date=None)
