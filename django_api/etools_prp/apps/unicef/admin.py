from django.conf.urls import url
from django.contrib import admin, messages
from django.contrib.admin import helpers
from django.db.models import F
from django.http import HttpResponseRedirect
from django.shortcuts import redirect
from django.template.response import TemplateResponse
from django.urls import reverse
from django.utils.translation import gettext as _

from admin_extra_urls.api import button, ExtraUrlMixin

from etools_prp.apps.core.api import PMP_API
from etools_prp.apps.core.models import Workspace
from etools_prp.apps.core.tasks import process_period_reports, process_workspaces
from etools_prp.apps.indicator.models import IndicatorLocationData
from etools_prp.apps.unicef.models import (
    LowerLevelOutput,
    PDResultLink,
    Person,
    ProgrammeDocument,
    ProgressReport,
    ReportingPeriodDates,
    Section,
)
from etools_prp.apps.unicef.tasks import process_programme_documents


class ProgrammeDocumentAdmin(ExtraUrlMixin, admin.ModelAdmin):
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

    @button(css_class="btn-warning auto-disable")
    def reconcile(self, request, pk):
        return self._reconcile(request, pk, False)

    @button(css_class="btn-error auto-disable", permission=lambda request, obj: request.user.is_superuser)
    def force_reconcile(self, request, pk):
        return self._reconcile(request, pk, True)

    def _reconcile(self, request, pk, force):
        obj = self.get_object(request, pk)
        dates = obj.reporting_periods
        api = PMP_API()
        pd = api.programme_documents(
            business_area_code=obj.workspace.business_area_code, id=obj.external_id
        )['results'][0]

        if pd:
            reporting_requirements = pd['reporting_requirements']
            report_populated = []
            reports_for_deletion = []
            dates_for_deletion = []
            pmp_date_match = []
            for rep_req in reporting_requirements:
                matching_date = dates.filter(start_date=rep_req['start_date'], end_date=rep_req['end_date']).first()
                if matching_date:
                    pmp_date_match.append(matching_date.pk)
                else:
                    progress_report = obj.progress_reports.filter(
                        start_date=rep_req['start_date'], end_date=rep_req['end_date']).first()
                    if progress_report:
                        data = IndicatorLocationData.objects.filter(
                            indicator_report__progress_report=progress_report).exclude(modified=F('created'))
                        if data:
                            report_populated.append(progress_report)
                        else:
                            reports_for_deletion.append(progress_report.pk)
            for unmatching_date in obj.reporting_periods.exclude(pk__in=pmp_date_match):
                progress_report = obj.progress_reports.filter(
                    start_date=unmatching_date.start_date, end_date=unmatching_date.end_date).first()
                if progress_report:
                    data = IndicatorLocationData.objects.filter(
                        indicator_report__progress_report=progress_report).exclude(modified=F('created'))
                    if data:
                        report_populated.append(progress_report)
                    else:
                        reports_for_deletion.append(progress_report.pk)
                        dates_for_deletion.append(unmatching_date.pk)
                else:
                    dates_for_deletion.append(unmatching_date.pk)

            prs = ProgressReport.objects.filter(pk__in=reports_for_deletion)
            rpd = ReportingPeriodDates.objects.filter(pk__in=dates_for_deletion)

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
                'deletable_objects_prs': prs,
                'deletable_objects_rpd': rpd,
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
