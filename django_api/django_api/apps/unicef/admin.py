from django.contrib import admin

from .models import (
    LowerLevelOutput,
    PDResultLink,
    Person,
    ProgrammeDocument,
    ProgressReport,
    ReportingPeriodDates,
    Section,
)


class ProgrammeDocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'reference_number', 'agreement', 'partner',
                    'status', 'workspace', 'external_id')
    list_filter = ('status', 'workspace',)
    search_fields = ('title', 'reference_number', 'agreement', 'partner__title', 'workspace__title')
    raw_id_fields = [
        'unicef_officers',
        'unicef_focal_point',
        'partner_focal_point',
        'workspace',
        'partner',
        'sections',
    ]


class ProgressReportAdmin(admin.ModelAdmin):
    list_display = ('programme_document', 'status', 'submitted_by',
                    'start_date', 'end_date', 'due_date', 'submission_date',
                    'review_date', 'report_type', 'report_number')
    list_filter = (
        'status',
        'programme_document__status',)
    search_fields = ('programme_document__title', )
    raw_id_fields = [
        'programme_document',
        'submitted_by',
        'submitting_user',
    ]


class ReportingPeriodDatesAdmin(admin.ModelAdmin):
    list_display = ('programme_document', 'report_type', 'start_date', 'end_date', 'due_date')
    search_fields = ('programme_document__title', )
    list_filter = [
        'report_type',
    ]
    raw_id_fields = [
        'programme_document',
    ]


class PDResultLinkAdmin(admin.ModelAdmin):
    list_display = ('title', 'programme_document', 'external_cp_output_id',
                    'external_id')
    search_fields = [
        'title',
        'programme_document__title',
        'external_id',
        'external_cp_output_id',
    ]
    raw_id_fields = [
        'programme_document',
    ]


class LowerLevelOutputAdmin(admin.ModelAdmin):
    list_display = ('title', 'active', 'cp_output')
    search_fields = ('title', 'cp_output__title')
    raw_id_fields = [
        'cp_output',
    ]


admin.site.register(ProgrammeDocument, ProgrammeDocumentAdmin)
admin.site.register(ProgressReport, ProgressReportAdmin)
admin.site.register(PDResultLink, PDResultLinkAdmin)
admin.site.register(LowerLevelOutput, LowerLevelOutputAdmin)
admin.site.register(Section)
admin.site.register(Person)
admin.site.register(ReportingPeriodDates, ReportingPeriodDatesAdmin)
