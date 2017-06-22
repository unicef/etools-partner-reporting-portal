# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-06-01 18:30
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_auto_20170601_1853'),
    ]

    operations = [
        migrations.AlterField(
            model_name='location',
            name='reportable',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='locations', to='indicator.Reportable'),
        ),
    ]
