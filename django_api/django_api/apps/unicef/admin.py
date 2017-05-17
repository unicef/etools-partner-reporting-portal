from django.contrib import admin

from .models import (
    ProgressReport,
    ProgrammeDocument,
    CountryProgrammeOutput,
    LowerLevelOutput,
    Section,
)

admin.site.register(ProgressReport)
admin.site.register(ProgrammeDocument)
admin.site.register(CountryProgrammeOutput)
admin.site.register(LowerLevelOutput)
admin.site.register(Section)