# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2018-03-01 07:36
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cluster', '0005_remove_clusteractivity_standard'),
    ]

    operations = [
        migrations.AddField(
            model_name='cluster',
            name='external_id',
            field=models.CharField(blank=True, help_text='An ID representing this instance in an external system', max_length=32, null=True),
        ),
        migrations.AddField(
            model_name='cluster',
            name='external_source',
            field=models.TextField(blank=True, choices=[('HPC', 'HPC'), ('OPS', 'OPS')], null=True),
        ),
        migrations.AddField(
            model_name='cluster',
            name='external_url',
            field=models.URLField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='cluster',
            name='type',
            field=models.TextField(max_length=512),
        ),
    ]
