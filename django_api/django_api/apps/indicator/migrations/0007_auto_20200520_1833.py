# Generated by Django 2.2.12 on 2020-05-20 18:33

import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion
import indicator.models


class Migration(migrations.Migration):

    dependencies = [
        ('indicator', '0006_auto_20191106_2334'),
    ]

    operations = [
        migrations.AlterField(
            model_name='indicatorreport',
            name='parent',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='children', to='indicator.IndicatorReport'),
        ),
        migrations.AlterField(
            model_name='indicatorreport',
            name='total',
            field=django.contrib.postgres.fields.jsonb.JSONField(default=indicator.models.default_total),
        ),
        migrations.AlterField(
            model_name='reportable',
            name='baseline',
            field=django.contrib.postgres.fields.jsonb.JSONField(default=indicator.models.default_value),
        ),
        migrations.AlterField(
            model_name='reportable',
            name='ca_indicator_used_by_reporting_entity',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ca_indicators_re', to='indicator.Reportable'),
        ),
        migrations.AlterField(
            model_name='reportable',
            name='parent_indicator',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='children', to='indicator.Reportable'),
        ),
        migrations.AlterField(
            model_name='reportable',
            name='target',
            field=django.contrib.postgres.fields.jsonb.JSONField(default=indicator.models.default_value),
        ),
        migrations.AlterField(
            model_name='reportable',
            name='total',
            field=django.contrib.postgres.fields.jsonb.JSONField(default=indicator.models.default_total),
        ),
        migrations.AlterField(
            model_name='reportablelocationgoal',
            name='baseline',
            field=django.contrib.postgres.fields.jsonb.JSONField(default=indicator.models.default_value),
        ),
        migrations.AlterField(
            model_name='reportablelocationgoal',
            name='target',
            field=django.contrib.postgres.fields.jsonb.JSONField(default=indicator.models.default_value),
        ),
    ]
