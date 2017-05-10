from django.contrib import admin

from .models import (
    Cluster,
    ClusterObjective,
    ClusterActivity,
)

admin.site.register(Cluster)
admin.site.register(ClusterObjective)
admin.site.register(ClusterActivity)