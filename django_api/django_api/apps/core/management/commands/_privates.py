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


def generate_light_fake_data(seed_quantity=5):
    today = datetime.date.today()

    admin, created = User.objects.get_or_create(username='admin', defaults={
        'email': 'admin@unicef.org',
        'is_superuser': True,
        'is_staff': True,
        'organization': 'Tivix'
    })
    admin.set_password('Passw0rd!')
    admin.save()

    SectionFactory.create_batch(seed_quantity)
    WorkspaceFactory.create_batch(seed_quantity)

    for intervention in Workspace.objects.all():
        ResponsePlanFactory(
            intervention=intervention,
            title="{} {} Humanitarian Response Plan".format(intervention.country_name, today.year)
        )

        gateway = GatewayTypeFactory(intervention=intervention)

        CartoDBTableFactory(location_type=gateway, intervention=intervention)

    for response_plan in ResponsePlan.objects.all():
        user = UserFactory(
            first_name="WASH",
            last_name="IMO")

        cluster = ClusterFactory(
            response_plan=response_plan,
            title="WASH",
            user=user
        )

        co = ClusterObjectiveFactory(
            title="{} - {} Cluster Objective".format(cluster.response_plan.title, cluster.title),
            cluster=cluster,
        )

        table = response_plan.intervention.carto_db_tables.first()

        reportable_to_co = QuantityReportableToClusterObjectiveFactory(
            content_object=co, indicator_report__progress_report=None,
            location__carto_db_table=table,
            location__gateway=table.location_type,
            location__intervention=table.intervention,
        )

        user = UserFactory(
            first_name="{} Cluster".format(cluster.title),
            last_name="Partner")

        partner = PartnerFactory(
            title="{} - {} Cluster Partner".format(cluster.response_plan.title, cluster.title),
            partner_activity=None,
            partner_project=None,
            user=user,
        )
        partner.clusters.add(cluster)

    for cluster_objective in ClusterObjective.objects.all():
        ca = ClusterActivityFactory(
            title="{} Cluster Activity".format(cluster_objective.title),
            cluster_objective=cluster_objective,
        )

        reportable_to_ca = QuantityReportableToClusterActivityFactory(
            content_object=ca, indicator_report__progress_report=None,
            location__carto_db_table=table,
            location__gateway=table.location_type,
            location__intervention=table.intervention,
        )

    for partner in Partner.objects.all():
        first_cluster = partner.clusters.first()
        pp = PartnerProjectFactory(
            partner=partner,
            title="{} Partner Project".format(partner.title)
        )

        pp.clusters.add(first_cluster)

        reportable_to_pp = QuantityReportableToPartnerProjectFactory(
            content_object=pp, indicator_report__progress_report=None,
            location__carto_db_table=table,
            location__gateway=table.location_type,
            location__intervention=table.intervention,
        )
        pp.locations.add(*list(reportable_to_pp.locations.all()))

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
                content_object=pa, indicator_report__progress_report=None,
                location__carto_db_table=table,
                location__gateway=table.location_type,
                location__intervention=table.intervention,
            )

            reportable_to_pa.parent_indicator = cluster_activity.reportables.first()

            reportable_to_pa.save()

            pa = PartnerActivityFactory(
                partner=project.partner,
                project=project,
                cluster_activity=None,
                title="{} Partner Activity".format(project.title)
            )

            reportable_to_pa = QuantityReportableToPartnerActivityFactory(
                content_object=pa, indicator_report__progress_report=None,
                location__carto_db_table=table,
                location__gateway=table.location_type,
                location__intervention=table.intervention,
            )

    PersonFactory.create_batch(seed_quantity)
    ProgrammeDocumentFactory.create_batch(seed_quantity)

    # Linking the followings:
    # ProgressReport - ProgrammeDocument
    # created LowerLevelOutput - QuantityReportableToLowerLevelOutput
    # Section - ProgrammeDocument via QuantityReportableToLowerLevelOutput
    # ProgressReport - IndicatorReport from
    # QuantityReportableToLowerLevelOutput
    for idx, llo in enumerate(LowerLevelOutput.objects.all()):
        progress_report = ProgressReportFactory(
            programme_document=llo.indicator.programme_document)

        table = CartoDBTable.objects.first()

        reportable = QuantityReportableToLowerLevelOutputFactory(
            content_object=llo, indicator_report__progress_report=None,
            location__gateway=table.location_type,
            location__carto_db_table=table,
            location__intervention=table.intervention,
        )

        reportable.content_object \
            .indicator.programme_document.sections.add(
                Section.objects.all()[idx])

        indicator_report = reportable.indicator_reports.first()
        indicator_report.progress_report = progress_report
        indicator_report.save()

        reportable = RatioReportableToLowerLevelOutputFactory(
            content_object=llo, indicator_report__progress_report=None,
            location__gateway=table.location_type,
            location__carto_db_table=table,
            location__intervention=table.intervention,
        )

        reportable.content_object \
            .indicator.programme_document.sections.add(
                Section.objects.all()[idx])

        reportable.content_object \
            .indicator.programme_document.unicef_focal_point.add(
            Person.objects.order_by('?').first())

        reportable.content_object \
            .indicator.programme_document.partner_focal_point.add(
            Person.objects.order_by('?').first())

        reportable.content_object \
            .indicator.programme_document.unicef_officers.add(
            Person.objects.order_by('?').first())

        indicator_report = reportable.indicator_reports.first()
        indicator_report.progress_report = progress_report
        indicator_report.save()

    # Workspace <-> Locations
    for intervention in Workspace.objects.all():
        intervention.locations.add(*list(Location.objects.all()))
    generate_indicator_report_location_disaggregation_quantity_data()

    generate_indicator_report_location_disaggregation_ratio_data()

    IndicatorReport.objects.filter(
        report_status=INDICATOR_REPORT_STATUS.submitted
    ).update(submission_date=today)

    admin.partner = Partner.objects.first()
    admin.save()


def generate_fake_data(seed_quantity=40):
    if not settings.IS_TEST and seed_quantity < 40:
        seed_quantity = 40

    if seed_quantity >= 253:
        seed_quantity = 250

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

    SectionFactory.create_batch(seed_quantity)
    print "{} Section objects created".format(seed_quantity / 4)

    WorkspaceFactory.create_batch(seed_quantity / 8)
    print "{} Workspace objects created".format(seed_quantity / 8)

    for intervention in Workspace.objects.all():
        for idx in xrange(0, 3):
            year = today.year - idx
            ResponsePlanFactory(
                intervention=intervention,
                title="{} {} Humanitarian Response Plan".format(intervention.country_name, year)
            )

            gateway = GatewayTypeFactory(intervention=intervention)

            CartoDBTableFactory(location_type=gateway, intervention=intervention)

        print "{} ResponsePlan objects created for {}".format(3, intervention)

    for response_plan in ResponsePlan.objects.all():
        table = response_plan.intervention.carto_db_tables.first()

        user = UserFactory(
            first_name="WASH",
            last_name="IMO")

        cluster = ClusterFactory(
            response_plan=response_plan,
            title="WASH",
            user=user
        )

        for idx in xrange(2, 0, -1):
            co = ClusterObjectiveFactory(
                title="{} - {} Cluster Objective".format(cluster.response_plan.title, cluster.title),
                cluster=cluster,
            )

            reportable_to_co = QuantityReportableToClusterObjectiveFactory(
                content_object=co, indicator_report__progress_report=None,
                location__carto_db_table=table,
                location__gateway=table.location_type,
                location__intervention=table.intervention,
            )

        user = UserFactory(
            first_name="{} Cluster".format(cluster.title),
            last_name="Partner")

        partner = PartnerFactory(
            title="{} - {} Cluster Partner".format(cluster.response_plan.title, cluster.title),
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
            title="Nutrition",
            user=user
        )

        for idx in xrange(2, 0, -1):
            co = ClusterObjectiveFactory(
                title="{} - {} Cluster Objective".format(cluster.response_plan.title, cluster.title),
                cluster=cluster,
            )

            reportable_to_co = QuantityReportableToClusterObjectiveFactory(
                content_object=co, indicator_report__progress_report=None,
                location__carto_db_table=table,
                location__gateway=table.location_type,
                location__intervention=table.intervention,
            )

        user = UserFactory(
            first_name="{} Cluster".format(cluster.title),
            last_name="Partner")

        partner = PartnerFactory(
            title="{} - {} Cluster Partner".format(cluster.response_plan.title, cluster.title),
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
            title="Education",
            user=user
        )

        for idx in xrange(2, 0, -1):
            co = ClusterObjectiveFactory(
                title="{} - {} Cluster Objective".format(cluster.response_plan.title, cluster.title),
                cluster=cluster,
            )

            reportable_to_co = QuantityReportableToClusterObjectiveFactory(
                content_object=co, indicator_report__progress_report=None,
                location__carto_db_table=table,
                location__gateway=table.location_type,
                location__intervention=table.intervention,
            )

        user = UserFactory(
            first_name="{} Cluster".format(cluster.title),
            last_name="Partner")

        partner = PartnerFactory(
            title="{} - {} Cluster Partner".format(cluster.response_plan.title, cluster.title),
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
                location__intervention=table.intervention,
            )

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
                location__intervention=table.intervention,
            )
            pp.locations.add(*list(reportable_to_pp.locations.all()))

        print "{} PartnerProject objects created for {} under {} Cluster".format(2, partner, first_cluster.title)

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
                    location__intervention=table.intervention,
                )

                reportable_to_pa.parent_indicator = cluster_activity.reportables.first()

                reportable_to_pa.save()

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
                    location__intervention=table.intervention,
                )

            print "{} PartnerActivity objects created for {} under {} Cluster Activity and Custom Activity".format(4, partner, cluster_activity.title)

    print "ClusterActivity <-> PartnerActivity objects linked"

    PersonFactory.create_batch(seed_quantity)
    ProgrammeDocumentFactory.create_batch(seed_quantity)
    print "{} ProgrammeDocument objects created".format(seed_quantity)

    # Linking the followings:
    # ProgressReport - ProgrammeDocument
    # created LowerLevelOutput - QuantityReportableToLowerLevelOutput
    # Section - ProgrammeDocument via QuantityReportableToLowerLevelOutput
    # ProgressReport - IndicatorReport from
    # QuantityReportableToLowerLevelOutput
    for idx, llo in enumerate(LowerLevelOutput.objects.all()):
        progress_report = ProgressReportFactory(
            programme_document=llo.indicator.programme_document)

        if idx < 20:
            reportable = QuantityReportableToLowerLevelOutputFactory(
                content_object=llo, indicator_report__progress_report=None,
                location__gateway=table.location_type,
                location__carto_db_table=table,
                location__intervention=table.intervention,
            )

        else:
            reportable = RatioReportableToLowerLevelOutputFactory(
                content_object=llo, indicator_report__progress_report=None,
                location__gateway=table.location_type,
                location__carto_db_table=table,
                location__intervention=table.intervention,
            )

        reportable.content_object \
            .indicator.programme_document.sections.add(
                Section.objects.all()[idx])
        reportable.content_object \
            .indicator.programme_document.unicef_focal_point.add(
            Person.objects.order_by('?').first())

        reportable.content_object \
            .indicator.programme_document.partner_focal_point.add(
            Person.objects.order_by('?').first())

        reportable.content_object \
            .indicator.programme_document.unicef_officers.add(
            Person.objects.order_by('?').first())

        indicator_report = reportable.indicator_reports.first()
        indicator_report.progress_report = progress_report
        indicator_report.save()

    print "ProgrammeDocument <-> QuantityReportableToLowerLevelOutput <-> IndicatorReport objects linked".format(seed_quantity)

    # Workspace <-> Locations
    for intervention in Workspace.objects.all():
        intervention.locations.add(*list(Location.objects.all()))
    print "Workspace objects linked to Locations".format(seed_quantity)

    print "Generating IndicatorLocationData for Quantity type"
    generate_indicator_report_location_disaggregation_quantity_data()

    print "Generating IndicatorLocationData for Ratio type"
    generate_indicator_report_location_disaggregation_ratio_data()

    IndicatorReport.objects.filter(
        report_status=INDICATOR_REPORT_STATUS.submitted
    ).update(submission_date=today)

    admin.partner = Partner.objects.first()
    admin.save()
