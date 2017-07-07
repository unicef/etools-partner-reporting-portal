# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-06-20 00:01
from __future__ import unicode_literals

import django.contrib.postgres.fields.jsonb
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('indicator', '0009_auto_20170531_1030'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='indicatorreport',
            name='total'
        ),
        migrations.RemoveField(
            model_name='reportable',
            name='total'
        ),
        migrations.AddField(
            model_name='indicatorreport',
            name='total',
            field=django.contrib.postgres.fields.jsonb.JSONField(default={'c': 0, 'd': 0, 'v': 0}),
        ),
        migrations.AddField(
            model_name='reportable',
            name='total',
            field=django.contrib.postgres.fields.jsonb.JSONField(default={'c': 0, 'd': 0, 'v': 0}),
        ),
    ]
