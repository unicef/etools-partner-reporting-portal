from datetime import datetime

from django.contrib import admin, messages
from django.contrib.admin import helpers
from django.db.models import F
from django.http import HttpResponseRedirect
from django.shortcuts import redirect
from django.template.response import TemplateResponse
from django.urls import re_path, reverse
from django.utils.translation import gettext as _

from admin_extra_buttons.api import button, ExtraButtonsMixin

from etools_prp.apps.core.api import PMP_API
from etools_prp.apps.core.common import SR_TYPE
from etools_prp.apps.core.models import Workspace
from etools_prp.apps.core.tasks import process_period_reports, process_workspaces
from etools_prp.apps.indicator.models import IndicatorLocationData
from etools_prp.apps.unicef.models import (
    FinalReview,
    GPDProgressReport,
    LowerLevelOutput,
    PDResultLink,
    Person,
    ProgrammeDocument,
    ProgressReport,
    ReportingPeriodDates,
    Section,
)
from etools_prp.apps.unicef.tasks import process_programme_documents


class ProgrammeDocumentAdmin(ExtraButtonsMixin, admin.ModelAdmin):
    list_display = ('title', 'reference_number', 'agreement', 'partner',
                    'status', 'workspace', 'external_id')
    list_filter = ('status', 'document_type', 'workspace',)
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

    def _check_superuser_permission(self, request, obj):
        return request.user.is_superuser

    @button(css_class="btn-warning auto-disable")
    def reconcile(self, request, pk):
        return self._reconcile(request, pk, False)

    @button(css_class="btn-error auto-disable", permission=_check_superuser_permission)
    def force_reconcile(self, request, pk):
        return self._reconcile(request, pk, True)

    def _reconcile(self, request, pk, force):
        obj = self.get_object(request, pk)
        api = PMP_API()
        pd = api.programme_documents(
            business_area_code=obj.workspace.business_area_code, id=obj.external_id
        )['results'][0]

        if pd:
            old_progress_report = obj.progress_reports.values('pk', 'start_date', 'end_date', 'due_date', 'report_type')

            report_populated = []
            reports_for_deletion = []
            pmp_date_match = []

            for rep_req in old_progress_report:
                if rep_req['report_type'] == SR_TYPE:
                    due_date = rep_req['due_date'].strftime('%Y-%m-%d')
                    matching_date = list(filter(lambda x: x['due_date'] == due_date, pd['special_reports']))
                else:
                    start_date = rep_req['start_date'].strftime('%Y-%m-%d')
                    end_date = rep_req['end_date'].strftime('%Y-%m-%d')
                    matching_date = list(filter(lambda x:
                                                x['start_date'] == start_date and
                                                x['end_date'] == end_date and
                                                x['report_type'] == rep_req['report_type'],
                                                pd['reporting_requirements']))
                if matching_date:
                    pmp_date_match.append(rep_req['pk'])

            for unmatching_report in obj.progress_reports.exclude(pk__in=pmp_date_match):
                future_reports = obj.progress_reports.filter(report_type=unmatching_report.report_type)
                if unmatching_report.report_type == SR_TYPE:
                    future_reports = future_reports.filter(due_date__gte=unmatching_report.due_date)
                else:
                    future_reports = future_reports.filter(start_date__gte=unmatching_report.start_date)

                data = IndicatorLocationData.objects.filter(
                    indicator_report__progress_report__in=future_reports).exclude(modified=F('created'))
                reports_for_deletion.extend([unmatching_report.pk for unmatching_report in future_reports])
                if data:
                    report_populated.extend(future_reports)
            prs = ProgressReport.objects.filter(pk__in=reports_for_deletion)

            deleted_dates_pk = []
            for date in pd['reporting_requirements']:
                start_date = datetime.strptime(date['start_date'], '%Y-%m-%d')
                end_date = datetime.strptime(date['end_date'], '%Y-%m-%d')
                matching_date = obj.reporting_periods.exclude(report_type=SR_TYPE).filter(start_date=start_date, end_date=end_date)
                if matching_date:
                    deleted_dates_pk.append(matching_date.first().pk)

            for date in pd['special_reports']:
                due_date = datetime.strptime(date['due_date'], '%Y-%m-%d')
                matching_date = obj.reporting_periods.filter(report_type=SR_TYPE, due_date=due_date)
                if matching_date:
                    deleted_dates_pk.append(matching_date.first().pk)

            if deleted_dates_pk:
                rpd = ReportingPeriodDates.objects.filter(programme_document=obj).exclude(pk__in=deleted_dates_pk)
            else:
                rpd = ReportingPeriodDates.objects.none()
            if not (prs or rpd):
                messages.add_message(request, messages.INFO, 'No need to reconcile! All good')
                return HttpResponseRedirect(reverse('admin:unicef_programmedocument_change', args=[obj.pk]))

            elif report_populated and not force:
                messages.add_message(request, messages.ERROR, 'Cannot reconcile, draft report data exist')
                title = _("Forbidden: draft report data exist")
            else:
                title = _("Are you sure?")
                if request.POST.get('post'):
                    messages.add_message(request, messages.WARNING, f'{obj} has been reconcilied')

                    prs.delete()
                    rpd.delete()
                    process_period_reports.delay()
                    return HttpResponseRedirect(reverse('admin:unicef_programmedocument_change', args=[obj.pk]))
                else:
                    if report_populated:
                        messages.add_message(request, messages.ERROR, 'Important: Report data will be deleted!')
                    else:
                        messages.add_message(request, messages.WARNING, 'Following records will be deleted')

            context = {
                'perms_lacking': report_populated and not force,
                'opts': self.model._meta,
                'title': title,
                'obj': obj,
                'deletable_objects': (prs, rpd),
                'queryset': None,
                'action_checkbox_name': helpers.ACTION_CHECKBOX_NAME,
                'media': self.media,
            }
            return TemplateResponse(request, "admin/reconcile/reconcile_deleted.html", context)

        messages.add_message(request, messages.INFO, 'Cannot find data in eTools')
        return HttpResponseRedirect(reverse('admin:unicef_programmedocument_change', args=[obj.pk]))

    def get_urls(self):
        urls = super().get_urls()
        extra_urls = [
            re_path(
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
            self.message_user(
                request,
                "Need to select a Country, use the Country filters",
            )
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


class GPDProgressReportAdminInline(admin.StackedInline):
    model = GPDProgressReport


class FinalReviewAdminInline(admin.StackedInline):
    model = FinalReview


class ProgressReportAdmin(admin.ModelAdmin):
    list_display = ('programme_document', 'report_type', 'status',
                    'submitted_by', 'start_date', 'end_date', 'due_date', 'submission_date',
                    'review_date', 'report_number')
    list_filter = ('status', 'report_type', 'programme_document__status', 'programme_document__document_type')
    search_fields = ('programme_document__title', 'programme_document__reference_number')
    raw_id_fields = [
        'programme_document',
        'submitted_by',
        'submitting_user',
    ]
    inlines = [GPDProgressReportAdminInline, FinalReviewAdminInline]


class ReportingPeriodDatesAdmin(admin.ModelAdmin):
    list_display = ('programme_document', 'report_type', 'start_date', 'end_date', 'due_date')
    search_fields = ('programme_document__title', 'programme_document__reference_number')
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


class PersonAdmin(admin.ModelAdmin):
    list_display = ('name', 'title', 'active')
    search_fields = ('name', 'title', 'email')
    list_filter = ('active', )


class SectionAdmin(admin.ModelAdmin):
    list_display = ('name', )
    search_fields = ('name', )


admin.site.register(ProgrammeDocument, ProgrammeDocumentAdmin)
admin.site.register(ProgressReport, ProgressReportAdmin)
admin.site.register(PDResultLink, PDResultLinkAdmin)
admin.site.register(LowerLevelOutput, LowerLevelOutputAdmin)
admin.site.register(Section, SectionAdmin)
admin.site.register(Person, PersonAdmin)
admin.site.register(ReportingPeriodDates, ReportingPeriodDatesAdmin)
