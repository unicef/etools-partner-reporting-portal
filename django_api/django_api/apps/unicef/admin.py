from django.conf.urls import url
from django.contrib import admin
from django.db import connection
from django.shortcuts import redirect

from core.models import Workspace
from core.tasks import process_period_reports, process_workspaces
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
    change_list_template = "admin/unicef/change_list.html"

    def get_urls(self):
        urls = super().get_urls()
        extra_urls = [
            url(
                r"sync-and-process/",
                self.admin_site.admin_view(self.sync_and_process),
                name="sync-process-pds",
            ),
        ]
        return extra_urls + urls

    def sync_and_process(self, request):
        # sync programme documents and process them for current workplace
        try:
            workspace = Workspace.objects.get(
                pk=request.GET.get("workspace__id__exact"),
            )
        except Workspace.DoesNotExist:
            fast = area = False
        else:
            fast = True
            area = workspace.business_area_code
        s = process_programme_documents.s(
            fast=fast,
            area=area,
        )
        s.link(process_workspaces.si())
        s.link(process_period_reports.si())
        self.message_user(
            request,
            "Initiated the syncing and processing of PDs for {}".format(
                workspace if area else "All Countries",
            ),
        )
        return redirect("admin:unicef_programmedocument_changelist")


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
