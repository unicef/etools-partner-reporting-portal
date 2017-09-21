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
    CountryProgrammeOutput,
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
    CountryProgrammeOutputFactory,
    LowerLevelOutputFactory,
    WorkspaceFactory,
    ResponsePlanFactory,
    LocationFactory,
    PersonFactory,
    GatewayTypeFactory,
    CartoDBTableFactory,
    CountryFactory,
)
from core.common import INDICATOR_REPORT_STATUS

from _generate_disaggregation_fake_data import (
    generate_indicator_report_location_disaggregation_quantity_data,
    generate_indicator_report_location_disaggregation_ratio_data,
)


def clean_up_data():
    if settings.ENV == 'dev':
        print "Deleting all ORM objects"

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
        CountryProgrammeOutput.objects.all().delete()
        LowerLevelOutput.objects.all().delete()
        Workspace.objects.all().delete()
        ResponsePlan.objects.all().delete()
        Location.objects.all().delete()
        GatewayType.objects.all().delete()
        CartoDBTable.objects.all().delete()
        Person.objects.all().delete()
        print "All ORM objects deleted"


def generate_fake_data(workspace_quantity=10):
    if not settings.IS_TEST and workspace_quantity < 1:
        workspace_quantity = 5

    if workspace_quantity >= 30:
        workspace_quantity = 30

    today = datetime.date.today()

    admin, created = User.objects.get_or_create(username='admin', defaults={
        'email': 'admin@unicef.org',
        'is_superuser': True,
        'is_staff': True,
        'organization': 'Tivix'
    })
    admin.set_password('Passw0rd!')
    admin.save()

    print "Superuser created: {}/{}\n".format(admin.username, 'Passw0rd!')

    SectionFactory.create_batch(workspace_quantity)
    print "{} Section objects created".format(workspace_quantity)

    CountryFactory.create_batch(workspace_quantity)
    print "{} Country objects created".format(workspace_quantity)

    WorkspaceFactory.create_batch(workspace_quantity)
    print "{} Workspace objects created".format(workspace_quantity)

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
                start = beginning_of_this_year,
                end = beginning_of_this_year + datetime.timedelta(days=30)
            )

        gateway = GatewayTypeFactory(country=country)
        CartoDBTableFactory(location_type=gateway, country=country)

        print "{} ResponsePlan objects created for {}".format(3, workspace)

    for response_plan in ResponsePlan.objects.all():
        table = response_plan.workspace.countries.first().carto_db_tables.first()

        user = UserFactory(
            first_name="WASH",
            last_name="IMO")

        cluster = ClusterFactory(
            response_plan=response_plan,
            type="wash",
            user=user
        )

        for idx in xrange(2, 0, -1):
            co = ClusterObjectiveFactory(
                title="{} - {} - {} CO".format(
                    idx, cluster.response_plan.title, cluster.type),
                cluster=cluster,
            )

            reportable_to_co = QuantityReportableToClusterObjectiveFactory(
                content_object=co, indicator_report__progress_report=None,
                location__carto_db_table=table,
                location__gateway=table.location_type,
            )

            co.locations.add(*list(reportable_to_co.locations.all()))

        user = UserFactory(
            first_name="{} Cluster".format(cluster.type[:20]),
            last_name="Partner")

        partner = PartnerFactory(
            title="{} - {} Cluster Partner".format(
                cluster.response_plan.title, cluster.type),
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
            user=user
        )

        for idx in xrange(2, 0, -1):
            co = ClusterObjectiveFactory(
                title="{} - {} Cluster Objective".format(cluster.response_plan.title, cluster.type),
                cluster=cluster,
            )

            reportable_to_co = QuantityReportableToClusterObjectiveFactory(
                content_object=co, indicator_report__progress_report=None,
                location__carto_db_table=table,
                location__gateway=table.location_type,
            )

            co.locations.add(*list(reportable_to_co.locations.all()))

        user = UserFactory(
            first_name="{} Cluster".format(cluster.type),
            last_name="Partner")

        partner = PartnerFactory(
            title="{} - {} Cluster Partner".format(cluster.response_plan.title, cluster.type),
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
            user=user
        )

        for idx in xrange(2, 0, -1):
            co = ClusterObjectiveFactory(
                title="{} - {} Cluster Objective".format(cluster.response_plan.title, cluster.type),
                cluster=cluster,
            )

            reportable_to_co = QuantityReportableToClusterObjectiveFactory(
                content_object=co, indicator_report__progress_report=None,
                location__carto_db_table=table,
                location__gateway=table.location_type,
            )
            co.locations.add(*list(reportable_to_co.locations.all()))

        user = UserFactory(
            first_name="{} Cluster".format(cluster.type),
            last_name="Partner")

        partner = PartnerFactory(
            title="{} - {} Cluster Partner".format(cluster.response_plan.title, cluster.type),
            partner_activity=None,
            partner_project=None,
            user=user,
        )
        partner.clusters.add(cluster)

        print "{} Cluster & Cluster user objects created for {}".format(3, response_plan.title)

        print "{} Partner objects & Partner user objects created for {}".format(3, cluster)

        print "{} Cluster Objective objects created for {}".format(2 * 3, cluster)

    table = CartoDBTable.objects.first()

    for cluster_objective in ClusterObjective.objects.all():
        for idx in xrange(2, 0, -1):
            ca = ClusterActivityFactory(
                title="{} Cluster Activity".format(cluster_objective.title),
                cluster_objective=cluster_objective,
            )

            reportable_to_ca = QuantityReportableToClusterActivityFactory(
                content_object=ca, indicator_report__progress_report=None,
                location__gateway=table.location_type,
                location__carto_db_table=table,
            )
            ca.locations.add(*list(reportable_to_ca.locations.all()))

        print "{} Cluster Activity objects created for {}".format(2, cluster_objective.title)

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
                location__gateway=table.location_type,
                location__carto_db_table=table,
            )
            pp.locations.add(*list(reportable_to_pp.locations.all()))

        print "{} PartnerProject objects created for {} under {} Cluster".format(2, partner, first_cluster.type)

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
                    location__gateway=table.location_type,
                    location__carto_db_table=table,
                )
                reportable_to_pa.parent_indicator = cluster_activity.reportables.first()
                reportable_to_pa.save()

                pa.locations.add(*list(reportable_to_pa.locations.all()))

                pa = PartnerActivityFactory(
                    partner=project.partner,
                    project=project,
                    cluster_activity=None,
                    title="{} Partner Activity".format(project.title)
                )

                reportable_to_pa = QuantityReportableToPartnerActivityFactory(
                    content_object=pa, indicator_report__progress_report=None,
                    location__gateway=table.location_type,
                    location__carto_db_table=table,
                )
                pa.locations.add(*list(reportable_to_pa.locations.all()))

            print "{} PartnerActivity objects created for {} under {} Cluster Activity and Custom Activity".format(4, partner, cluster_activity.title)

    print "ClusterActivity <-> PartnerActivity objects linked"

    PersonFactory.create_batch(workspace_quantity)
    for partner in Partner.objects.all():
        for workspace in Workspace.objects.all():
            ProgrammeDocumentFactory.create_batch(workspace_quantity * 5,
                                                  partner=partner,
                                                  workspace=workspace)
    print "{} ProgrammeDocument objects created".format(
        workspace_quantity * Partner.objects.count())

    # Linking the followings:
    # ProgressReport - ProgrammeDocument
    # created LowerLevelOutput - QuantityReportableToLowerLevelOutput
    # Section - ProgrammeDocument via QuantityReportableToLowerLevelOutput
    # ProgressReport - IndicatorReport from
    # QuantityReportableToLowerLevelOutput
    for idx, llo in enumerate(LowerLevelOutput.objects.all()):
        progress_report = ProgressReportFactory(
            programme_document=llo.cp_output.programme_document)

        if idx < 20:
            reportable = QuantityReportableToLowerLevelOutputFactory(
                content_object=llo, indicator_report__progress_report=None,
                location__gateway=table.location_type,
                location__carto_db_table=table,
            )

        else:
            reportable = RatioReportableToLowerLevelOutputFactory(
                content_object=llo, indicator_report__progress_report=None,
                location__gateway=table.location_type,
                location__carto_db_table=table,
            )

        reportable.content_object \
            .cp_output.programme_document.sections.add(
                Section.objects.order_by('?').first())
        reportable.content_object \
            .cp_output.programme_document.unicef_focal_point.add(
            Person.objects.order_by('?').first())

        reportable.content_object \
            .cp_output.programme_document.partner_focal_point.add(
            Person.objects.order_by('?').first())

        reportable.content_object \
            .cp_output.programme_document.unicef_officers.add(
            Person.objects.order_by('?').first())

        indicator_report = reportable.indicator_reports.first()
        indicator_report.progress_report = progress_report
        indicator_report.save()

    print "ProgrammeDocument <-> QuantityReportableToLowerLevelOutput <-> IndicatorReport objects linked".format(workspace_quantity)

    # Workspace <-> Locations
    for workspace in Workspace.objects.all():
        workspace.locations.add(*list(Location.objects.all()))
    print "Workspace objects linked to Locations".format(workspace_quantity)

    print "Generating IndicatorLocationData for Quantity type"
    generate_indicator_report_location_disaggregation_quantity_data()

    print "Generating IndicatorLocationData for Ratio type"
    generate_indicator_report_location_disaggregation_ratio_data()

    IndicatorReport.objects.filter(
        report_status=INDICATOR_REPORT_STATUS.submitted
    ).update(submission_date=today)

    admin.partner = Partner.objects.first()
    admin.save()
