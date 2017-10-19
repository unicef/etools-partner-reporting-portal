#!/usr/bin/env python
# -*- coding: utf-8 -*-
# encoding: utf-8

from __future__ import unicode_literals
import datetime
import random

from django.conf import settings

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
)
from unicef.models import (
    Section,
    ProgrammeDocument,
    ProgressReport,
    PDResultLink,
    LowerLevelOutput,
    Person,
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
    RatioReportableToClusterObjectiveFactory,
    QuantityReportableToPartnerProjectFactory,
    QuantityReportableToClusterObjectiveFactory,
    QuantityReportableToPartnerActivityFactory,
    QuantityReportableToClusterActivityFactory,
    QuantityIndicatorReportFactory,
    RatioIndicatorReportFactory,
    QuantityTypeIndicatorBlueprintFactory,
    RatioTypeIndicatorBlueprintFactory,
    UserFactory,
    UserProfileFactory,
    ClusterFactory,
    ClusterObjectiveFactory,
    ClusterActivityFactory,
    PartnerFactory,
    PartnerProjectFactory,
    PartnerActivityFactory,
    IndicatorLocationDataFactory,
    DisaggregationFactory,
    DisaggregationValueFactory,
    SectionFactory,
    ProgrammeDocumentFactory,
    ProgressReportFactory,
    PDResultLinkFactory,
    LowerLevelOutputFactory,
    WorkspaceFactory,
    ResponsePlanFactory,
    LocationFactory,
    PersonFactory,
    GatewayTypeFactory,
    CartoDBTableFactory,
    CountryFactory,
    ReportingPeriodDatesFactory,
)
from core.common import INDICATOR_REPORT_STATUS, OVERALL_STATUS

from _generate_disaggregation_fake_data import (
    generate_indicator_report_location_disaggregation_quantity_data,
    generate_indicator_report_location_disaggregation_ratio_data,
)

from core.cron import WorkspaceCronJob
from partner.cron import PartnerCronJob
from unicef.cron import ProgrammeDocumentCronJob

OVERALL_STATUS_LIST = [x[0] for x in OVERALL_STATUS]

def clean_up_data():
    if settings.ENV == 'dev':
        print("Deleting all ORM objects")

        User.objects.all().delete()
        UserProfile.objects.all().delete()
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
        Disaggregation.objects.all().delete()
        DisaggregationValue.objects.all().delete()
        Section.objects.all().delete()
        ProgrammeDocument.objects.all().delete()
        ProgressReport.objects.all().delete()
        PDResultLink.objects.all().delete()
        LowerLevelOutput.objects.all().delete()
        Workspace.objects.all().delete()
        ResponsePlan.objects.all().delete()
        Location.objects.all().delete()
        GatewayType.objects.all().delete()
        CartoDBTable.objects.all().delete()
        Person.objects.all().delete()
        print("All ORM objects deleted")


def generate_real_data(fast=True):

    users_to_create = [
        ('admin_imo', 'admin_imo@notanemail.com', IMORole),
        ('admin_ao', 'admin_ao@notanemail.com', PartnerAuthorizedOfficerRole),
        ('admin_pe', 'admin_pe@notanemail.com', PartnerEditorRole),
        ('admin_pv', 'admin_pv@notanemail.com', PartnerViewerRole),
    ]
    users_created = []
    for u in users_to_create:
        admin, created = User.objects.get_or_create(username=u[0], defaults={
            'email': u[1],
            'is_superuser': True,
            'is_staff': True,
        })
        admin.set_password('Passw0rd!')
        admin.save()
        admin.groups.add(u[2].as_group())
        users_created.append(admin)

    # Generate workspaces
    workspace_cron = WorkspaceCronJob()
    workspace_cron.do()

    # Generate partners
    partner_cron = PartnerCronJob()
    partner_cron.do()

    # Generate programme documents
    pd_cron = ProgrammeDocumentCronJob()
    pd_cron.do(fast)


def generate_fake_data(workspace_quantity=10):

    if not settings.IS_TEST and workspace_quantity < 1:
        workspace_quantity = 5

    if workspace_quantity >= 30:
        workspace_quantity = 30

    today = datetime.date.today()

    users_to_create = [
        ('admin_imo', 'admin_imo@notanemail.com', IMORole),
        ('admin_ao', 'admin_ao@notanemail.com', PartnerAuthorizedOfficerRole),
        ('admin_pe', 'admin_pe@notanemail.com', PartnerEditorRole),
        ('admin_pv', 'admin_pv@notanemail.com', PartnerViewerRole),
    ]
    users_created = []
    for u in users_to_create:
        admin, created = User.objects.get_or_create(username=u[0], defaults={
            'email': u[1],
            'is_superuser': True,
            'is_staff': True,
        })
        admin.set_password('Passw0rd!')
        admin.save()
        admin.groups.add(u[2].as_group())
        users_created.append(admin)

    print("Users created: {}/{}\n".format(users_created, 'Passw0rd!'))

    SectionFactory.create_batch(workspace_quantity)
    print("{} Section objects created".format(workspace_quantity))

    CountryFactory.create_batch(workspace_quantity)
    print("{} Country objects created".format(workspace_quantity))

    WorkspaceFactory.create_batch(workspace_quantity)
    print("{} Workspace objects created".format(workspace_quantity))

    beginning_of_this_year = datetime.date(today.year, 1, 1)

    for workspace in Workspace.objects.all():
        country = Country.objects.order_by('?').first()
        workspace.countries.add(country)
        for idx in xrange(0, 3):
            year = today.year - idx
            # TODO: use ResponsePlanFactory
            ResponsePlan.objects.create(
                workspace=workspace,
                title="{} {} Humanitarian Response Plan".format(workspace.title, year),
                start=beginning_of_this_year,
                end=beginning_of_this_year + datetime.timedelta(days=30)
            )

        gateways = list()
        for idx in range(5):
            gateways.append(GatewayTypeFactory(country=country, admin_level=idx + 1))

        carto_db_table = CartoDBTableFactory(
            location_type=gateways[0], country=country)

        locations = list()
        for idx in range(8):
            locations.append(
                LocationFactory.create(
                    gateway=gateways[idx] if idx < 5 else gateways[4],
                    parent=None if idx == 0 else (locations[idx - 1] if idx < 6 else locations[4]),
                    carto_db_table=carto_db_table,
                )
            )

        print("{} ResponsePlan objects created for {}".format(3, workspace))

    for response_plan in ResponsePlan.objects.all():
        country = response_plan.workspace.countries.first()
        locations = list(Location.objects.filter(gateway__country=country))
        table = response_plan.workspace.countries.first().carto_db_tables.first()

        user = UserFactory(
            first_name="WASH",
            last_name="IMO")

        cluster = ClusterFactory(
            response_plan=response_plan,
            type="wash"
        )

        for idx in xrange(2, 0, -1):
            co = ClusterObjectiveFactory(
                title="{} - {} - {} CO".format(
                    idx, cluster.response_plan.title, cluster.type.upper()),
                cluster=cluster,
            )

            reportable_to_co = QuantityReportableToClusterObjectiveFactory(
                content_object=co, indicator_report__progress_report=None,
                locations=locations,
            )

            co.locations.add(*locations)

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

        user = UserFactory(
            first_name="Nutrition",
            last_name="IMO")

        cluster = ClusterFactory(
            response_plan=response_plan,
            type="nutrition",
        )

        for idx in xrange(2, 0, -1):
            co = ClusterObjectiveFactory(
                title="{} - {} Cluster Objective".format(cluster.response_plan.title, cluster.type.upper()),
                cluster=cluster,
            )

            reportable_to_co = QuantityReportableToClusterObjectiveFactory(
                content_object=co, indicator_report__progress_report=None,
                locations=locations,
            )

            co.locations.add(*locations)

        user = UserFactory(
            first_name="{} Cluster".format(cluster.type.upper()),
            last_name="Partner")

        partner = PartnerFactory(
            title="{} - {} Cluster Partner".format(cluster.response_plan.title, cluster.type.upper()),
            partner_activity=None,
            partner_project=None,
            user=user,
        )
        partner.clusters.add(cluster)

        user = UserFactory(
            first_name="Education",
            last_name="IMO")

        cluster = ClusterFactory(
            response_plan=response_plan,
            type="education",
        )

        for idx in xrange(2, 0, -1):
            co = ClusterObjectiveFactory(
                title="{} - {} Cluster Objective".format(cluster.response_plan.title, cluster.type.upper()),
                cluster=cluster,
            )

            reportable_to_co = QuantityReportableToClusterObjectiveFactory(
                content_object=co, indicator_report__progress_report=None,
                locations=locations,
            )
            co.locations.add(*locations)

        user = UserFactory(
            first_name="{} Cluster".format(cluster.type.upper()),
            last_name="Partner")

        partner = PartnerFactory(
            title="{} - {} Cluster Partner".format(cluster.response_plan.title, cluster.type.upper()),
            partner_activity=None,
            partner_project=None,
            user=user,
        )
        partner.clusters.add(cluster)

        print("{} Cluster & Cluster user objects created for {}".format(3, response_plan.title))

        print("{} Partner objects & Partner user objects created for {}".format(3, cluster))

        print("{} Cluster Objective objects created for {}".format(2 * 3, cluster))

    table = CartoDBTable.objects.first()
    locations = list(Location.objects.filter(carto_db_table=table, carto_db_table__country=carto_db_table.country))

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
        for idx in xrange(2, 0, -1):
            ca = ClusterActivityFactory(
                title="{} Cluster Activity".format(cluster_objective.title),
                cluster_objective=cluster_objective,
            )

            reportable_to_ca = QuantityReportableToClusterActivityFactory(
                content_object=ca, indicator_report__progress_report=None,
                locations=locations,
            )
            ca.locations.add(*locations)

        print("{} Cluster Activity objects created for {}".format(2, cluster_objective.title))

    for partner in Partner.objects.all():
        for idx in xrange(2, 0, -1):
            first_cluster = partner.clusters.first()
            pp = PartnerProjectFactory(
                partner=partner,
                title="{} Partner Project".format(partner.title)
            )

            pp.clusters.add(first_cluster)

            reportable_to_pp = QuantityReportableToPartnerProjectFactory(
                content_object=pp, indicator_report__progress_report=None,
                locations=locations,
            )
            pp.locations.add(*locations)

        print("{} PartnerProject objects created for {} under {} Cluster".format(2, partner, first_cluster.type.upper()))

    # ClusterActivity <-> PartnerActivity link
    for cluster_activity in ClusterActivity.objects.all():
        partner = cluster_activity.cluster_objective.cluster.partners.first()

        for project in partner.partner_projects.all():
            for idx in xrange(2, 0, -1):
                pa = PartnerActivityFactory(
                    partner=project.partner,
                    project=project,
                    cluster_activity=cluster_activity,
                    title="{} Partner Activity from CA".format(project.title)
                )

                reportable_to_pa = QuantityReportableToPartnerActivityFactory(
                    content_object=pa, indicator_report__progress_report=None,
                    locations=locations,
                )
                reportable_to_pa.parent_indicator = cluster_activity.reportables.first()
                reportable_to_pa.save()

                pa.locations.add(*locations)

                pa = PartnerActivityFactory(
                    partner=project.partner,
                    project=project,
                    cluster_activity=None,
                    title="{} Partner Activity".format(project.title)
                )

                reportable_to_pa = QuantityReportableToPartnerActivityFactory(
                    content_object=pa, indicator_report__progress_report=None,
                    locations=locations,
                )
                pa.locations.add(*locations)

            print("{} PartnerActivity objects created for {} under {} Cluster Activity and Custom Activity".format(4, partner, cluster_activity.title))

    print("ClusterActivity <-> PartnerActivity objects linked")

    PersonFactory.create_batch(workspace_quantity)
    # only create PD's for the partner being used above
    # for partner in Partner.objects.all():
    for workspace in Workspace.objects.all():
        for i in range(workspace_quantity * 5):
            pd = ProgrammeDocumentFactory.create(
                partner=first_partner, workspace=workspace)
            for ir in range(3):
                d = datetime.datetime.now() + datetime.timedelta(days=ir * 30)
                ReportingPeriodDatesFactory.create(
                    programme_document=pd,
                    start_date=d,
                    end_date=d + datetime.timedelta(days=30),
                    due_date=d + datetime.timedelta(days=45),
                )
    print("{} ProgrammeDocument objects created".format(
        min(4, workspace_quantity * 2)))

    # Linking the followings:
    # ProgressReport - ProgrammeDocument
    # created LowerLevelOutput - QuantityReportableToLowerLevelOutput
    # Section - ProgrammeDocument via QuantityReportableToLowerLevelOutput
    # ProgressReport - IndicatorReport from
    # QuantityReportableToLowerLevelOutput
    for idx, pd in enumerate(ProgrammeDocument.objects.all()):
        locations = pd.workspace.locations

        pd.sections.add(Section.objects.order_by('?').first())
        pd.unicef_focal_point.add(Person.objects.order_by('?').first())
        pd.partner_focal_point.add(
            Person.objects.order_by('?').first())
        pd.unicef_officers.add(Person.objects.order_by('?').first())

        # generate reportables for this PD
        for cp_output in pd.cp_outputs.all():
            for llo in cp_output.ll_outputs.all():

                # generate 2 to 10 reportable (indicators) per llo
                num_reportables_range = range(random.randint(2, 10))
                for i in num_reportables_range:
                    if i % 3 != 0:
                        reportable = QuantityReportableToLowerLevelOutputFactory(
                            content_object=llo,
                            indicator_report__progress_report=None,
                            locations=locations,
                        )
                    else:
                        reportable = RatioReportableToLowerLevelOutputFactory(
                            content_object=llo,
                            indicator_report__progress_report=None,
                            locations=locations,
                        )

                    # delete the junk indicator report the factory creates
                    # we create IR's in the next for loop down below
                    reportable.indicator_reports.all().delete()

                print("{} Reportables generated for {}".format(
                    num_reportables_range[-1] + 1,
                    llo
                ))

        # Generate 2-8 progress reports per pd. Requires creating indicator
        # reports for each llo and then associating them with a progress
        # report
        for idx in xrange(0, random.randint(2, 8)):
            progress_report = ProgressReportFactory(programme_document=pd)
            for cp_output in pd.cp_outputs.all():
                for llo in cp_output.ll_outputs.all():
                    # All Indicator Reports inside LLO should have same status
                    # We should skip "No status"
                    status = OVERALL_STATUS_LIST[random.randint(0, 4)]
                    for reportable in llo.reportables.all():
                        if reportable.blueprint.unit == IndicatorBlueprint.NUMBER:
                            QuantityIndicatorReportFactory(
                                reportable=reportable,
                                progress_report=progress_report,
                                overall_status=status,
                            )
                        elif reportable.blueprint.unit == IndicatorBlueprint.PERCENTAGE:
                            RatioIndicatorReportFactory(
                                reportable=reportable,
                                progress_report=progress_report,
                                overall_status=status,
                            )

        print("{} Progress Reports generated for {}".format(
            ProgressReport.objects.filter(programme_document=pd).count(),
            pd
        ))

    print("ProgrammeDocument <-> QuantityReportableToLowerLevelOutput <-> IndicatorReport objects linked".format(workspace_quantity))

    print("Generating IndicatorLocationData for Quantity type"
    generate_indicator_report_location_disaggregation_quantity_data())

    print("Generating IndicatorLocationData for Ratio type"
    generate_indicator_report_location_disaggregation_ratio_data())

    # Fulfill submission date for closed IR
    IndicatorReport.objects.filter(
        report_status__in=(INDICATOR_REPORT_STATUS.submitted, INDICATOR_REPORT_STATUS.accepted)
    ).update(submission_date=today)
    # Null submission date for open IR
    IndicatorReport.objects.exclude(
        report_status__in=(INDICATOR_REPORT_STATUS.submitted, INDICATOR_REPORT_STATUS.accepted)
    ).update(submission_date=None)
