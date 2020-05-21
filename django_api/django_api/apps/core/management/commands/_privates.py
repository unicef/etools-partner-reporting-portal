#!/usr/bin/env python
# -*- coding: utf-8 -*-
# encoding: utf-8

from __future__ import unicode_literals

import calendar
import datetime
import random

from django.conf import settings

from account.models import User, UserProfile
from cluster.models import Cluster, ClusterActivity, ClusterObjective
from core.common import (
    INDICATOR_REPORT_STATUS,
    OVERALL_STATUS,
    PD_STATUS,
    PRP_ROLE_TYPES,
    REPORTABLE_FREQUENCY_LEVEL,
    REPORTING_TYPES,
)
from core.countries import COUNTRIES_ALPHA2_CODE
from core.models import CartoDBTable, Country, GatewayType, Location, PRPRole, ResponsePlan, Workspace
from core.tasks import process_period_reports, process_workspaces
from core.tests import factories
from indicator.models import (
    Disaggregation,
    DisaggregationValue,
    IndicatorBlueprint,
    IndicatorLocationData,
    IndicatorReport,
    Reportable,
    ReportableLocationGoal,
    ReportingEntity,
)
from indicator.tasks import process_due_reports
from partner.models import Partner, PartnerActivity, PartnerProject
from partner.tasks import process_partners
from social_django.models import UserSocialAuth
from unicef.models import (
    LowerLevelOutput,
    PDResultLink,
    Person,
    ProgrammeDocument,
    ProgressReport,
    ReportingPeriodDates,
    Section,
)
from unicef.tasks import process_programme_documents
from utils.helpers import generate_random_character_sequence

# from ._generate_disaggregation_fake_data import (
#     generate_indicator_report_location_disaggregation_quantity_data,
#     generate_indicator_report_location_disaggregation_ratio_data,
# )

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
        Country.objects.all().delete()
        ResponsePlan.objects.all().delete()
        Location.objects.filter(title__icontains="location_").delete()
        GatewayType.objects.filter(name__icontains="gateway_type_").delete()
        CartoDBTable.objects.filter(domain__icontains="domain_").delete()
        Person.objects.filter(name__icontains="Person_").delete()
        UserSocialAuth.objects.all().delete()
        PRPRole.objects.all().delete()
        print("All ORM objects deleted")


def generate_real_data(fast=False, area=None, update=False):
    if not update:
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
    admin_password = 'Passw0rd!'

    # Cluster admin creation
    sys_admin, _ = User.objects.get_or_create(username='cluster_admin', defaults={
        'email': 'cluster_admin@example.com',
        'is_superuser': True,
        'is_staff': True,
        'first_name': 'Cluster',
        'last_name': 'Admin',
    })
    sys_admin.set_password(admin_password)
    sys_admin.save()

    # Give Cluster admin role to cluster_admin User
    factories.ClusterPRPRoleFactory(
        user=sys_admin,
        role=PRP_ROLE_TYPES.cluster_system_admin,
        workspace=None,
        cluster=None,
    )

    factories.SectionFactory.create_batch(workspace_quantity)
    print("{} Section objects created".format(workspace_quantity))

    unicef_re = factories.ReportingEntityFactory(title="UNICEF")
    # cluster_re = ReportingEntity.objects.get(title="Cluster")

    ws_list = list()

    for i in random.sample(range(0, len(COUNTRIES_ALPHA2_CODE) - 1), workspace_quantity):
        ws = factories.WorkspaceFactory(
            title=COUNTRIES_ALPHA2_CODE[i][1],
            workspace_code=COUNTRIES_ALPHA2_CODE[i][0]
        )
        ws_list.append(ws)

        print("{} Workspace created".format(ws))

    beginning_of_this_year = datetime.date(today.year, 1, 1)
    end_of_this_year = datetime.date(today.year, 12, 31)

    for workspace in ws_list:
        country = factories.CountryFactory(
            country_short_code=workspace.workspace_code,
            name=workspace.title,
        )
        workspace.countries.add(country)

        for idx in range(0, 2):
            year = today.year - idx

            # Using direct ORM due to M2M factory to clusters
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
                factories.GatewayTypeFactory(
                    country=country,
                    admin_level=idx + 1))

        carto_db_table = factories.CartoDBTableFactory(
            location_type=gateways[0], country=country)

        locations = list()
        for idx in range(12):
            locations.append(
                factories.LocationFactory.create(
                    gateway=gateways[idx] if idx < 5 else gateways[4],
                    parent=None if idx == 0 else (
                        locations[idx - 1] if idx < 6 else locations[4]),
                    carto_db_table=carto_db_table,
                    p_code=generate_random_character_sequence() + "-" + str(idx)
                )
            )

        print("{} ResponsePlan objects created for {}".format(3, workspace))

    # Cluster IMO creation
    imo, _ = User.objects.get_or_create(username='cluster_imo', defaults={
        'email': 'cluster_imo@example.com',
        'is_superuser': True,
        'is_staff': True,
        'first_name': 'Cluster',
        'last_name': 'IMO',
    })
    imo.set_password(admin_password)
    imo.save()

    for response_plan in ResponsePlan.objects.all():
        country = response_plan.workspace.countries.first()
        locations = list(
            Location.objects.filter(
                gateway__country=country,
                gateway__admin_level=5,
            )
        )

        cluster = factories.ClusterFactory(
            response_plan=response_plan,
            type="wash"
        )

        # Give Cluster IMO role in this cluster to cluster_admin User
        factories.ClusterPRPRoleFactory(
            user=imo,
            role=PRP_ROLE_TYPES.cluster_imo,
            workspace=response_plan.workspace,
            cluster=cluster,
        )

        co = factories.ClusterObjectiveFactory(
            title="{} - {} - {} CO".format(
                idx, cluster.response_plan.title, cluster.type.upper()),
            cluster=cluster,
        )

        if random.randint(0, 1) == 0:
            reportable = factories.RatioReportableToClusterObjectiveFactory(
                content_object=co,
                # indicator_report__progress_report=None,
                # indicator_report__reporting_entity=cluster_re,
            )
        else:
            reportable = factories.QuantityReportableToClusterObjectiveFactory(
                content_object=co,
                # indicator_report__progress_report=None,
                # indicator_report__reporting_entity=cluster_re,
            )

        for loc in locations[:2]:
            factories.LocationWithReportableLocationGoalFactory.create(
                location=loc,
                reportable=reportable
            )

        for loc in locations[-2:-1:-1]:
            factories.LocationWithReportableLocationGoalFactory.create(
                location=loc,
                reportable=reportable
            )

        partner = factories.PartnerFactory(
            title="{} - {} Cluster Partner".format(
                cluster.response_plan.title, cluster.type.upper())[:50],
            # partner_activity=None,
            # partner_project=None,
        )
        partner.clusters.add(cluster)

        print(
            "{} Cluster objects created for {}".format(
                1, response_plan.title))

        print(
            "{} Partner objects objects created for {}".format(
                1,
                cluster))

        print(
            "{} Cluster Objective objects created for {}".format(
                1, cluster))

    table = CartoDBTable.objects.first()
    locations = list(
        Location.objects.filter(
            carto_db_table=table,
            gateway__country=carto_db_table.country,
            gateway__admin_level=5
        )
    )

    # Associate partner, role, workspace with the partner users
    first_partner = Partner.objects.first()
    partner_users = list()

    # Partner AO creation
    ao, _ = User.objects.get_or_create(username='partner_ao', defaults={
        'email': 'partner_ao@example.com',
        'is_superuser': True,
        'is_staff': True,
        'first_name': 'Partner',
        'last_name': 'AO',
    })
    ao.set_password(admin_password)
    ao.save()
    partner_users.append(ao)

    # Partner Editor creation
    editor, _ = User.objects.get_or_create(username='partner_editor', defaults={
        'email': 'partner_editor@example.com',
        'is_superuser': True,
        'is_staff': True,
        'first_name': 'Partner',
        'last_name': 'Editor',
    })
    editor.set_password(admin_password)
    editor.save()
    partner_users.append(editor)

    # Partner Viewer creation
    viewer, _ = User.objects.get_or_create(username='partner_viewer', defaults={
        'email': 'partner_viewer@example.com',
        'is_superuser': True,
        'is_staff': True,
        'first_name': 'Partner',
        'last_name': 'Viewer',
    })
    viewer.set_password(admin_password)
    viewer.save()
    partner_users.append(viewer)

    # Partner Admin creation
    admin, _ = User.objects.get_or_create(username='partner_admin', defaults={
        'email': 'partner_admin@example.com',
        'is_superuser': True,
        'is_staff': True,
        'first_name': 'Partner',
        'last_name': 'Admin',
    })
    admin.set_password(admin_password)
    admin.save()
    partner_users.append(admin)

    # Give Cluster IMO role in this cluster to cluster_admin User
    factories.ClusterPRPRoleFactory(
        user=imo,
        role=PRP_ROLE_TYPES.cluster_imo,
        workspace=None,
        cluster=None,
    )

    for u in partner_users:
        partner_cluster = first_partner.clusters.first()
        workspace = partner_cluster.response_plan.workspace

        u.partner = first_partner
        u.save()

        if 'ao' in u.username:
            role = PRP_ROLE_TYPES.ip_authorized_officer

        elif 'editor' in u.username:
            role = PRP_ROLE_TYPES.ip_editor

        elif 'viewer' in u.username:
            role = PRP_ROLE_TYPES.ip_viewer

        elif 'admin' in u.username:
            role = PRP_ROLE_TYPES.ip_admin

        factories.ClusterPRPRoleFactory(
            user=u,
            role=role,
            workspace=workspace,
            cluster=None,
        )

    for cluster_objective in ClusterObjective.objects.all():
        for idx in range(2, 0, -1):
            ca = factories.ClusterActivityFactory(
                title="{} CA".format(cluster_objective.title),
                cluster_objective=cluster_objective,
            )

            reportable = factories.QuantityReportableToClusterActivityFactory(
                content_object=ca,
                # indicator_report__progress_report=None,
                # indicator_report__reporting_entity=cluster_re,
            )

            for loc in locations[:2]:
                factories.LocationWithReportableLocationGoalFactory.create(
                    location=loc,
                    reportable=reportable
                )

            for loc in locations[-2:-1:-1]:
                factories.LocationWithReportableLocationGoalFactory.create(
                    location=loc,
                    reportable=reportable
                )

        print(
            "{} Cluster Activity objects created for {}".format(
                2, cluster_objective.title))

    for partner in Partner.objects.all():
        first_cluster = partner.clusters.first()
        pp = factories.PartnerProjectFactory(
            partner=partner,
            title="{} PP".format(partner.title)
        )

        pp.clusters.add(first_cluster)

        reportable = factories.QuantityReportableToPartnerProjectFactory(
            content_object=pp,
            # indicator_report__progress_report=None,
            # indicator_report__reporting_entity=cluster_re,
        )

        for loc in locations[:2]:
            factories.LocationWithReportableLocationGoalFactory.create(
                location=loc,
                reportable=reportable
            )

        for loc in locations[-2:-1:-1]:
            factories.LocationWithReportableLocationGoalFactory.create(
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
            pa = factories.ClusterActivityPartnerActivityFactory(
                partner=project.partner,
                # project=project,
                cluster_activity=cluster_activity,
                title="{} Partner Activity from CA".format(project.title)
            )

            papc = factories.PartnerActivityProjectContextFactory(
                activity=pa,
                project=project,
                start_date=project.start_date,
                end_date=project.end_date
            )

            reportable_to_pa = factories.QuantityReportableToPartnerActivityProjectContextFactory(
                content_object=papc,
                # indicator_report__progress_report=None,
                # indicator_report__reporting_entity=cluster_re,
            )
            reportable_to_pa.parent_indicator = cluster_activity.reportables.first()
            reportable_to_pa.save()

            for loc in locations[:2]:
                factories.LocationWithReportableLocationGoalFactory.create(
                    location=loc,
                    reportable=reportable_to_pa
                )

            for loc in locations[-2:-1:-1]:
                factories.LocationWithReportableLocationGoalFactory.create(
                    location=loc,
                    reportable=reportable_to_pa
                )

            pa = factories.ClusterActivityPartnerActivityFactory(
                partner=project.partner,
                # project=project,
                cluster_activity=None,
                cluster_objective=cluster_activity.cluster_objective,
                title="{} Partner Activity".format(project.title)
            )

            papc = factories.PartnerActivityProjectContextFactory(
                activity=pa,
                project=project,
                start_date=project.start_date,
                end_date=project.end_date
            )

            reportable_to_pa = factories.QuantityReportableToPartnerActivityProjectContextFactory(
                content_object=papc,
                # indicator_report__progress_report=None,
                # indicator_report__reporting_entity=cluster_re,
            )

            for loc in locations[:2]:
                factories.LocationWithReportableLocationGoalFactory.create(
                    location=loc,
                    reportable=reportable_to_pa
                )

            for loc in locations[-2:-1:-1]:
                factories.LocationWithReportableLocationGoalFactory.create(
                    location=loc,
                    reportable=reportable_to_pa
                )

            print(
                "{} PartnerActivity objects created for {} under {} Cluster Activity and Custom Activity".format(
                    2,
                    partner,
                    cluster_activity.title))

    print("ClusterActivity <-> PartnerActivity objects linked")

    factories.PersonFactory.create_batch(workspace_quantity)
    # only create PD's for the partner being used above
    programme_documents = []
    for workspace in Workspace.objects.all():
        for i in range(workspace_quantity * 2):
            pd = factories.ProgrammeDocumentFactory.create(partner=first_partner, workspace=workspace)
            programme_documents.append(pd)

            now = datetime.datetime.now()

            # HRs
            for month in range(1, 13):
                monthrange = calendar.monthrange(now.year, month)

                factories.HRReportingPeriodDatesFactory(
                    programme_document=pd,
                    start_date=datetime.datetime(now.year, month, 1),
                    end_date=datetime.datetime(now.year, month, monthrange[1]),
                    due_date=datetime.datetime(now.year, month, monthrange[1]),
                )

            # Q1
            factories.QPRReportingPeriodDatesFactory(
                programme_document=pd,
                start_date=datetime.datetime(now.year, 1, 1),
                end_date=datetime.datetime(now.year, 3, 31),
                due_date=datetime.datetime(now.year, 3, 31),
            )

            # Q2
            factories.QPRReportingPeriodDatesFactory(
                programme_document=pd,
                start_date=datetime.datetime(now.year, 4, 1),
                end_date=datetime.datetime(now.year, 6, 30),
                due_date=datetime.datetime(now.year, 6, 30),
            )

            # Q3
            factories.QPRReportingPeriodDatesFactory(
                programme_document=pd,
                start_date=datetime.datetime(now.year, 7, 1),
                end_date=datetime.datetime(now.year, 9, 30),
                due_date=datetime.datetime(now.year, 9, 30),
            )

            # Q4
            factories.QPRReportingPeriodDatesFactory(
                programme_document=pd,
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
                        cluster_activities__partner_activity_project_contexts__activity__partner=pd.partner
                    ).first()

                else:
                    cluster_activity_reportable = None

                # generate 2 reportable (indicators) per llo
                num_reportables_range = range(2)
                for i in num_reportables_range:
                    if i % 2 != 0:
                        reportable = factories.QuantityReportableToLowerLevelOutputFactory(
                            content_object=llo,
                            indicator_report__progress_report=None,
                            indicator_report__reporting_entity=unicef_re,
                            is_unicef_hf_indicator=is_unicef_hf_indicator,
                            ca_indicator_used_by_reporting_entity=cluster_activity_reportable,
                        )
                    elif i % 2 == 0 and not first_llo_indicator_flag:
                        reportable = factories.RatioReportableToLowerLevelOutputFactory(
                            content_object=llo,
                            indicator_report__progress_report=None,
                            indicator_report__reporting_entity=unicef_re,
                            is_unicef_hf_indicator=is_unicef_hf_indicator,
                            ca_indicator_used_by_reporting_entity=cluster_activity_reportable,
                        )

                    # delete the junk indicator report the factory creates
                    # we create IR's in the next for loop down below
                    reportable.indicator_reports.all().delete()

                    for loc in locations[:7]:
                        factories.LocationWithReportableLocationGoalFactory.create(
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

                progress_report = factories.ProgressReportFactory(
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
                                factories.ProgressReportIndicatorReportFactory(
                                    reportable=reportable,
                                    progress_report=progress_report,
                                    overall_status=status,
                                    time_period_start=rpd.start_date,
                                    time_period_end=rpd.end_date,
                                    due_date=rpd.due_date,
                                    reporting_entity=unicef_re,
                                )
                            elif reportable.blueprint.unit == IndicatorBlueprint.PERCENTAGE:
                                factories.ProgressReportIndicatorReportFactory(
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
        for pa_reportable in Reportable.objects.filter(partner_activity_project_contexts__activity=partner_activity):
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
                        location=loc,
                    ) for loc in loc_diff
                ]

                ReportableLocationGoal.objects.bulk_create(reportable_location_goals)

    print("ProgrammeDocument <-> QuantityReportableToLowerLevelOutput <-> IndicatorReport objects linked")

    # print("Generating IndicatorLocationData for Quantity type")
    # generate_indicator_report_location_disaggregation_quantity_data(generate_all=generate_all_disagg)

    # print("Generating IndicatorLocationData for Ratio type")
    # generate_indicator_report_location_disaggregation_ratio_data(generate_all=generate_all_disagg)

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
