# Generated by Django 3.2.6 on 2021-09-24 17:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('unicef', '0020_auto_20201119_1905'),
    ]

    operations = [
        migrations.AddField(
            model_name='section',
            name='external_business_area_code',
            field=models.CharField(blank=True, help_text='A Workspace business area code as unique constraint factor', max_length=32, null=True),
        ),
        migrations.AlterUniqueTogether(
            name='section',
            unique_together={('external_id', 'external_business_area_code')},
        ),
    ]