# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-05-09 16:09
from __future__ import unicode_literals

import django.contrib.postgres.fields.jsonb
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reporting', '0002_auto_20170419_2023'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='reportable',
            name='in_need',
        ),
        migrations.RemoveField(
            model_name='reportable',
            name='report_description',
        ),
        migrations.RemoveField(
            model_name='reportable',
            name='title',
        ),
        migrations.RemoveField(
            model_name='reportable',
            name='type',
        ),
        migrations.AddField(
            model_name='indicatorblueprint',
            name='code',
            field=models.CharField(blank=True, max_length=50, null=True, unique=True),
        ),
        migrations.AddField(
            model_name='indicatorblueprint',
            name='description',
            field=models.CharField(blank=True, max_length=3072, null=True),
        ),
        migrations.AddField(
            model_name='indicatorblueprint',
            name='disaggregatable',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='indicatorblueprint',
            name='subdomain',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='indicatorblueprint',
            name='unit',
            field=models.CharField(choices=[('number', 'number'), ('percentage', 'percentage'), ('yesno', 'yesno')], default='number', max_length=10),
        ),
        migrations.AddField(
            model_name='reportable',
            name='assumptions',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='reportable',
            name='context_code',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='Code in current context'),
        ),
        migrations.AddField(
            model_name='reportable',
            name='disaggregation_logic',
            field=django.contrib.postgres.fields.jsonb.JSONField(null=True),
        ),
        migrations.AddField(
            model_name='reportable',
            name='means_of_verification',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='reportable',
            name='total',
            field=models.IntegerField(blank=True, default=0, null=True, verbose_name='Current Total'),
        ),
        migrations.AlterField(
            model_name='indicatorblueprint',
            name='name',
            field=models.CharField(max_length=1024),
        ),
        migrations.AlterField(
            model_name='reportable',
            name='baseline',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='reportable',
            name='target',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
