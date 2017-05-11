from django.contrib import admin

from .models import (
    ProgressReport,
    ProgrammeDocument,
    CountryProgrammeOutput,
    LowerLevelOutput,
)

admin.site.register(ProgressReport)
admin.site.register(ProgrammeDocument)
admin.site.register(CountryProgrammeOutput)
admin.site.register(LowerLevelOutput)
