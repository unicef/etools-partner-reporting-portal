from django.core.management.base import BaseCommand

from etools_prp.apps.account.models import User


class Command(BaseCommand):
    help = 'Creates a set of ORM objects for initial data'

    def handle(self, *args, **options):
        admin_password = 'Passw0rd!'

        # Cluster admin creation
        sys_admin, _ = User.objects.get_or_create(username='cluster_admin', defaults={
            'email': 'cluster_admin@example.com',
            'is_superuser': True,
            'is_staff': True,
            'first_name': 'Cluster',
            'last_name': 'Admin',
        })
        sys_admin.set_password(admin_password)
        sys_admin.save()
