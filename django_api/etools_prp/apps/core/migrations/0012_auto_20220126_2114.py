# Generated by Django 3.2.6 on 2022-01-26 21:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0011_auto_20220126_1508'),
    ]

    operations = [
        migrations.AddField(
            model_name='location',
            name='admin_level',
            field=models.SmallIntegerField(default=-1, verbose_name='Admin Level'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='location',
            name='admin_level_name',
            field=models.CharField(default=1, max_length=64, verbose_name='Admin Level Name'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='location',
            name='workspaces',
            field=models.ManyToManyField(related_name='locations', to='core.Workspace'),
        ),
        migrations.AddField(
            model_name='cartodbtable',
            name='admin_level',
            field=models.SmallIntegerField(default=-1, verbose_name='Admin Level'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='cartodbtable',
            name='admin_level_name',
            field=models.CharField(default=1, max_length=64, verbose_name='Admin level name'),
            preserve_default=False,
        ),
    ]