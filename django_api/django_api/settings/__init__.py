from importlib import import_module

from .base import *

overrides = import_module('django_api.settings.{}'.format(ENV))

# apply imported overrides
for attr in dir(overrides):
    # we only want to imports settings (which have to be variables in ALLCAPS)
    if attr.isupper():
        # update our scope with the imported variables. We use globals() instead of locals()
        # because locals() is readonly and it returns a copy of itself upon
        # assignment.
        globals()[attr] = getattr(overrides, attr)
