# Generated by Django 1.11.20 on 2019-05-22 17:59
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cluster', '0002_auto_20180711_2325'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cluster',
            name='external_source',
            field=models.TextField(blank=True, choices=[('HPC', 'HPC'), ('OPS', 'OPS'), ('UNICEF', 'UNICEF')], null=True),
        ),
        migrations.AlterField(
            model_name='clusteractivity',
            name='external_source',
            field=models.TextField(blank=True, choices=[('HPC', 'HPC'), ('OPS', 'OPS'), ('UNICEF', 'UNICEF')], null=True),
        ),
        migrations.AlterField(
            model_name='clusterobjective',
            name='external_source',
            field=models.TextField(blank=True, choices=[('HPC', 'HPC'), ('OPS', 'OPS'), ('UNICEF', 'UNICEF')], null=True),
        ),
    ]
