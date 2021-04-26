from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Disaggregation, DisaggregationValue


@receiver(post_save,
          sender=Disaggregation,
          dispatch_uid="disable_disagg_value")
def disable_disagg_value(sender, instance, **kwargs):
    """
    If Disaggregation has been marked as inactive then mark all the
    Disaggregation values associated with it as inactive as well.
    """
    if not instance.active:
        DisaggregationValue.objects.filter(disaggregation=instance).update(
            active=False)
