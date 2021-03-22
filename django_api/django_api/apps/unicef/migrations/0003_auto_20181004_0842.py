# Generated by Django 1.11.11 on 2018-10-04 08:42
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('unicef', '0002_auto_20180917_1356'),
    ]

    operations = [
        migrations.AlterField(
            model_name='progressreport',
            name='challenges_in_the_reporting_period',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='progressreport',
            name='narrative',
            field=models.TextField(blank=True, null=True, verbose_name='Narrative'),
        ),
        migrations.AlterField(
            model_name='progressreport',
            name='partner_contribution_to_date',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='progressreport',
            name='proposed_way_forward',
            field=models.TextField(blank=True, null=True),
        ),
    ]
