# Generated by Django 1.11.15 on 2018-12-04 00:13
from django.db import migrations


def forwards_func(apps, schema_editor):
    ProgrammeDocument = apps.get_model("unicef", "ProgrammeDocument")
    ReportingPeriodDates = apps.get_model("unicef", "ReportingPeriodDates")
    PDResultLink = apps.get_model("unicef", "PDResultLink")
    LowerLevelOutput = apps.get_model("unicef", "LowerLevelOutput")

    for item in ProgrammeDocument.objects.all():
        item.external_business_area_code = item.workspace.business_area_code
        item.save()

    for item in ReportingPeriodDates.objects.all():
        item.external_business_area_code = item.programme_document.workspace.business_area_code
        item.save()

    for item in PDResultLink.objects.all():
        item.external_business_area_code = item.programme_document.workspace.business_area_code
        item.save()

    for item in LowerLevelOutput.objects.all():
        item.external_business_area_code = item.cp_output.programme_document.workspace.business_area_code
        item.save()


def reverse_func(apps, schema_editor):
    ProgrammeDocument = apps.get_model("unicef", "ProgrammeDocument")
    ReportingPeriodDates = apps.get_model("unicef", "ReportingPeriodDates")
    PDResultLink = apps.get_model("unicef", "PDResultLink")
    LowerLevelOutput = apps.get_model("unicef", "LowerLevelOutput")

    ProgrammeDocument.objects.all().update(external_business_area_code=None)
    ReportingPeriodDates.objects.all().update(external_business_area_code=None)
    PDResultLink.objects.all().update(external_business_area_code=None)
    LowerLevelOutput.objects.all().update(external_business_area_code=None)


class Migration(migrations.Migration):

    dependencies = [
        ('unicef', '0005_auto_20181204_0013'),
    ]

    operations = [
        migrations.RunPython(forwards_func, reverse_func),
    ]
