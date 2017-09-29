# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2017-09-27 20:29
from __future__ import unicode_literals

import django.contrib.postgres.fields
import django.contrib.postgres.fields.jsonb
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('indicator', '0003_auto_20170925_0734'),
    ]

    operations = [
        migrations.AlterField(
            model_name='reportable',
            name='location_admin_refs',
            field=django.contrib.postgres.fields.ArrayField(base_field=django.contrib.postgres.fields.jsonb.JSONField(), blank=True, default=list, null=True, size=None),
        ),
    ]
