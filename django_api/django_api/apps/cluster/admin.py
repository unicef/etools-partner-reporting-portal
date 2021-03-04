from django.contrib import admin

from .models import Cluster, ClusterActivity, ClusterObjective


class ClusterAdmin(admin.ModelAdmin):
    list_display = ('type', 'title', 'response_plan')
    list_filter = ('type', 'response_plan', 'response_plan__workspace')
    search_fields = ('type', 'imported_type', 'external_id', 'external_source', 'response_plan__workspace__title')


class ClusterActivityAdmin(admin.ModelAdmin):
    list_display = ('title', 'cluster_objective')
    search_fields = (
        'title', 'external_id', 'external_source',
        'cluster_objective__title', 'cluster_objective__cluster__type',
        'cluster_objective__cluster__imported_type'
    )
    raw_id_fields = ('cluster_objective', 'locations')


class ClusterObjectiveAdmin(admin.ModelAdmin):
    list_display = ('title', 'cluster')
    search_fields = ('title', 'external_id', 'external_source', 'cluster__type', 'cluster__imported_type')
    raw_id_fields = ('cluster', 'locations')


admin.site.register(Cluster, ClusterAdmin)
admin.site.register(ClusterObjective, ClusterObjectiveAdmin)
admin.site.register(ClusterActivity, ClusterActivityAdmin)
