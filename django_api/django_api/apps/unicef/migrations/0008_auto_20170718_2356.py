# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-07-18 23:56
from __future__ import unicode_literals

import datetime
import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('unicef', '0007_auto_20170706_1830'),
    ]

    operations = [
        migrations.AddField(
            model_name='programmedocument',
            name='cs_dates',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.DateField(), default=list, size=None),
        ),
        migrations.AddField(
            model_name='progressreport',
            name='end_date',
            field=models.DateField(default=datetime.date(2017, 7, 18), verbose_name='End Date'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='progressreport',
            name='start_date',
            field=models.DateField(default=datetime.date(2017, 7, 18), verbose_name='Start Date'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='programmedocument',
            name='frequency',
            field=models.CharField(choices=[('Wee', 'Weekly'), ('Mon', 'Monthly'), ('Qua', 'Quarterly'), ('Csd', 'Custom specific dates')], default='Mon', max_length=3, verbose_name='Frequency of reporting'),
        ),
        migrations.AlterField(
            model_name='progressreport',
            name='status',
            field=models.CharField(choices=[('Due', 'Due'), ('Ove', 'Overdue'), ('Sub', 'Submitted'), ('Sen', 'Sent back'), ('Acc', 'Accepted')], default='Due', max_length=3),
        ),
    ]
