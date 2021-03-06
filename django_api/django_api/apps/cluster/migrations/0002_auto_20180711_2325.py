# Generated by Django 1.11.11 on 2018-07-11 23:25
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('cluster', '0001_initial'),
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='clusterobjective',
            name='locations',
            field=models.ManyToManyField(related_name='cluster_objectives', to='core.Location'),
        ),
        migrations.AddField(
            model_name='clusteractivity',
            name='cluster_objective',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='cluster_activities', to='cluster.ClusterObjective'),
        ),
        migrations.AddField(
            model_name='clusteractivity',
            name='locations',
            field=models.ManyToManyField(related_name='cluster_activities', to='core.Location'),
        ),
        migrations.AddField(
            model_name='cluster',
            name='response_plan',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='clusters', to='core.ResponsePlan'),
        ),
        migrations.AlterUniqueTogether(
            name='clusterobjective',
            unique_together=set([('external_id', 'external_source')]),
        ),
        migrations.AlterUniqueTogether(
            name='clusteractivity',
            unique_together=set([('external_id', 'external_source')]),
        ),
        migrations.AlterUniqueTogether(
            name='cluster',
            unique_together=set([('external_id', 'external_source'), ('type', 'imported_type', 'response_plan')]),
        ),
    ]
