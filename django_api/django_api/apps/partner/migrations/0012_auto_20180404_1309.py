# -*- coding: utf-8 -*-
# Generated by Django 1.11.11 on 2018-04-04 13:09
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('partner', '0011_auto_20180404_1135'),
    ]

    operations = [
        migrations.AlterField(
            model_name='partnerproject',
            name='description',
            field=models.TextField(blank=True, max_length=5120, null=True),
        ),
    ]
