# -*- coding: utf-8 -*-
# Generated by Django 1.11.11 on 2018-07-23 23:09
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_auto_20180723_2254'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='gatewaytype',
            unique_together=set([('country', 'admin_level')]),
        ),
    ]
