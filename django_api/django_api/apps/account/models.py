from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import AbstractUser

from core.models import Partner


class User(AbstractUser):
    partner = models.ForeignKey(Partner, related_name="users")
    organization = models.CharField(max_length=255)

    def __str__(self):
        return "{} - User".format(self.get_fullname())


# Create your models here.
class UserProfile(models.Model):
    user = models.OneToOneField(User, related_name="profile")

    def __str__(self):
        return "{} - Profile".format(self.user.get_fullname())
