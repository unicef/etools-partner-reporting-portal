from django.contrib import admin

from .models import (
    IndicatorBlueprint,
    Reportable,
    ReportableLocationGoal,
    IndicatorReport,
    IndicatorLocationData,
    Disaggregation,
    DisaggregationValue,
    ReportingEntity,
)


class IndicatorBlueprintAdmin(admin.ModelAdmin):
    list_display = ('title', 'unit', 'code', 'disaggregatable', 'display_type',
                    'external_id')
    list_filter = ('disaggregatable', 'unit',
                   'calculation_formula_across_periods',
                   'calculation_formula_across_locations',
                   'display_type')
    search_fields = ('title', 'description', 'code')


class ReportableLocationGoalInline(admin.StackedInline):
    model = ReportableLocationGoal
    extra = 1
    min_num = 0


class ReportableAdmin(admin.ModelAdmin):
    inlines = (ReportableLocationGoalInline, )
    list_display = ('blueprint', 'active', 'target', 'baseline', 'total',
                    'parent_indicator', 'frequency', 'assumptions',
                    'means_of_verification', 'is_cluster_indicator',
                    'cs_dates', 'content_object', 'content_type', 'external_id')
    list_filter = ('is_cluster_indicator', 'content_type')
    search_fields = ('context_code', 'means_of_verification', 'target',
                     'baseline', 'object_id', 'blueprint__title')


class IndicatorReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'report_status', 'progress_report',
                    'time_period_start', 'time_period_end', 'due_date',
                    'submission_date', 'frequency', 'total', 'reportable')
    list_filter = ('frequency', 'report_status', 'overall_status')
    search_fields = ('title', 'narrative_assessment', 'remarks',
                     'reportable__blueprint__title')


class IndicatorLocationDataAdmin(admin.ModelAdmin):
    list_display = ('indicator_report', 'location', 'num_disaggregation',
                    'level_reported')
    list_filter = ('num_disaggregation', 'level_reported',)
    search_fields = ('indicator_report__title',)


class DisaggregationAdmin(admin.ModelAdmin):
    list_display = ('name', 'response_plan', 'active', 'external_id')
    list_filter = ('response_plan', 'active')
    search_fields = ('name',)


class DisaggregationValueAdmin(admin.ModelAdmin):
    list_display = ('disaggregation', 'value', 'external_id')
    list_filter = ('disaggregation',)
    search_fields = ('value',)


class ReportingEntityAdmin(admin.ModelAdmin):
    list_display = ('title',)
    search_fields = ('title',)


admin.site.register(IndicatorBlueprint, IndicatorBlueprintAdmin)
admin.site.register(Reportable, ReportableAdmin)
admin.site.register(IndicatorReport, IndicatorReportAdmin)
admin.site.register(IndicatorLocationData, IndicatorLocationDataAdmin)
admin.site.register(Disaggregation, DisaggregationAdmin)
admin.site.register(DisaggregationValue, DisaggregationValueAdmin)
admin.site.register(ReportingEntity, ReportingEntityAdmin)
