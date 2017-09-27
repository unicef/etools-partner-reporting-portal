from django.contrib import admin

from .models import (
    ProgressReport,
    ProgrammeDocument,
    CountryProgrammeOutput,
    LowerLevelOutput,
    Section,
    Person,
    ReportingPeriodDates,
)


class ProgrammeDocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'reference_number', 'agreement', 'partner',
                    'status', 'workspace', 'external_id')
    list_filter = ('workspace', 'status', 'partner')
    search_fields = ('title', 'reference_number', 'agreement')


class ProgressReportAdmin(admin.ModelAdmin):
    list_display = ('programme_document', 'status', 'submitted_by',
                    'start_date', 'end_date', 'due_date', 'submission_date',
                    'review_date')
    list_filter = ('status', 'programme_document__status', 'programme_document')

class ReportingPeriodDatesAdmin(admin.ModelAdmin):
    list_display = ('programme_document', 'start_date', 'end_date', 'due_date')
    search_fields = ('programme_document__title', )


admin.site.register(ProgrammeDocument, ProgrammeDocumentAdmin)
admin.site.register(ProgressReport, ProgressReportAdmin)
admin.site.register(CountryProgrammeOutput)
admin.site.register(LowerLevelOutput)
admin.site.register(Section)
admin.site.register(Person)
admin.site.register(ReportingPeriodDates, ReportingPeriodDatesAdmin)
