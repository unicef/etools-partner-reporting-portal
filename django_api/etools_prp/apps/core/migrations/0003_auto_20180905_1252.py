# Generated by Django 1.11.11 on 2018-09-05 12:52
from django.db import migrations, models
import django.db.models.deletion
import mptt.fields


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_prprole_is_active'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='cartodbtable',
            name='api_key',
        ),
        migrations.RemoveField(
            model_name='location',
            name='created',
        ),
        migrations.RemoveField(
            model_name='location',
            name='modified',
        ),
        migrations.AddField(
            model_name='cartodbtable',
            name='display_name',
            field=models.CharField(blank=True, default='', max_length=254, verbose_name='Display Name'),
        ),
        migrations.AddField(
            model_name='cartodbtable',
            name='name_col',
            field=models.CharField(default='name', max_length=254, verbose_name='Name Column'),
        ),
        migrations.AddField(
            model_name='cartodbtable',
            name='parent_code_col',
            field=models.CharField(blank=True, default='', max_length=254, verbose_name='Parent Code Column'),
        ),
        migrations.AddField(
            model_name='cartodbtable',
            name='pcode_col',
            field=models.CharField(default='pcode', max_length=254, verbose_name='Pcode Column'),
        ),
        migrations.AddField(
            model_name='location',
            name='level',
            field=models.PositiveIntegerField(db_index=True, default=0, editable=False),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='location',
            name='lft',
            field=models.PositiveIntegerField(db_index=True, default=0, editable=False),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='location',
            name='rght',
            field=models.PositiveIntegerField(db_index=True, default=0, editable=False),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='location',
            name='tree_id',
            field=models.PositiveIntegerField(db_index=True, default=0, editable=False),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='cartodbtable',
            name='domain',
            field=models.CharField(max_length=254, verbose_name='Domain'),
        ),
        migrations.AlterField(
            model_name='cartodbtable',
            name='location_type',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.GatewayType', verbose_name='Location Type'),
        ),
        migrations.AlterField(
            model_name='cartodbtable',
            name='parent',
            field=mptt.fields.TreeForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='children', to='core.CartoDBTable', verbose_name='Parent'),
        ),
        migrations.AlterField(
            model_name='cartodbtable',
            name='table_name',
            field=models.CharField(max_length=254, verbose_name='Table Name'),
        ),
        migrations.AlterField(
            model_name='gatewaytype',
            name='admin_level',
            field=models.PositiveSmallIntegerField(verbose_name='Admin Level'),
        ),
        migrations.AlterField(
            model_name='gatewaytype',
            name='name',
            field=models.CharField(max_length=64, unique=True, verbose_name='Name'),
        ),
        migrations.AlterField(
            model_name='location',
            name='parent',
            field=mptt.fields.TreeForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='children', to='core.Location', verbose_name='Parent'),
        ),
        migrations.AlterUniqueTogether(
            name='gatewaytype',
            unique_together=set([('country', 'admin_level')]),
        ),
    ]