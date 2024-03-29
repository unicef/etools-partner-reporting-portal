# Generated by Django 3.2.15 on 2022-11-21 14:17
import logging

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import model_utils.fields


def fwd_migrate_to_user_realms(apps, schema_editor):
    User = apps.get_model('account', 'User')
    Group = apps.get_model('auth', 'Group')
    Realm = apps.get_model('core', 'Realm')
    realm_list = []
    for user in User.objects.all():
        if not user.partner:
            logging.info(f'User {user.id} {user.email} has not partner set. Skipping..')
            continue
        for prp_role in user.prp_roles.all():
            realm_list.append(dict(
                user_id=user.id,
                workspace_id=prp_role.workspace.id,
                partner_id=user.partner.id,
                group_id=Group.objects.get_or_create(name=prp_role.role)[0].id,
                is_active=prp_role.is_active
            ))
        user.workspace = prp_role.workspace
        user.save(update_fields=['workspace'])
    unique_realms = [dict(t) for t in {tuple(sorted(d.items())) for d in realm_list}]
    Realm.objects.bulk_create([Realm(**realm_dict) for realm_dict in unique_realms])


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('auth', '0012_alter_user_first_name_max_length'),
        ('partner', '0010_alter_partnerproject_type'),
        ('core', '0019_delete_cartodbtable'),
    ]

    operations = [
        migrations.CreateModel(
            name='Realm',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('external_id', models.CharField(blank=True, help_text='An ID representing this instance in an external system', max_length=32, null=True)),
                ('is_active', models.BooleanField(default=True, verbose_name='Active')),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='realms', to='auth.group')),
                ('partner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='realms', to='partner.partner')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='realms', to=settings.AUTH_USER_MODEL)),
                ('workspace', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='realms', to='core.workspace')),
            ],
        ),
        migrations.AddIndex(
            model_name='realm',
            index=models.Index(fields=['user', 'workspace', 'partner'], name='core_realm_user_id_a88561_idx'),
        ),
        migrations.AddConstraint(
            model_name='realm',
            constraint=models.UniqueConstraint(fields=('user', 'workspace', 'partner', 'group'), name='unique_realm'),
        ),
        migrations.RunPython(fwd_migrate_to_user_realms, migrations.RunPython.noop),

    ]
