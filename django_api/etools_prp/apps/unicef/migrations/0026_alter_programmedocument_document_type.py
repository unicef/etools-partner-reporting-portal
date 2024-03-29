# Generated by Django 3.2.15 on 2023-04-26 06:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('unicef', '0025_auto_20230313_1645'),
    ]

    operations = [
        migrations.AlterField(
            model_name='programmedocument',
            name='document_type',
            field=models.CharField(choices=[('PD', 'Programme Document'), ('SPD', 'Simplified Programme Document'), ('SHP', 'Simplified Humanitarian Programme Document'), ('SSFA', 'SSFA')], default='PD', max_length=4, verbose_name='Document Type'),
        ),
    ]
