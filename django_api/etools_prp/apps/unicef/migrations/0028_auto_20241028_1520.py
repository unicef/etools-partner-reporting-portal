# Generated by Django 3.2.15 on 2024-10-28 15:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('unicef', '0027_progressreport_accepted_comment'),
    ]

    operations = [
        migrations.AlterField(
            model_name='programmedocument',
            name='document_type',
            field=models.CharField(choices=[('PD', 'Programme Document'), ('SPD', 'Simplified Programme Document'), ('SHP', 'Simplified Humanitarian Programme Document'), ('SSFA', 'SSFA'), ('GDD', 'Government Digital Document')], default='PD', max_length=4, verbose_name='Document Type'),
        ),
        migrations.AlterField(
            model_name='programmedocument',
            name='status',
            field=models.CharField(choices=[('draft', 'Development'), ('review', 'Review'), ('signature', 'Signature'), ('signed', 'Signed'), ('pending_approval', 'Pending Approval'), ('approved', 'Approved'), ('active', 'Active'), ('cancelled', 'Cancelled'), ('ended', 'Ended'), ('closed', 'Closed'), ('suspended', 'Suspended'), ('terminated', 'Terminated'), ('expired', 'Expired')], default='draft', max_length=256, verbose_name='PD/SSFA status'),
        ),
    ]
