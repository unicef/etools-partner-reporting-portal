# Generated by Django 1.11.20 on 2020-06-09 18:09
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('partner', '0007_auto_20200520_1833'),
    ]

    operations = [
        migrations.AddField(
            model_name='partner',
            name='sea_risk_rating_name',
            field=models.CharField(
                max_length=150,
                verbose_name="PSEA Risk Rating",
                blank=True,
                default='',
            ),
        ),
        migrations.AddField(
            model_name='partner',
            name='psea_assessment_date',
            field=models.DateTimeField(
                verbose_name="Last PSEA Assess. Date",
                null=True,
                blank=True,
            ),
        ),
        migrations.AddField(
            model_name='partner',
            name='overall_risk_rating',
            field=models.CharField(
                max_length=50,
                blank=True,
                default='',
            ),
        ),
    ]