# Generated by Django 3.2.15 on 2022-11-22 11:36

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('cluster', '0005_auto_20191217_0058'),
        ('core', '0020_realms'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='PRPRole',
            new_name='PRPRoleOld',
        ),
        migrations.AlterField(
            model_name='prproleold',
            name='cluster',
            field=models.ForeignKey(blank=True, null=True,
                                    on_delete=django.db.models.deletion.CASCADE,
                                    related_name='old_prp_roles', to='cluster.cluster'),
        ),
        migrations.AlterField(
            model_name='prproleold',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                                    related_name='old_prp_roles', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='prproleold',
            name='workspace',
            field=models.ForeignKey(blank=True, null=True,
                                    on_delete=django.db.models.deletion.CASCADE,
                                    related_name='old_prp_roles', to='core.workspace'),
        ),
    ]