# Generated by Django 3.2.5 on 2021-08-05 01:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('partner', '0009_auto_20200630_1417'),
    ]

    operations = [
        migrations.AlterField(
            model_name='partnerproject',
            name='type',
            field=models.CharField(blank=True, choices=[('HRP', 'HRP'), ('FA', 'FA'), ('OTHER', 'Other')], help_text='Is this project part of an HRP or FA?', max_length=8, null=True, verbose_name='Plan Type'),
        ),
    ]