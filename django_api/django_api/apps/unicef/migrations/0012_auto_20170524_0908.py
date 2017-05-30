# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-05-24 09:08
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('unicef', '0011_auto_20170524_0824'),
    ]

    operations = [
        migrations.AlterField(
            model_name='programmedocument',
            name='status',
            field=models.CharField(choices=[('Dra', 'Draft'), ('Act', 'Active'), ('Imp', 'Implemented'), ('Sus', 'Suspended'), ('Ter', 'Terminated'), ('Can', 'Cancelled')], max_length=256, verbose_name='PD/SSFA status'),
        ),
    ]
