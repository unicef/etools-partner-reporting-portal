# Generated by Django 3.2.6 on 2022-02-11 18:47

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0016_auto_20220211_1812'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='location',
            unique_together={('name', 'p_code', 'admin_level')},
        ),
    ]
