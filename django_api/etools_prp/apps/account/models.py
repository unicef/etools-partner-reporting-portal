from django.conf import settings
from django.contrib.auth.models import AbstractUser, Group
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.signals import post_save
from django.utils.functional import cached_property

from model_utils.models import TimeStampedModel

from etools_prp.apps.core.common import PRP_ROLE_TYPES, USER_TYPES
from etools_prp.apps.core.models import Workspace
from etools_prp.apps.partner.models import Partner
from etools_prp.apps.utils.emails import send_email_from_template


class User(AbstractUser):
    """
    User model inherited after AbstractUser class.

    related models:
        partner.Partner (ForeignKey): "partner"
    """
    first_name = models.CharField(max_length=150)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=150)
    # current workspace
    workspace = models.ForeignKey(
        'core.Workspace',
        related_name="users",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    # current partner in current workspace
    partner = models.ForeignKey(
        'partner.Partner',
        related_name="users",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    # TODO REALMS clean up
    organization = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        unique=True,
        db_index=True
    )
    position = models.CharField(max_length=64, null=True, blank=True, default=None)

    def __str__(self):
        return '[{}] {} ({})'.format(
            self.pk, self.get_fullname(), self.username
        )

    def get_fullname(self):
        return ' '.join(filter(None, [self.first_name, self.last_name]))

    @property
    def display_name(self):
        full_name = self.get_fullname()
        return full_name + ' ({})'.format(self.email) if full_name else self.email

    @cached_property
    def is_unicef(self):
        return self.username == getattr(settings, 'DEFAULT_UNICEF_USER', None)

    @classmethod
    def lock_password_if_new(cls, sender, instance, created, **kwargs):
        if created:
            instance.set_unusable_password()
            instance.save()

    @property
    def prp_roles(self):
        return Group.objects\
            .filter(
                realms__user=self,
                realms__workspace=self.workspace,
                realms__partner=self.partner,
                realms__is_active=True)\
            .distinct()

    @cached_property
    def role_list(self):
        return self.prp_roles.values_list('name', flat=True)

    @cached_property
    def workspaces_available(self):
        return Workspace.objects.user_workspaces(self).distinct()

    @cached_property
    def partners_available(self):
        if self.workspace:
            return Partner.objects.filter(
                realms__workspace=self.workspace,
                realms__user=self,
                realms__is_active=True).distinct()

    @property
    def user_type(self):
        user_prp_roles = set(prp_role for prp_role in self.role_list)
        if PRP_ROLE_TYPES.cluster_system_admin in user_prp_roles:
            return USER_TYPES.cluster_admin
        if PRP_ROLE_TYPES.cluster_imo in user_prp_roles:
            return USER_TYPES.imo
        if {PRP_ROLE_TYPES.cluster_member,
            PRP_ROLE_TYPES.cluster_viewer,
            PRP_ROLE_TYPES.cluster_coordinator,
            PRP_ROLE_TYPES.ip_viewer,
            PRP_ROLE_TYPES.ip_editor,
            PRP_ROLE_TYPES.ip_admin,
            PRP_ROLE_TYPES.ip_authorized_officer} \
                .intersection(user_prp_roles):
            return USER_TYPES.partner

    @cached_property
    def is_cluster_system_admin(self):
        return self.old_prp_roles.filter(role=PRP_ROLE_TYPES.cluster_system_admin).exists()

    def send_email_notification_on_create(self, portal=None):
        template_data = {
            'user': self,
            'portal_url': settings.FRONTEND_HOST,
            'portal': portal
        }
        to_email_list = [self.email]
        content_subtype = 'html'

        subject_template_path = 'emails/on_create_user_subject.txt'
        body_template_path = 'emails/on_create_user.html'

        send_email_from_template(
            subject_template_path=subject_template_path,
            body_template_path=body_template_path,
            template_data=template_data,
            to_email_list=to_email_list,
            content_subtype=content_subtype
        )
        return True

    def save(self, *args, **kwargs):
        if self.email != self.email.lower():
            raise ValidationError("Email must be lowercase.")
        super().save(*args, **kwargs)


# TODO REALMS clean up
class UserProfile(TimeStampedModel):
    """
    User Profile model related with user as profile.

    related models:
        account.User (OneToOne): "user"
    """
    user = models.OneToOneField(
        User,
        related_name="profile",
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return "{} - Profile".format(self.user.get_fullname())

    @classmethod
    def create_user_profile(cls, sender, instance, created, **kwargs):
        """
        Signal handler to create user profiles automatically
        """
        if created:
            cls.objects.create(user=instance)


post_save.connect(UserProfile.create_user_profile, sender=User)
post_save.connect(User.lock_password_if_new, sender=User)
