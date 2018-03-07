from django.contrib import admin

from .models import (
    Cluster,
    ClusterObjective,
    ClusterActivity,
)


class ClusterAdmin(admin.ModelAdmin):
    list_display = ('type', 'title', 'response_plan')
    list_filter = ('type', 'response_plan', 'response_plan__workspace')


class ClusterActivityAdmin(admin.ModelAdmin):
    list_display = ('title', 'cluster_objective')
    list_filter = ('cluster_objective', )


admin.site.register(Cluster, ClusterAdmin)
admin.site.register(ClusterObjective)
admin.site.register(ClusterActivity, ClusterActivityAdmin)
