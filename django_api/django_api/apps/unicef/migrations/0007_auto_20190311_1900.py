# Generated by Django 1.11.20 on 2019-03-11 19:00
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('unicef', '0006_auto_20181204_0013'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='reportingperioddates',
            unique_together=set([('external_id', 'external_business_area_code', 'report_type', 'programme_document')]),
        ),
    ]
