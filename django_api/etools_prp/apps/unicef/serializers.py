from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db import transaction
from django.utils.functional import cached_property

from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.validators import UniqueTogetherValidator

from etools_prp.apps.account.validators import EmailValidator
from etools_prp.apps.core.common import (
    CURRENCIES,
    FINAL_OVERALL_STATUS,
    OVERALL_STATUS,
    PD_DOCUMENT_TYPE,
    PD_STATUS,
    PROGRESS_REPORT_STATUS,
    PRP_IP_ROLE_TYPES,
)
from etools_prp.apps.core.models import Location, Workspace
from etools_prp.apps.core.serializers import ShortLocationSerializer
from etools_prp.apps.indicator.models import IndicatorBlueprint
from etools_prp.apps.indicator.serializers import (
    IndicatorBlueprintSimpleSerializer,
    PDReportContextIndicatorReportSerializer,
)
from etools_prp.apps.partner.models import Partner

from ..core.models import Realm
from .models import (
    FinalReview,
    LowerLevelOutput,
    PDResultLink,
    Person,
    ProgrammeDocument,
    ProgressReport,
    ProgressReportAttachment,
    ReportingPeriodDates,
    Section,
)


class PersonSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(validators=[EmailValidator(
        queryset=Person.objects.all(),
    )])

    class Meta:
        model = Person
        fields = ('name', 'title', 'email', 'phone_number', 'is_authorized_officer', 'active')


class ReportingPeriodDatesSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='external_id')
    programme_document = serializers.PrimaryKeyRelatedField(
        queryset=ProgrammeDocument.objects.all())

    class Meta:
        model = ReportingPeriodDates
        fields = (
            'id',
            'start_date',
            'end_date',
            'due_date',
            'programme_document',
            'report_type',
            'description',
        )


class ProgrammeDocumentSimpleSerializer(serializers.ModelSerializer):
    status = serializers.CharField(source='get_status_display')
    document_type_display = serializers.CharField(source='get_document_type_display')

    class Meta:
        model = ProgrammeDocument
        fields = (
            'id',
            'external_id',
            'agreement',
            'reference_number',
            'title',
            'start_date',
            'end_date',
            'status',
            'document_type',
            'document_type_display',
        )


class ProgrammeDocumentSerializer(serializers.ModelSerializer):

    id = serializers.SerializerMethodField()
    status = serializers.CharField(source='get_status_display')
    total_unicef_supplies = serializers.SerializerMethodField()
    total_unicef_supplies_currency = serializers.SerializerMethodField()
    budget_currency = serializers.SerializerMethodField()
    cso_contribution_currency = serializers.SerializerMethodField()
    funds_received_to_date_currency = serializers.SerializerMethodField()
    unicef_officers = serializers.SerializerMethodField()
    unicef_focal_point = serializers.SerializerMethodField()
    partner_focal_point = serializers.SerializerMethodField()
    document_type_display = serializers.CharField(source='get_document_type_display')
    locations = serializers.SerializerMethodField(allow_null=True)
    amendments = serializers.JSONField(read_only=True)
    reporting_periods = ReportingPeriodDatesSerializer(many=True)

    class Meta:
        model = ProgrammeDocument
        fields = (
            'id',
            'external_id',
            'agreement',
            'reference_number',
            'title',
            'unicef_office',
            'start_date',
            'end_date',
            'status',
            'document_type',
            'document_type_display',
            'calculated_budget',
            'budget',
            'budget_currency',
            'cso_contribution',
            'cso_contribution_currency',
            'total_unicef_cash',
            'total_unicef_cash_currency',
            'funds_received_to_date',
            'funds_received_to_date_currency',
            'funds_received_to_date_percentage',
            'total_unicef_supplies',
            'total_unicef_supplies_currency',
            'partner_focal_point',
            'unicef_focal_point',
            'unicef_officers',
            'locations',
            'amendments',
            'reporting_periods',
        )

    def get_id(self, obj):
        return str(obj.id)

    def get_total_unicef_supplies(self, obj):
        return str(obj.in_kind_amount)

    def get_total_unicef_supplies_currency(self, obj):
        return obj.in_kind_amount_currency

    def get_budget_currency(self, obj):
        return obj.budget_currency

    def get_cso_contribution_currency(self, obj):
        return obj.cso_contribution_currency

    def get_funds_received_to_date_currency(self, obj):
        return obj.funds_received_to_date_currency

    def get_locations(self, obj):
        return ShortLocationSerializer(
            Location.objects.filter(
                indicator_location_data__indicator_report__progress_report__programme_document=obj
            ).distinct(),
            many=True
        ).data

    def get_unicef_officers(self, obj):
        return PersonSerializer(obj.unicef_officers.filter(active=True), read_only=True, many=True).data

    def get_unicef_focal_point(self, obj):
        return PersonSerializer(obj.unicef_focal_point.filter(active=True), read_only=True, many=True).data

    def get_partner_focal_point(self, obj):
        return PersonSerializer(obj.partner_focal_point.filter(active=True), read_only=True, many=True).data


class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ('name', )


class ProgrammeDocumentDetailSerializer(serializers.ModelSerializer):

    document_type = serializers.CharField(source='get_document_type_display')
    document_type_display = serializers.CharField(source='get_document_type_display')
    # status is choice field on different branch with migration #23 - should be uncomment when it will be merged
    # status = serializers.CharField(source='get_status_display')
    frequency = serializers.CharField(source='get_frequency_display')
    # sections = serializers.SerializerMethodField()
    sections = SectionSerializer(read_only=True, many=True)
    unicef_officers = serializers.SerializerMethodField()
    unicef_focal_point = serializers.SerializerMethodField()
    partner_focal_point = serializers.SerializerMethodField()

    total_unicef_supplies = serializers.CharField(source='in_kind_amount')
    total_unicef_supplies_currency = serializers.CharField(source='in_kind_amount_currency')
    locations = serializers.SerializerMethodField(allow_null=True)
    reporting_periods = ReportingPeriodDatesSerializer(many=True)
    amendments = serializers.JSONField(read_only=True)

    class Meta:
        model = ProgrammeDocument
        fields = (
            'id',
            'agreement',
            'document_type',
            'document_type_display',
            'reference_number',
            'title',
            'unicef_office',
            'unicef_officers',
            'unicef_focal_point',
            'partner_focal_point',
            'start_date',
            'end_date',
            # 'status',
            'frequency',
            'sections',
            'budget_currency',
            'cso_contribution',
            'cso_contribution_currency',
            'total_unicef_cash',
            'total_unicef_cash_currency',
            'in_kind_amount',
            'budget',
            'locations',
            'amendments',
            'reporting_periods',
            'funds_received_to_date',
            'funds_received_to_date_percentage',
            'total_unicef_supplies',
            'total_unicef_supplies_currency',

        )

    def get_unicef_officers(self, obj):
        return PersonSerializer(obj.unicef_officers.filter(active=True), read_only=True, many=True).data

    def get_unicef_focal_point(self, obj):
        return PersonSerializer(obj.unicef_focal_point.filter(active=True), read_only=True, many=True).data

    def get_partner_focal_point(self, obj):
        return PersonSerializer(obj.partner_focal_point.filter(active=True), read_only=True, many=True).data

    def get_locations(self, obj):
        return ShortLocationSerializer(
            Location.objects.filter(
                indicator_location_data__indicator_report__progress_report__programme_document=obj
            ).distinct(),
            many=True
        ).data


class LLOutputSerializer(serializers.ModelSerializer):
    """
    Nests with LL output.
    """

    class Meta:
        model = LowerLevelOutput
        fields = (
            'id',
            'title',
        )


class CPOutputSerializer(serializers.ModelSerializer):
    """
    Nests with CP output
    """
    ll_outputs = LLOutputSerializer(many=True, read_only=True)

    class Meta:
        model = PDResultLink
        fields = (
            'id',
            'title',
            'll_outputs',
            'external_cp_output_id',
        )


class ProgrammeDocumentOutputSerializer(serializers.ModelSerializer):
    """
    Serializer for PD with indicator reports nested by output.
    """
    cp_outputs = CPOutputSerializer(many=True, read_only=True)

    class Meta:
        model = ProgrammeDocument
        fields = (
            'id',
            'title',
            'reference_number',
            'cp_outputs',
            'status',
            'external_id',
        )


class FinalReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinalReview
        exclude = ('id', 'progress_report')


class ProgressReportSimpleSerializer(serializers.ModelSerializer):
    programme_document = ProgrammeDocumentSimpleSerializer()
    reporting_period = serializers.SerializerMethodField()
    is_draft = serializers.SerializerMethodField()
    review_overall_status_display = serializers.CharField(
        source='get_review_overall_status_display')
    partner_name = serializers.SerializerMethodField()
    partner_vendor_number = serializers.SerializerMethodField()
    unicef_focal_points = serializers.SerializerMethodField()

    def get_partner_name(self, obj):
        return obj.programme_document.partner.title

    def get_partner_vendor_number(self, obj):
        return obj.programme_document.partner.vendor_number

    def get_unicef_focal_points(self, obj):
        return list(obj.programme_document.unicef_focal_point.values_list('name', flat=True))

    class Meta:
        model = ProgressReport
        fields = (
            'id',
            'report_type',
            'report_number',
            'is_final',
            'partner_contribution_to_date',
            'financial_contribution_to_date',
            'financial_contribution_currency',
            'challenges_in_the_reporting_period',
            'proposed_way_forward',
            'status',
            'reporting_period',
            'submission_date',
            'due_date',
            'is_draft',
            'review_date',
            'review_overall_status',
            'review_overall_status_display',
            'sent_back_feedback',
            'programme_document',
            'narrative',
            'partner_name',
            'partner_vendor_number',
            'unicef_focal_points',
            'reviewed_by_name',
            'reviewed_by_email',
            'reviewed_by_external_id'

        )

    def get_reporting_period(self, obj):
        return "%s - %s " % (
            obj.start_date.strftime(settings.PRINT_DATA_FORMAT),
            obj.end_date.strftime(settings.PRINT_DATA_FORMAT)
        ) if obj.start_date and obj.end_date else "No reporting period"

    def get_is_draft(self, obj):
        return obj.latest_indicator_report.is_draft if obj.latest_indicator_report else None


class ProgressReportSerializer(ProgressReportSimpleSerializer):
    programme_document = ProgrammeDocumentOutputSerializer()
    indicator_reports = serializers.SerializerMethodField()
    review_overall_status_display = serializers.CharField(source='get_review_overall_status_display')
    funds_received_to_date = serializers.SerializerMethodField()
    funds_received_to_date_currency = serializers.SerializerMethodField()
    funds_received_to_date_percentage = serializers.SerializerMethodField()
    submitted_by = serializers.SerializerMethodField()
    submitting_user = serializers.SerializerMethodField()
    partner_org_id = serializers.SerializerMethodField()
    partner_org_name = serializers.SerializerMethodField()
    partner_vendor_number = serializers.SerializerMethodField()
    unicef_focal_points = serializers.SerializerMethodField()

    def __init__(self, *args, **kwargs):
        request = kwargs.get('context', {}).get('request')
        self.llo_id = kwargs.get('llo_id') or request and request.GET.get('llo')
        self.location_id = kwargs.get('location_id') or request and request.GET.get('location')
        self.show_incomplete_only = kwargs.get('incomplete') or request and request.GET.get('incomplete')

        super().__init__(*args, **kwargs)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.is_final:
            if not hasattr(instance, 'final_review') or not instance.final_review:
                FinalReview.objects.create(progress_report=instance)
            data['final_review'] = FinalReviewSerializer(instance.final_review).data
        return data

    class Meta:
        model = ProgressReport
        fields = (
            'id',
            'report_type',
            'report_number',
            'is_final',
            'partner_contribution_to_date',
            'financial_contribution_to_date',
            'financial_contribution_currency',
            'partner_org_id',
            'partner_org_name',
            'partner_vendor_number',
            'unicef_focal_points',
            'challenges_in_the_reporting_period',
            'proposed_way_forward',
            'status',
            'reporting_period',
            'submission_date',
            'due_date',
            'is_draft',
            'review_date',
            'review_overall_status',
            'review_overall_status_display',
            'accepted_comment',
            'sent_back_feedback',
            'programme_document',
            'funds_received_to_date',
            'funds_received_to_date_currency',
            'funds_received_to_date_percentage',
            'indicator_reports',
            'submitted_by',
            'submitting_user',
            'is_final',
            'narrative',
            'reviewed_by_name',
            'reviewed_by_email',
            'reviewed_by_external_id'
        )

    def get_partner_org_id(self, obj):
        return obj.programme_document.partner.external_id

    def get_partner_org_name(self, obj):
        return obj.programme_document.partner.title

    def get_partner_vendor_number(self, obj):
        return obj.programme_document.partner.vendor_number

    def get_unicef_focal_points(self, obj):
        return list(obj.programme_document.unicef_focal_point.values_list('name', flat=True))

    def get_submitted_by(self, obj):
        return obj.submitted_by.display_name if obj.submitted_by else None

    def get_submitting_user(self, obj):
        return obj.submitting_user.display_name if obj.submitting_user else None

    def get_funds_received_to_date(self, obj):
        return obj.programme_document.funds_received_to_date

    def get_funds_received_to_date_currency(self, obj):
        return obj.programme_document.funds_received_to_date_currency

    def get_funds_received_to_date_percentage(self, obj):
        return obj.programme_document.funds_received_to_date_percentage

    def get_indicator_reports(self, obj):
        queryset = obj.indicator_reports.all()
        if self.llo_id and self.llo_id is not None:
            queryset = queryset.filter(reportable__object_id=self.llo_id)
        if self.location_id and self.location_id is not None:
            queryset = queryset.filter(reportable__locations__id=self.location_id)

        if self.show_incomplete_only in [1, "1", "true", "True", True]:
            queryset = filter(
                lambda x: not x.is_complete,
                queryset
            )

        return PDReportContextIndicatorReportSerializer(queryset, read_only=True, many=True).data

    def get_reporting_period(self, obj):
        return "%s - %s " % (
            obj.start_date.strftime(settings.PRINT_DATA_FORMAT),
            obj.end_date.strftime(settings.PRINT_DATA_FORMAT)
        ) if obj.start_date and obj.end_date else "No reporting period"

    def get_is_draft(self, obj):
        return obj.latest_indicator_report.is_draft if obj.latest_indicator_report else None


class ProgressReportUpdateSerializer(serializers.ModelSerializer):

    partner_contribution_to_date = serializers.CharField(max_length=2000, required=False, allow_blank=True)
    financial_contribution_to_date = serializers.CharField(
        max_length=2000,
        required=False,
        allow_blank=True,
    )
    financial_contribution_currency = serializers.ChoiceField(
        choices=CURRENCIES,
        allow_blank=True,
        allow_null=True,
    )
    challenges_in_the_reporting_period = serializers.CharField(max_length=2000, required=False, allow_blank=True)
    proposed_way_forward = serializers.CharField(max_length=2000, required=False, allow_blank=True)

    class Meta:
        model = ProgressReport
        fields = (
            'id',
            'partner_contribution_to_date',
            'financial_contribution_to_date',
            'financial_contribution_currency',
            'challenges_in_the_reporting_period',
            'proposed_way_forward',
        )


class ProgressReportSRUpdateSerializer(serializers.ModelSerializer):

    narrative = serializers.CharField(max_length=2000)

    class Meta:
        model = ProgressReport
        fields = (
            'id',
            'narrative',
        )


class ProgressReportFinalUpdateSerializer(ProgressReportUpdateSerializer):
    final_review = FinalReviewSerializer(required=False)

    class Meta(ProgressReportUpdateSerializer.Meta):
        fields = ProgressReportUpdateSerializer.Meta.fields + (
            "final_review",
        )

    def update(self, instance, validated_data):
        final_review = validated_data.pop('final_review', None)

        instance = super().update(instance, validated_data)
        if final_review:
            for key, value in final_review.items():
                setattr(instance.final_review, key, value)
            instance.final_review.save()

        return instance


class ProgressReportPullHFDataSerializer(serializers.ModelSerializer):
    report_name = serializers.SerializerMethodField()
    report_location_total = serializers.SerializerMethodField()

    def get_report_location_total(self, obj):
        indicator_report = self.context['indicator_report']

        target_hf_irs = obj.indicator_reports.filter(
            time_period_start__gte=obj.start_date,
            time_period_end__lte=obj.end_date,
            reportable=indicator_report.reportable,
        )

        calculated = {'c': 0, 'v': 0, 'd': 0}

        for ir in target_hf_irs:
            calculated['c'] += ir.total['c']
            calculated['v'] += ir.total['v']

            if indicator_report.reportable.blueprint.unit == IndicatorBlueprint.NUMBER:
                calculated['d'] = 1

            else:
                calculated['d'] += ir.total['d']

        return calculated

    def get_report_name(self, obj):
        return obj.report_type + str(obj.report_number)

    class Meta:
        model = ProgressReport
        fields = (
            'id',
            'report_name',
            'start_date',
            'end_date',
            'due_date',
            'report_location_total',
        )


class ProgressReportReviewSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[
        PROGRESS_REPORT_STATUS.sent_back,
        PROGRESS_REPORT_STATUS.accepted
    ])
    comment = serializers.CharField(required=False, allow_blank=True)
    overall_status = serializers.ChoiceField(required=False, choices=OVERALL_STATUS)
    reviewed_by_name = serializers.CharField(required=True)
    review_date = serializers.DateField()

    def validate(self, data):
        """
        Make sure status is only accepted or sent back. Also overall_status
        should be set if accepting
        """
        status = data['status']
        overall_status = data.get('overall_status', None)

        if status not in {
            PROGRESS_REPORT_STATUS.sent_back, PROGRESS_REPORT_STATUS.accepted
        }:
            raise serializers.ValidationError({
                'status': 'Report status should be accepted or sent back'
            })
        if overall_status == OVERALL_STATUS.no_status:
            raise serializers.ValidationError({
                'overall_status': 'Invalid overall status'
            })
        if self.instance.is_final and overall_status and \
                overall_status not in [FINAL_OVERALL_STATUS.met, FINAL_OVERALL_STATUS.constrained]:
            raise serializers.ValidationError({
                'overall_status': 'Overall status for a final report is invalid.'
            })

        if status == PROGRESS_REPORT_STATUS.accepted and overall_status is None:
            raise serializers.ValidationError({
                'overall_status': 'Overall status required when accepting a report'
            })
        if status == PROGRESS_REPORT_STATUS.sent_back and not data.get('comment'):
            raise serializers.ValidationError({
                'comment': 'Comment required when sending back report'
            })

        return data


class LLOutputSerializer(serializers.ModelSerializer):
    # id added explicitely here since it gets stripped out from validated_dat
    # as its read_only.
    # https://stackoverflow.com/questions/36473795/django-rest-framework-model-id-field-in-nested-relationship-serializer
    id = serializers.IntegerField()

    class Meta:
        model = LowerLevelOutput
        fields = (
            'id',
            'title'
        )


class LLOutputIndicatorsSerializer(serializers.Serializer):
    """
    Represents indicators grouped by LLO.
    """
    ll_output = LLOutputSerializer()
    indicators = IndicatorBlueprintSimpleSerializer(many=True)


class ProgrammeDocumentCalculationMethodsSerializer(serializers.Serializer):
    """
    To serialize data needed when viewing/setting calculation methods on
    indicators for a PD.
    """
    ll_outputs_and_indicators = LLOutputIndicatorsSerializer(many=True)


class ProgrammeDocumentProgressSerializer(serializers.ModelSerializer):
    """
    Serializer to show the progoress of a PD. This includes information
    around the CP output, LL output, and the latest progress report and its
    associated indicator reports as well.
    """
    frequency = serializers.CharField(source='get_frequency_display')
    sections = SectionSerializer(read_only=True, many=True)
    details = serializers.SerializerMethodField()
    latest_accepted_pr = serializers.SerializerMethodField()
    latest_accepted_pr_indicator_reports = serializers.SerializerMethodField()
    unicef_budget_cash = serializers.FloatField(source='total_unicef_cash')
    unicef_budget_cash_currency = serializers.CharField(source='total_unicef_cash_currency')
    unicef_budget_supplies = serializers.FloatField(source='in_kind_amount')
    unicef_budget_supplies_currency = serializers.CharField(source='in_kind_amount_currency')
    disbursement = serializers.FloatField(source='funds_received_to_date')
    disbursement_currency = serializers.CharField(source='funds_received_to_date_currency')
    disbursement_percent = serializers.FloatField(source='funds_received_to_date_percent')

    class Meta:
        model = ProgrammeDocument
        fields = (
            'id',
            'reference_number',
            'title',
            'start_date',
            'end_date',
            'frequency',
            'sections',
            'details',
            'latest_accepted_pr',
            'latest_accepted_pr_indicator_reports',
            'unicef_budget_cash',
            'unicef_budget_cash_currency',
            'unicef_budget_supplies',
            'unicef_budget_supplies_currency',
            'disbursement',
            'disbursement_currency',
            'disbursement_percent',
        )

    def get_details(self, obj):
        return ProgrammeDocumentOutputSerializer(obj).data

    def get_latest_accepted_pr(self, obj):
        qset = obj.progress_reports.filter(
            status=PROGRESS_REPORT_STATUS.accepted,
            report_type="QPR").order_by('-end_date')
        if qset:
            return ProgressReportSimpleSerializer(
                instance=qset[0], read_only=True).data
        else:
            return {}

    def get_latest_accepted_pr_indicator_reports(self, obj):
        """
        Return data about the latest accepted indicator report associated
        with this PD (if any).
        """
        qset = obj.progress_reports.filter(
            status=PROGRESS_REPORT_STATUS.accepted,
            report_type="QPR").order_by('-end_date')
        if qset:
            return PDReportContextIndicatorReportSerializer(
                instance=qset[0].indicator_reports.all(),
                read_only=True, many=True).data
        else:
            return []

# PMP API Serializers


class PMPPDPersonSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(validators=[EmailValidator(
        queryset=Person.objects.all(),
    )])
    phone_num = serializers.CharField(
        source='phone_number',
        required=False,
        allow_blank=True,
        allow_null=True
    )

    class Meta:
        model = Person
        fields = (
            "name",
            "title",
            "phone_num",
            "email",
            "active",
        )
        extra_kwargs = {'name': {'required': True}}


class PMPProgrammeDocumentSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='external_id')
    offices = serializers.CharField(source='unicef_office')
    number = serializers.CharField(source='reference_number')
    cso_budget = serializers.FloatField(source='cso_contribution')
    cso_budget_currency = serializers.ChoiceField(
        choices=CURRENCIES, allow_blank=True, allow_null=True, source="cso_contribution_currency"
    )
    unicef_budget_cash = serializers.FloatField(source='total_unicef_cash')
    unicef_budget_supplies = serializers.FloatField(source='in_kind_amount')
    unicef_budget = serializers.FloatField(source='budget')
    unicef_budget_currency = serializers.ChoiceField(
        choices=CURRENCIES, allow_blank=True, allow_null=True, source="budget_currency"
    )
    disbursement = serializers.FloatField(source='funds_received_to_date', required=False, allow_null=True)
    disbursement_percent = serializers.FloatField(source='funds_received_to_date_percent', required=False, allow_null=True)
    funds_received_currency = serializers.ChoiceField(
        choices=CURRENCIES, allow_blank=True, allow_null=True, required=False, source="funds_received_to_date_currency"
    )
    status = serializers.ChoiceField(choices=PD_STATUS)
    start_date = serializers.DateField(required=False, allow_null=True)
    end_date = serializers.DateField(required=False, allow_null=True)
    partner = serializers.PrimaryKeyRelatedField(
        queryset=Partner.objects.all())
    workspace = serializers.PrimaryKeyRelatedField(
        queryset=Workspace.objects.all())
    amendments = serializers.JSONField(allow_null=True)
    document_type = serializers.ChoiceField(choices=PD_DOCUMENT_TYPE, required=False)

    def validate(self, attrs):
        validated_data = super().validate(attrs)

        validated_data['budget'] = sum([
            validated_data['cso_contribution'],
            validated_data['total_unicef_cash'],
            validated_data['in_kind_amount'],
        ])

        validated_data['total_unicef_cash_currency'] = validated_data['cso_contribution_currency']
        validated_data['in_kind_amount_currency'] = validated_data['cso_contribution_currency']
        validated_data['funds_received_to_date_currency'] = validated_data['cso_contribution_currency']

        return validated_data

    class Meta:
        model = ProgrammeDocument
        fields = (
            "id",
            "status",
            "agreement",
            "title",
            "offices",
            "number",
            "partner",
            "start_date",
            "end_date",
            "cso_budget",
            "cso_budget_currency",
            "unicef_budget",
            "unicef_budget_currency",
            "unicef_budget_cash",
            "unicef_budget_supplies",
            "funds_received_currency",
            "workspace",
            "amendments",
            "external_business_area_code",
            "disbursement",
            "disbursement_percent",
            "document_type",
        )
        validators = [
            UniqueTogetherValidator(
                queryset=ProgrammeDocument.objects.all(),
                fields=[
                    "id",
                    "external_business_area_code",
                    "workspace",
                ],
            )
        ]


class PMPLLOSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='external_id')
    cp_output = serializers.PrimaryKeyRelatedField(
        queryset=PDResultLink.objects.all())

    class Meta:
        model = LowerLevelOutput
        fields = (
            'id',
            'title',
            'cp_output',
            'external_business_area_code',
        )
        validators = [
            UniqueTogetherValidator(
                queryset=LowerLevelOutput.objects.all(),
                fields=[
                    "id",
                    "external_business_area_code",
                    "cp_output",
                ],
            )
        ]


class PMPSectionSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='external_id')

    class Meta:
        model = Section
        fields = (
            'id',
            'name',
            'external_business_area_code',
        )
        validators = [
            UniqueTogetherValidator(
                queryset=Section.objects.all(),
                fields=[
                    "id",
                    "external_business_area_code",
                    "name",
                ],
            )
        ]


class BasePMPReportingPeriodDatesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportingPeriodDates
        validators = [
            UniqueTogetherValidator(
                queryset=ReportingPeriodDates.objects.all(),
                fields=[
                    "id",
                    "external_business_area_code",
                    "report_type",
                    "programme_document",
                ],
            ),
        ]


class PMPReportingPeriodDatesSerializer(BasePMPReportingPeriodDatesSerializer):
    id = serializers.CharField(source='external_id')
    programme_document = serializers.PrimaryKeyRelatedField(
        queryset=ProgrammeDocument.objects.all())

    class Meta(BasePMPReportingPeriodDatesSerializer.Meta):
        fields = (
            'id',
            'start_date',
            'end_date',
            'due_date',
            'report_type',
            'programme_document',
            'external_business_area_code',
        )


class PMPReportingPeriodDatesSRSerializer(BasePMPReportingPeriodDatesSerializer):
    id = serializers.CharField(source='external_id')
    programme_document = serializers.PrimaryKeyRelatedField(
        queryset=ProgrammeDocument.objects.all())

    class Meta(BasePMPReportingPeriodDatesSerializer.Meta):
        fields = (
            'id',
            'due_date',
            'report_type',
            'description',
            'programme_document',
            'external_business_area_code',
        )


class PMPPDResultLinkSerializer(serializers.ModelSerializer):
    result_link = serializers.CharField(source='external_id')
    id = serializers.CharField(source='external_cp_output_id')
    programme_document = serializers.PrimaryKeyRelatedField(
        queryset=ProgrammeDocument.objects.all())

    class Meta:
        model = PDResultLink
        # we neeed to align this
        fields = (
            'id',
            'title',
            'result_link',
            'programme_document',
            'external_business_area_code',
        )
        validators = [
            UniqueTogetherValidator(
                queryset=PDResultLink.objects.all(),
                fields=[
                    "result_link",
                    "external_business_area_code",
                    "id",
                ],
            ),
        ]


class ProgressReportAttachmentSerializer(serializers.ModelSerializer):
    size = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    path = serializers.FileField(source='file', max_length=500)

    def get_file_name(self, obj):
        return obj.file.name.split('/')[-1] if obj.file else None

    def get_size(self, obj):
        return obj.file.size if obj.file else None

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        if instance.file and "http" not in instance.file.url:
            representation['path'] = settings.WWW_ROOT[:-1] + instance.file.url

        return representation

    class Meta:
        model = ProgressReportAttachment
        fields = (
            'id',
            'path',
            'size',
            'file_name',
            'type',
        )


class ImportRealmSerializer(serializers.Serializer):
    country = serializers.SlugRelatedField(queryset=Workspace.objects.all(), slug_field='external_id')
    organization = serializers.SlugRelatedField(queryset=Partner.objects.all(), slug_field='vendor_number')
    group = serializers.SlugRelatedField(queryset=Group.objects.all(), slug_field='name')

    @cached_property
    def allowed_groups(self):
        return [t[0] for t in PRP_IP_ROLE_TYPES]

    def map_group(self, value):
        return {
            "IP Authorized Officer": PRP_IP_ROLE_TYPES.ip_authorized_officer,
            "IP Editor": PRP_IP_ROLE_TYPES.ip_editor,
            "IP Viewer": PRP_IP_ROLE_TYPES.ip_viewer,
            "IP Admin": PRP_IP_ROLE_TYPES.ip_admin,
        }.get(value, value)

    def run_validation(self, data=None):
        if 'group' in data:
            data['group'] = self.map_group(data['group'])

        return super(ImportRealmSerializer, self).run_validation(data)


class ImportUserRealmsSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    realms = serializers.ListSerializer(child=ImportRealmSerializer(), allow_empty=True)

    class Meta:
        model = get_user_model()
        fields = (
            'email',
            'first_name',
            'middle_name',
            'last_name',
            'realms',
        )

    def validate_email(self, value):
        if value.endswith('@unicef.org'):
            raise ValidationError('UNICEF users cannot be added through Access Management Portal.')
        return value

    def save_realms(self, user, realms):
        realms_set = {
            (realm['country'].id, realm['organization'].id, realm['group'].id)
            for realm in realms
        }
        user_realms = user.realms.all()
        user_realms_dict = {
            (realm.workspace_id, realm.partner_id, realm.group_id): realm
            for realm in user_realms
        }
        realms_to_create = []
        realms_to_activate = []
        realms_to_deactivate = []

        for workspace_id, organization_id, group_id in realms_set:
            realm_key = (workspace_id, organization_id, group_id)
            if realm_key in user_realms_dict:
                user_realm = user_realms_dict[realm_key]
                if not user_realm.is_active:
                    realms_to_activate.append(user_realm)
            else:
                realms_to_create.append(Realm(
                    user=user,
                    workspace_id=workspace_id,
                    partner_id=organization_id,
                    group_id=group_id,
                ))

        for realm_key, realm in user_realms_dict.items():
            if realm_key not in realms_set:
                realms_to_deactivate.append(realm)

        Realm.objects.bulk_create(realms_to_create)
        Realm.objects.filter(pk__in=[realm.id for realm in realms_to_activate]).update(is_active=True)
        Realm.objects.filter(pk__in=[realm.id for realm in realms_to_deactivate]).update(is_active=False)
        user.update_active_state()

    @transaction.atomic
    def create(self, validated_data):
        validated_data['username'] = validated_data['email']

        realms = validated_data.pop('realms')
        if not realms:
            raise ValidationError('Cannot create a user without realms.')

        first_realm = realms[0]
        validated_data['workspace_id'] = first_realm['country'].id
        validated_data['partner_id'] = first_realm['organization'].id

        instance = super().create(validated_data)
        self.save_realms(instance, realms)
        return instance

    @transaction.atomic
    def update(self, instance, validated_data):
        realms = validated_data.pop('realms')
        instance = super().update(instance, validated_data)
        self.save_realms(instance, realms)
        return instance
