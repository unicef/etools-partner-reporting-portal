# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-09-20 19:07
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_auto_20170918_2336'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='gatewaytype',
            name='workspace',
        ),
        migrations.AddField(
            model_name='gatewaytype',
            name='country',
            field=models.ForeignKey(default=-1, on_delete=django.db.models.deletion.CASCADE, related_name='gateway_types', to='core.Country'),
            preserve_default=False,
        ),
    ]
