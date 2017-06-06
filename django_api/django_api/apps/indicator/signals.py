from __future__ import unicode_literals
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import DisaggregationValue, Disaggregation


@receiver(post_save, sender=Disaggregation, dispatch_uid="disable_disagg_value")
def disable_disagg_value(sender, instance, **kwargs):
    if instance.active is False:
        DisaggregationValue.objects.filter(disaggregation=instance).update(active=False)
