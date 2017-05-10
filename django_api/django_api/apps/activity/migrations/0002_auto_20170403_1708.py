# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-04-03 17:08
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('reporting', '0001_initial'),
        ('core', '0001_initial'),
        ('activity', '0001_initial'),
        ('cluster', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='partneractivity',
            name='partner',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='partner_activities', to='core.Partner'),
        ),
        migrations.AddField(
            model_name='partneractivity',
            name='project',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='partner_activities', to='reporting.Project'),
        ),
        migrations.AddField(
            model_name='activity',
            name='cluster',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='activities', to='cluster.Cluster'),
        ),
        migrations.AddField(
            model_name='activity',
            name='cluster_objective',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='activities', to='cluster.ClusterObjective'),
        ),
        migrations.AddField(
            model_name='activity',
            name='location',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='activities', to='core.Location'),
        ),
        migrations.AddField(
            model_name='activity',
            name='project',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='activities', to='reporting.Project'),
        ),
    ]
